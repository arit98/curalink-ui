import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { Separator } from "@/components/ui/separator";
  import { FileText, ExternalLink, Download, BookmarkPlus, Trash2, Heart } from "lucide-react";
  import { useToast } from "@/hooks/use-toast";
  import { publicationService } from "@/services/publicationService";
  
  interface PublicationDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    publication: {
      id?: string | number;
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
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
    onDelete?: () => void;
  }
  
  export const PublicationDetailsModal = ({ open, onOpenChange, publication, isFavorite = false, onToggleFavorite, onDelete }: PublicationDetailsModalProps) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    if (!publication) return null;

    const handleDelete = async () => {
      console.log("Publication object:", publication);
      console.log("Publication ID:", publication.id);
      
      if (!publication.id && publication.id !== 0) {
        toast({
          title: "Error",
          description: "Publication ID is missing. Cannot delete publication.",
          variant: "destructive",
        });
        return;
      }

      setIsDeleting(true);
      try {
        await publicationService.deletePublication(publication.id);
        toast({
          title: "Success",
          description: "Publication deleted successfully.",
        });
        setShowDeleteDialog(false);
        onOpenChange(false);
        if (onDelete) {
          onDelete();
        }
      } catch (error: any) {
        console.error("Delete publication error:", error);
        const errorMessage = 
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to delete publication. Please try again.";
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin">
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
  
            {/* Introduction */}
            {publication.methodology && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Introduction</h3>
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
              <Button 
                className="w-full"
                onClick={() => {
                  if (publication.doi) {
                    window.open(`https://doi.org/${publication.doi}`, '_blank', 'noopener,noreferrer');
                  }
                }}
                disabled={!publication.doi}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Text
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onToggleFavorite}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} />
                {isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-red-500/10 hover:text-red-500"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the publication "{publication.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Dialog>
    );
  };
  
