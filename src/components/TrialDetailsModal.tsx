import { useState } from "react";
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
  import { MapPin, Calendar, Users, Mail, Phone, Building, Trash2, Edit } from "lucide-react";
  import { trialService } from "@/services/trialService";
  import { useToast } from "@/hooks/use-toast";
  import { EditTrialModal } from "@/components/EditTrialModal";
  
  interface TrialDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trial: {
      id?: string | number;
      title: string;
      phase: string;
      location: string;
      summary: string;
      recruiting: boolean;
      description?: string;
      eligibility?: string[];
      contact?: {
        name: string;
        email: string;
        phone: string;
      };
      institution?: string;
      enrollment?: string;
    } | null;
    onDelete?: () => void;
    onUpdate?: () => void;
  }
  
  export const TrialDetailsModal = ({ open, onOpenChange, trial, onDelete, onUpdate }: TrialDetailsModalProps) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const { toast } = useToast();

    if (!trial) return null;

    const handleDelete = async () => {
      if (!trial.id) {
        toast({
          title: "Error",
          description: "Trial ID is missing. Cannot delete trial.",
          variant: "destructive",
        });
        return;
      }

      setIsDeleting(true);
      try {
        await trialService.deleteTrial(trial.id);
        toast({
          title: "Success",
          description: "Trial deleted successfully.",
        });
        setShowDeleteDialog(false);
        onOpenChange(false);
        if (onDelete) {
          onDelete();
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete trial. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto pt-11">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-xl font-bold pr-8">{trial.title}</DialogTitle>
              <Badge variant={trial.recruiting ? "default" : "secondary"} className="shrink-0">
                {trial.recruiting ? "Recruiting" : "Completed"}
              </Badge>
            </div>
            <DialogDescription className="sr-only">Clinical trial details</DialogDescription>
          </DialogHeader>
  
          <div className="space-y-6">
            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Phase:</span>
                <span>{trial.phase}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span>{trial.location}</span>
              </div>
              {trial.institution && (
                <div className="flex items-center space-x-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Institution:</span>
                  <span>{trial.institution}</span>
                </div>
              )}
              {trial.enrollment && (
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Enrollment:</span>
                  <span>{trial.enrollment}</span>
                </div>
              )}
            </div>
  
            <Separator />
  
            {/* Summary */}
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-sm text-muted-foreground">{trial.summary}</p>
            </div>
  
            {/* Description */}
            {trial.description && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Detailed Description</h3>
                  <p className="text-sm text-muted-foreground">{trial.description}</p>
                </div>
              </>
            )}
  
            {/* Eligibility */}
            {trial.eligibility && trial.eligibility.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Eligibility Criteria</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {trial.eligibility.map((criterion, i) => (
                      <li key={i}>{criterion}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
  
            {/* Contact Information */}
            {trial.contact && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{trial.contact.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${trial.contact.email}`} className="text-primary hover:underline">
                        {trial.contact.email}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{trial.contact.phone}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
  
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1">Express Interest</Button>
              <Button variant="outline" className="flex-1">Save to Favorites</Button>
              {onUpdate && trial.id && (
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && trial.id && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the clinical trial "{trial.title}".
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

        {/* Edit Trial Modal */}
        <EditTrialModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          trial={trial}
          onSuccess={() => {
            if (onUpdate) {
              onUpdate();
            }
          }}
        />
      </Dialog>
    );
  };
  
