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
  import { MapPin, Calendar, Users, Mail, Phone, Building } from "lucide-react";
  
  interface TrialDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trial: {
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
  }
  
  export const TrialDetailsModal = ({ open, onOpenChange, trial }: TrialDetailsModalProps) => {
    if (!trial) return null;
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
