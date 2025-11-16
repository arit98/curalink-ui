import * as pdfjsLib from 'pdfjs-dist';
import axios from 'axios';
import { getApiBaseUrl } from './apiConfig';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export interface PDFMetadata {
  title?: string;
  authors?: string;
  journal?: string;
  year?: string;
  abstract?: string;
  fullAbstract?: string;
  doi?: string;
  tags?: string[];
  introduction?: string;
  results?: string;
  conclusion?: string;
}

/**
 * Extracts text content from a PDF file
 */
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

/**
 * Uses backend API to extract structured information from text using ML
 * The backend proxies the request to Hugging Face API to avoid CORS issues
 */
async function extractMetadataWithHuggingFace(text: string): Promise<Partial<PDFMetadata>> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const model = import.meta.env.VITE_HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';

    // Limit text to avoid token limits (most models have 4k-8k context)
    // Use more text to capture introduction, results, and conclusions
    const textChunk = text.substring(0, 6000);

    const prompt = `You are a research paper metadata extractor. Extract the following information from this research paper text and return ONLY a valid JSON object with no additional text.

IMPORTANT: Pay special attention to extracting the introduction, results, and conclusion sections. These are critical fields.

Required fields:
- title: string (paper title)
- authors: string (comma-separated author names)
- journal: string (journal or conference name)
- year: string (4-digit year)
- abstract: string (brief abstract, max 500 chars)
- doi: string (DOI if present)
- tags: array of strings (keywords/tags)
- introduction: string (the full introduction section content, typically found after abstract and before methods, max 2000 chars)
- results: string (the results or key findings section, typically found after methods, max 2000 chars)
- conclusion: string (the conclusion section, typically found near the end before references, max 2000 chars)

If a field is not found, use null for that field. Make sure to extract introduction, results, and conclusion sections even if they are not explicitly labeled.

Research Paper Text:
${textChunk}

JSON Response:`;

    console.log('[ML Extraction] Sending request to backend API...');
    
    let data;
    try {
      const response = await axios.post(`${apiBaseUrl}/pdf/extract-metadata`, {
        model: model,
        prompt: prompt,
        text: textChunk,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      data = response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const errorText = error.response?.data || error.message;
      let errorMessage = `Backend API error: ${status || 'Unknown'} - ${errorText}`;
      
      // Handle specific error cases
      if (status === 503) {
        errorMessage += '\nModel is loading. Please wait a moment and try again.';
      } else if (status === 401) {
        errorMessage += '\nInvalid API key. Please check your backend configuration.';
      } else if (status === 404) {
        errorMessage += `\nBackend endpoint not found. Please ensure the backend is running and the endpoint exists.`;
      }
      
      console.warn(`[ML Extraction] ${errorMessage}`);
      return {};
    }
    console.log('[ML Extraction] Received response from backend API');

    // Handle model loading errors
    if (data.error) {
      console.warn(`[ML Extraction] Model error: ${data.error}`);
      if (data.estimated_time) {
        console.warn(`[ML Extraction] Model is loading. Estimated time: ${data.estimated_time}s`);
      }
      return {};
    }

    // The backend should return the extracted metadata directly
    if (data.metadata) {
      console.log('[ML Extraction] Successfully received metadata from backend');
      const sanitized = sanitizeMetadata(data.metadata);
      console.log(`[ML Extraction] Extracted fields: ${Object.keys(sanitized).join(', ')}`);
      return sanitized;
    }

    // Fallback: try to parse if backend returns raw response
    let extractedText = '';
    if (data.generated_text) {
      extractedText = data.generated_text;
    } else if (data.text) {
      extractedText = data.text;
    } else if (typeof data === 'string') {
      extractedText = data;
    } else if (Array.isArray(data) && data[0]?.generated_text) {
      extractedText = data[0].generated_text;
    }

    if (!extractedText) {
      console.warn('[ML Extraction] No text extracted from backend response');
      console.warn('[ML Extraction] Response structure:', JSON.stringify(data, null, 2).substring(0, 500));
      return {};
    }

    console.log(`[ML Extraction] Extracted text length: ${extractedText.length} chars`);

    // Try to parse JSON from the response
    try {
      // Clean the text - remove markdown code blocks if present
      let cleanedText = extractedText.trim();
      cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

      // Extract JSON object from the text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const metadata = JSON.parse(jsonMatch[0]);
        console.log('[ML Extraction] Successfully parsed JSON metadata');
        const sanitized = sanitizeMetadata(metadata);
        console.log(`[ML Extraction] Extracted fields: ${Object.keys(sanitized).join(', ')}`);
        return sanitized;
      } else {
        console.warn('[ML Extraction] No JSON object found in response');
        console.warn('[ML Extraction] Response text:', extractedText.substring(0, 500));
      }
    } catch (parseError: any) {
      console.warn('[ML Extraction] Failed to parse JSON from backend response:', parseError.message);
      console.warn('[ML Extraction] Response text:', extractedText.substring(0, 500));
    }

    // If JSON parsing fails, return empty object to use fallback
    console.warn('[ML Extraction] Falling back to regex extraction');
    return {};
  } catch (error: any) {
    console.error('[ML Extraction] Error calling backend API:', error);
    console.error('[ML Extraction] Error details:', error.message);
    // Return empty object to trigger fallback extraction
    return {};
  }
}

/**
 * Fallback method: Uses regex patterns to extract metadata from PDF text
 */
function extractMetadataFallback(text: string): Partial<PDFMetadata> {
  const metadata: Partial<PDFMetadata> = {};

  // Extract title (usually first line or after "Title:")
  const titleMatch = text.match(/^(?:Title:?\s*)?([A-Z][^\n]{10,200})/i) ||
    text.match(/^([A-Z][A-Za-z\s:,-]{10,200})/);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim().replace(/^Title:?\s*/i, '');
  }

  // Extract authors (look for "Author(s):", "Authors:", or patterns like "Name1, Name2")
  const authorPatterns = [
    /(?:Author(?:s)?:?\s*)([^\n]+)/i,
    /(?:By:?\s*)([^\n]+)/i,
    /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s*,\s*[A-Z][a-z]+\s+[A-Z][a-z]+)*)/,
  ];

  for (const pattern of authorPatterns) {
    const match = text.match(pattern);
    if (match && match[1].length > 5) {
      metadata.authors = match[1].trim();
      break;
    }
  }

  // Extract journal (look for "Journal:", "Published in:", etc.)
  const journalPatterns = [
    /(?:Journal:?\s*)([^\n]+)/i,
    /(?:Published in:?\s*)([^\n]+)/i,
    /(?:In:?\s*)([A-Z][^\n]{5,100})/,
  ];

  for (const pattern of journalPatterns) {
    const match = text.match(pattern);
    if (match) {
      metadata.journal = match[1].trim();
      break;
    }
  }

  // Extract year (4-digit year, typically between 1900-2100)
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    metadata.year = yearMatch[0];
  }

  // Extract DOI
  const doiMatch = text.match(/DOI:?\s*(10\.\d+\/[^\s]+)/i) ||
    text.match(/(10\.\d+\/[^\s]+)/);
  if (doiMatch) {
    metadata.doi = doiMatch[1].trim();
  }

  // Extract abstract (look for "Abstract" section)
  const abstractPatterns = [
    /(?:Abstract:?\s*)([\s\S]{50,2000}?)(?:\n\s*(?:Introduction|Keywords|1\.|Background|Methods):)/i,
    /(?:Abstract:?\s*)([\s\S]{50,2000}?)(?:\n\n)/i,
    /(?:Abstract:?\s*)([\s\S]{50,2000})/i,
  ];

  for (const pattern of abstractPatterns) {
    const match = text.match(pattern);
    if (match) {
      const abstractText = match[1].trim();
      metadata.abstract = abstractText.substring(0, 500); // First 500 chars
      metadata.fullAbstract = abstractText;
      break;
    }
  }

  // Extract introduction (look for "Introduction" section with more flexible patterns)
  const introPatterns = [
    /(?:Introduction:?\s*|1\.\s*Introduction:?\s*|INTRODUCTION:?\s*)([\s\S]{100,5000}?)(?:\n\s*(?:Methods|Methodology|2\.|Results|Background|Materials|Experimental):)/i,
    /(?:Introduction:?\s*|1\.\s*Introduction:?\s*|INTRODUCTION:?\s*)([\s\S]{100,5000}?)(?:\n\n\s*[A-Z][A-Z\s]{3,}\s*:)/,
    /(?:Introduction:?\s*|1\.\s*Introduction:?\s*|INTRODUCTION:?\s*)([\s\S]{100,5000})/i,
  ];

  for (const pattern of introPatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim().length > 50) {
      metadata.introduction = match[1].trim().substring(0, 2000);
      break;
    }
  }

  // Extract results (look for "Results" section with more flexible patterns)
  const resultsPatterns = [
    /(?:Results:?\s*|3\.\s*Results:?\s*|RESULTS:?\s*|Key\s+Results:?\s*)([\s\S]{100,5000}?)(?:\n\s*(?:Discussion|Conclusion|4\.|5\.|Summary):)/i,
    /(?:Results:?\s*|3\.\s*Results:?\s*|RESULTS:?\s*|Key\s+Results:?\s*)([\s\S]{100,5000}?)(?:\n\n\s*[A-Z][A-Z\s]{3,}\s*:)/,
    /(?:Results:?\s*|3\.\s*Results:?\s*|RESULTS:?\s*|Key\s+Results:?\s*)([\s\S]{100,5000})/i,
  ];

  for (const pattern of resultsPatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim().length > 50) {
      metadata.results = match[1].trim().substring(0, 2000);
      break;
    }
  }

  // Extract conclusion (look for "Conclusion" section with more flexible patterns)
  const conclusionPatterns = [
    /(?:Conclusion:?\s*|5\.\s*Conclusion:?\s*|CONCLUSION:?\s*|Conclusions:?\s*)([\s\S]{100,5000}?)(?:\n\s*(?:References|Acknowledgments|Acknowledgements|Bibliography|Appendix):)/i,
    /(?:Conclusion:?\s*|5\.\s*Conclusion:?\s*|CONCLUSION:?\s*|Conclusions:?\s*)([\s\S]{100,5000}?)(?:\n\n\s*(?:References|Acknowledgments|Acknowledgements|Bibliography|Appendix):)/i,
    /(?:Conclusion:?\s*|5\.\s*Conclusion:?\s*|CONCLUSION:?\s*|Conclusions:?\s*)([\s\S]{100,5000})/i,
  ];

  for (const pattern of conclusionPatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim().length > 50) {
      metadata.conclusion = match[1].trim().substring(0, 2000);
      break;
    }
  }

  // Extract tags/keywords
  const keywordsMatch = text.match(/(?:Keywords?:?\s*|Key\s+words:?\s*)([^\n]+)/i);
  if (keywordsMatch) {
    const keywords = keywordsMatch[1]
      .split(/[,;]/)
      .map(k => k.trim())
      .filter(k => k.length > 0);
    if (keywords.length > 0) {
      metadata.tags = keywords;
    }
  }

  return metadata;
}

/**
 * Sanitizes and validates extracted metadata
 */
function sanitizeMetadata(metadata: any): Partial<PDFMetadata> {
  const sanitized: Partial<PDFMetadata> = {};

  if (metadata.title && typeof metadata.title === 'string') {
    sanitized.title = metadata.title.trim().substring(0, 500);
  }

  if (metadata.authors && typeof metadata.authors === 'string') {
    sanitized.authors = metadata.authors.trim().substring(0, 500);
  }

  if (metadata.journal && typeof metadata.journal === 'string') {
    sanitized.journal = metadata.journal.trim().substring(0, 200);
  }

  if (metadata.year) {
    const yearStr = String(metadata.year).trim();
    if (/^\d{4}$/.test(yearStr)) {
      sanitized.year = yearStr;
    }
  }

  if (metadata.abstract && typeof metadata.abstract === 'string') {
    sanitized.abstract = metadata.abstract.trim().substring(0, 500);
    sanitized.fullAbstract = metadata.abstract.trim().substring(0, 5000);
  }

  if (metadata.fullAbstract && typeof metadata.fullAbstract === 'string') {
    sanitized.fullAbstract = metadata.fullAbstract.trim().substring(0, 5000);
  }

  if (metadata.doi && typeof metadata.doi === 'string') {
    sanitized.doi = metadata.doi.trim();
  }

  if (metadata.tags) {
    if (Array.isArray(metadata.tags)) {
      sanitized.tags = metadata.tags
        .filter(tag => typeof tag === 'string')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 10);
    } else if (typeof metadata.tags === 'string') {
      sanitized.tags = metadata.tags
        .split(/[,;]/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 10);
    }
  }

  if (metadata.introduction && typeof metadata.introduction === 'string') {
    sanitized.introduction = metadata.introduction.trim().substring(0, 2000);
  }

  if (metadata.results && typeof metadata.results === 'string') {
    sanitized.results = metadata.results.trim().substring(0, 2000);
  }

  if (metadata.conclusion && typeof metadata.conclusion === 'string') {
    sanitized.conclusion = metadata.conclusion.trim().substring(0, 2000);
  }

  return sanitized;
}

/**
 * Main function to extract PDF metadata
 * @param file - The PDF file to extract metadata from
 * @returns Promise resolving to extracted metadata
 */
export async function extractPDFMetadata(file: File): Promise<PDFMetadata> {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('Invalid file type. Please upload a PDF file.');
  }

  try {
    // Extract text from PDF
    const text = await extractTextFromPDF(file);

    if (!text || text.trim().length === 0) {
      throw new Error('Could not extract text from PDF. The file might be corrupted or image-based.');
    }

    // Try Hugging Face extraction first, fallback to regex if it fails
    const metadata = await extractMetadataWithHuggingFace(text);

    // Merge with fallback extraction to ensure we get as much data as possible
    const fallbackMetadata = extractMetadataFallback(text);

    // Combine results, preferring Hugging Face results but ensuring all fields are captured
    const combinedMetadata: PDFMetadata = {
      ...fallbackMetadata,
      ...metadata,
      // For fields that might be better in one or the other, prefer the longer/more complete version
      abstract: metadata.abstract || fallbackMetadata.abstract,
      fullAbstract: metadata.fullAbstract || fallbackMetadata.fullAbstract || metadata.abstract || fallbackMetadata.abstract,
      title: metadata.title || fallbackMetadata.title,
      authors: metadata.authors || fallbackMetadata.authors,
      // Ensure introduction, results, and conclusion are captured from either source
      introduction: metadata.introduction || fallbackMetadata.introduction,
      results: metadata.results || fallbackMetadata.results,
      conclusion: metadata.conclusion || fallbackMetadata.conclusion,
    };

    return combinedMetadata;
  } catch (error: any) {
    console.error('Error extracting PDF metadata:', error);
    throw new Error(
      error.message || 'Failed to extract metadata from PDF. Please fill in the form manually.'
    );
  }
}

