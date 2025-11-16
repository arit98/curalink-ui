/**
 * PDF Metadata Extractor
 * Extracts metadata from PDF files using basic text parsing
 */

interface PDFMetadata {
  title?: string;
  authors?: string;
  journal?: string;
  year?: string;
  abstract?: string;
  fullAbstract?: string;
  doi?: string;
  tags?: string[];
  introduction?: string;
}

/**
 * Extracts text from PDF file
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Try to use pdfjs-dist if available
    let pdfjsLib;
    try {
      pdfjsLib = await import("pdfjs-dist");
    } catch (importError) {
      throw new Error(
        "PDF.js library not found. Please install it with: npm install pdfjs-dist"
      );
    }
    
    // Set worker path - use local worker file from public folder
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Use local worker file (copied to public folder)
      // This file is served at the root URL: /pdf.worker.min.mjs
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      verbosity: 0 // Suppress warnings
    });
    
    const pdf = await loadingTask.promise;
    
    let fullText = "";
    
    // Extract text from first 10 pages (abstract and introduction are usually in first few pages)
    const maxPages = Math.min(pdf.numPages, 10);
    for (let i = 1; i <= maxPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Better text extraction that preserves structure
        let pageText = "";
        let lastY = null;
        for (const item of textContent.items) {
          if (item.str) {
            // Check if this is a new line based on Y position
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
              pageText += "\n";
            }
            pageText += item.str;
            lastY = item.transform[5];
          }
        }
        
        // Fallback: if structure detection didn't work well, use simple join with spaces
        if (!pageText.includes("\n") && textContent.items.length > 0) {
          pageText = textContent.items
            .map((item: any) => item.str || "")
            .filter(Boolean)
            .join(" ");
        }
        
        fullText += pageText + "\n\n";
      } catch (pageError) {
        console.warn(`Error extracting text from page ${i}:`, pageError);
        // Continue with other pages
      }
    }
    
    return fullText;
  } catch (error: any) {
    console.error("Error extracting text from PDF:", error);
    
    // Provide more specific error messages
    if (error.message?.includes("worker")) {
      throw new Error("PDF.js worker failed to load. Please check your internet connection.");
    } else if (error.message?.includes("Invalid PDF")) {
      throw new Error("The uploaded file is not a valid PDF or is corrupted.");
    } else if (error.message?.includes("library not found")) {
      throw error; // Re-throw the original error
    } else {
      throw new Error(
        error.message || "Failed to extract text from PDF. The PDF might be image-based, password-protected, or corrupted."
      );
    }
  }
}

/**
 * Extracts metadata from PDF text using pattern matching
 */
function extractMetadataFromText(text: string): PDFMetadata {
  const metadata: PDFMetadata = {};
  
  // Normalize text
  const normalizedText = text.replace(/\s+/g, " ").trim();
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  
  // Extract title (usually first non-empty line or first few lines)
  if (lines.length > 0) {
    // Title is often the first substantial line (more than 10 characters)
    const titleLine = lines.find((line) => line.length > 10 && !line.match(/^(abstract|introduction|doi|author)/i));
    if (titleLine) {
      metadata.title = titleLine.substring(0, 200); // Limit title length
    }
  }
  
  // Extract authors (look for patterns like "Author1, Author2" or "Author1 and Author2")
  const authorPatterns = [
    /(?:authors?|by)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)*)/i,
    /([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s*,\s*[A-Z][a-z]+\s+[A-Z][a-z]+)+)/,
  ];
  
  for (const pattern of authorPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      metadata.authors = match[1].trim();
      break;
    }
  }
  
  // Extract journal (look for common journal patterns)
  const journalPatterns = [
    /(?:journal|published in|in)\s*:?\s*([A-Z][A-Za-z\s]+(?:Journal|Review|Magazine|Proceedings))/i,
    /([A-Z][A-Za-z\s]+(?:Journal|Review|Magazine|Proceedings))/,
  ];
  
  for (const pattern of journalPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      metadata.journal = match[1].trim();
      break;
    }
  }
  
  // Extract year (look for 4-digit years between 1900 and current year)
  const currentYear = new Date().getFullYear();
  const yearMatch = normalizedText.match(/\b(19\d{2}|20[0-2]\d)\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= 1900 && year <= currentYear) {
      metadata.year = yearMatch[1];
    }
  }
  
  // Extract DOI
  const doiMatch = normalizedText.match(/doi[:\s]*([10]\.[0-9]{4,}\/[^\s]+)/i);
  if (doiMatch) {
    metadata.doi = doiMatch[1].trim();
  }
  
  // Extract abstract (look for "Abstract" section)
  const abstractPatterns = [
    /abstract\s*:?\s*([^\n]{50,1000})/is,
    /summary\s*:?\s*([^\n]{50,1000})/is,
  ];
  
  for (const pattern of abstractPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const abstractText = match[1].trim();
      metadata.abstract = abstractText.substring(0, 500); // Limit abstract length
      metadata.fullAbstract = abstractText.substring(0, 2000); // Longer version
      break;
    }
  }
  
  // Extract introduction (look for "Introduction" section)
  // Try multiple patterns to find introduction section
  let introductionText = null;
  
  // First, find the position of "Introduction" in the text
  const introKeywordMatch = text.match(/(?:^|\s)(?:1\.\s*)?introduction\s*:?/i);
  if (introKeywordMatch) {
    const introStartPos = introKeywordMatch.index! + introKeywordMatch[0].length;
    let textAfterIntro = text.substring(introStartPos).trim();
    
    // Remove leading newlines and whitespace
    textAfterIntro = textAfterIntro.replace(/^\s*\n+\s*/, '');
    
    // Find the next major section
    const nextSectionPattern = /\n\s*(?:2\.|methodology|methods|results|discussion|conclusion|background|literature\s+review|related\s+work|materials?\s+and\s+methods|experimental|data\s+analysis|materials|experiments?)/i;
    const nextSectionMatch = textAfterIntro.match(nextSectionPattern);
    
    if (nextSectionMatch) {
      // Extract text until the next section
      const nextSectionPos = nextSectionMatch.index!;
      introductionText = textAfterIntro.substring(0, nextSectionPos).trim();
    } else {
      // No next section found, extract a reasonable amount (up to 3000 chars or until end)
      introductionText = textAfterIntro.substring(0, 3000).trim();
    }
    
    // Clean up: remove any trailing section headers that might have been included
    if (introductionText) {
      introductionText = introductionText.replace(/\s*(?:methodology|methods|results|discussion|conclusion|2\.|3\.|materials|experiments?).*$/i, '').trim();
    }
  }
  
  // Pattern 2: More flexible pattern - find "Introduction" with optional formatting
  if (!introductionText || introductionText.length < 50) {
    const introPattern2 = /(?:^|\s)(?:1\.\s*)?introduction\s*:?\s*([\s\S]{100,3000}?)(?:\s+(?:methodology|methods|results|discussion|conclusion|2\.|3\.|materials|experiments?))/i;
    const match2 = text.match(introPattern2);
    if (match2 && match2[1]) {
      introductionText = match2[1].trim();
    }
  }
  
  // Pattern 3: Very simple pattern - just find "Introduction" and take next 2000 chars
  if (!introductionText || introductionText.length < 50) {
    const introPattern3 = /(?:^|\s)introduction\s*:?\s*([\s\S]{100,2000})/i;
    const match3 = text.match(introPattern3);
    if (match3 && match3[1]) {
      let introContent = match3[1].trim();
      // Try to find a natural break point
      const breakMatch = introContent.match(/^(.{100,1500}?)(?:\s+(?:methodology|methods|results|discussion|conclusion|2\.|3\.))/i);
      if (breakMatch && breakMatch[1]) {
        introductionText = breakMatch[1].trim();
      } else {
        introductionText = introContent;
      }
    }
  }
  
  // Pattern 4: Look for introduction after abstract (common structure)
  if (!introductionText || introductionText.length < 50) {
    const abstractMatch = text.match(/abstract\s*:?\s*([\s\S]{0,2000})/i);
    if (abstractMatch) {
      const afterAbstractPos = abstractMatch.index! + abstractMatch[0].length;
      const textAfterAbstract = text.substring(afterAbstractPos);
      const introAfterAbstract = textAfterAbstract.match(/introduction\s*:?\s*([\s\S]{100,2000}?)(?:\s+(?:methodology|methods|results|2\.|3\.))/i);
      if (introAfterAbstract && introAfterAbstract[1]) {
        introductionText = introAfterAbstract[1].trim();
      }
    }
  }
  
  if (introductionText && introductionText.length >= 50) {
    // Clean up whitespace but preserve paragraph structure
    introductionText = introductionText.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    // Limit length
    metadata.introduction = introductionText.substring(0, 2000);
    console.log("Introduction extracted:", metadata.introduction.substring(0, 100) + "...");
  } else {
    // Debug: log if introduction keyword was found but extraction failed
    if (text.toLowerCase().includes('introduction')) {
      console.log("Introduction keyword found but extraction failed. Text sample:", text.substring(0, 500));
    }
  }
  
  // Extract keywords/tags (look for "Keywords" section)
  const keywordsPattern = /(?:keywords?|tags?)\s*:?\s*([^\n]+)/i;
  const keywordsMatch = text.match(keywordsPattern);
  if (keywordsMatch && keywordsMatch[1]) {
    metadata.tags = keywordsMatch[1]
      .split(/[,;]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 10); // Limit to 10 tags
  }
  
  return metadata;
}

/**
 * Main function to extract metadata from PDF file
 */
export async function extractPDFMetadata(file: File): Promise<PDFMetadata> {
  try {
    const text = await extractTextFromPDF(file);
    
    if (!text || text.trim().length === 0) {
      throw new Error("Could not extract text from PDF. The PDF might be image-based or corrupted.");
    }
    
    const metadata = extractMetadataFromText(text);
    
    return metadata;
  } catch (error: any) {
    console.error("Error in extractPDFMetadata:", error);
    throw new Error(error.message || "Failed to extract metadata from PDF");
  }
}

