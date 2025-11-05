import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { Separator } from "@/components/ui/separator";
  import { FileText, ExternalLink, Download, BookmarkPlus } from "lucide-react";
  
  interface PublicationDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    publication: {
      title: string;
      authors: string;
      journal: string;
      year: string;
      abstract: string;
      tags: string[];
      doi?: string;
      fullAbstract?: string;
      methodology?: string;
      results?: string;
      conclusion?: string;
    } | null;
  }
  
  export const PublicationDetailsModal = ({ open, onOpenChange, publication }: PublicationDetailsModalProps) => {
    if (!publication) return null;
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-accent shrink-0">
                <FileText className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold">{publication.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">{publication.authors}</p>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">{publication.journal}</span> • {publication.year}
                </div>
              </div>
            </div>
            <DialogDescription className="sr-only">Publication details</DialogDescription>
          </DialogHeader>
  
          <div className="space-y-6">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {publication.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
  
            <Separator />
  
            {/* Abstract */}
            <div>
              <h3 className="font-semibold mb-2">Abstract</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {publication.fullAbstract || publication.abstract}
              </p>
            </div>
  
            {/* Methodology */}
            {publication.methodology && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Methodology</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {publication.methodology}
                  </p>
                </div>
              </>
            )}
  
            {/* Results */}
            {publication.results && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Key Results</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {publication.results}
                  </p>
                </div>
              </>
            )}
  
            {/* Conclusion */}
            {publication.conclusion && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Conclusion</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {publication.conclusion}
                  </p>
                </div>
              </>
            )}
  
            {/* DOI */}
            {publication.doi && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">DOI</h3>
                  <a 
                    href={`https://doi.org/${publication.doi}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {publication.doi}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </>
            )}
  
            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <Button className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Text
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full">
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
