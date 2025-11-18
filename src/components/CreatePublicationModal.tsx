import { useState, useRef } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { publicationService } from "@/services/publicationService";
import { extractPDFMetadata } from "@/lib/pdfExtractor";
import { toast } from "@/hooks/use-toast";

interface CreatePublicationModalProps {
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export const CreatePublicationModal = ({
  onSuccess,
  trigger,
}: CreatePublicationModalProps) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  const [form, setForm] = useState({
    title: "",
    authors: "",
    journal: "",
    year: "",
    abstract: "",
    tags: "",
    doi: "",
    fullAbstract: "",
    introduction: "",
    results: "",
    conclusion: "",
  });

  const update = (key: string, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Unsupported file",
        description: "Please upload a PDF document.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFileName(file.name);
    setExtracting(true);

    try {
      // Extract metadata from PDF
      const metadata = await extractPDFMetadata(file);
      
      // Populate form with extracted data
      setForm((prev) => ({
        ...prev,
        title: metadata.title || prev.title,
        authors: metadata.authors || prev.authors,
        journal: metadata.journal || prev.journal,
        year: metadata.year || prev.year,
        abstract: metadata.abstract || prev.abstract,
        fullAbstract: metadata.fullAbstract || metadata.abstract || prev.fullAbstract,
        doi: metadata.doi || prev.doi,
        tags: metadata.tags?.join(", ") || prev.tags,
        introduction: metadata.introduction || prev.introduction,
        results: metadata.results || prev.results,
        conclusion: metadata.conclusion || prev.conclusion,
      }));
      
      // Show success message if any data was extracted
      if (metadata.title || metadata.authors || metadata.abstract) {
        // Silently succeed - form is already populated
      }
    } catch (error: any) {
      console.error("Error extracting PDF metadata:", error);
      const errorMessage = error.message || "Failed to extract metadata from PDF. Please fill in the form manually.";
      toast({
        title: "Extraction failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.authors.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please provide both a title and authors.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const tagsArray = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: any = {
        title: form.title,
        authors: form.authors,
        journal: form.journal || "",
        year: form.year || new Date().getFullYear().toString(),
        abstract: form.abstract || form.fullAbstract || "",
        tags: tagsArray,
      };

      // Add optional fields if they exist
      if (form.doi) payload.doi = form.doi;
      if (form.fullAbstract) payload.fullAbstract = form.fullAbstract;
      if (form.introduction) payload.introduction = form.introduction;
      if (form.results) payload.results = form.results;
      if (form.conclusion) payload.conclusion = form.conclusion;

      await publicationService.createPublication(payload);

      toast({
        title: "Publication created",
        description: "Your publication has been added successfully.",
      });
      onSuccess();
      setOpen(false);

      // Reset form
      setForm({
        title: "",
        authors: "",
        journal: "",
        year: "",
        abstract: "",
        tags: "",
        doi: "",
        fullAbstract: "",
        introduction: "",
        results: "",
        conclusion: "",
      });
      setUploadedFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create publication";
      toast({
        title: "Failed to create publication",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="text-xs sm:text-sm w-full md:w-auto">
            <Upload className="h-4 w-4 mr-1" /> 
            <span className="hidden sm:inline">Upload Publication</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-3xl w-full mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Create New Publication</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Upload a research paper PDF to automatically extract metadata, or fill in the form manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* PDF Upload Section */}
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Upload Research Paper (PDF)</Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="flex-1 text-sm sm:text-base"
                disabled={extracting}
              />
              {uploadedFileName && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate flex-1 min-w-0">{uploadedFileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            {extracting && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Extracting metadata from PDF...</span>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="md:col-span-2">
              <Label className="text-sm sm:text-base">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Research paper title"
                className="text-sm sm:text-base"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm sm:text-base">Authors *</Label>
              <Input
                value={form.authors}
                onChange={(e) => update("authors", e.target.value)}
                placeholder="Author names (comma-separated)"
                className="text-sm sm:text-base"
              />
            </div>

            <div>
              <Label className="text-sm sm:text-base">Journal</Label>
              <Input
                value={form.journal}
                onChange={(e) => update("journal", e.target.value)}
                placeholder="Journal name"
                className="text-sm sm:text-base"
              />
            </div>

            <div>
              <Label className="text-sm sm:text-base">Year</Label>
              <Input
                value={form.year}
                onChange={(e) => update("year", e.target.value)}
                placeholder="Publication year"
                type="number"
                className="text-sm sm:text-base"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm sm:text-base">DOI</Label>
              <Input
                value={form.doi}
                onChange={(e) => update("doi", e.target.value)}
                placeholder="10.xxxx/xxxxx"
                className="text-sm sm:text-base"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm sm:text-base">Abstract</Label>
              <Textarea
                value={form.abstract}
                onChange={(e) => update("abstract", e.target.value)}
                placeholder="Brief abstract"
                rows={3}
                className="text-sm sm:text-base resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm sm:text-base">Full Abstract</Label>
              <Textarea
                value={form.fullAbstract}
                onChange={(e) => update("fullAbstract", e.target.value)}
                placeholder="Complete abstract text"
                rows={5}
                className="text-sm sm:text-base resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm sm:text-base">Tags (comma-separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                placeholder="cancer, immunotherapy, clinical trial"
                className="text-sm sm:text-base"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm sm:text-base">Introduction</Label>
              <Textarea
                value={form.introduction}
                onChange={(e) => update("introduction", e.target.value)}
                placeholder="Research introduction"
                rows={4}
                className="text-sm sm:text-base resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm sm:text-base">Key Results</Label>
              <Textarea
                value={form.results}
                onChange={(e) => update("results", e.target.value)}
                placeholder="Key findings and results"
                rows={4}
                className="text-sm sm:text-base resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm sm:text-base">Conclusion</Label>
              <Textarea
                value={form.conclusion}
                onChange={(e) => update("conclusion", e.target.value)}
                placeholder="Research conclusions"
                rows={4}
                className="text-sm sm:text-base resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            disabled={uploading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={uploading || extracting}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Publication"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

