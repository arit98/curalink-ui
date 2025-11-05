import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { Avatar, AvatarFallback } from "@/components/ui/avatar";
  import { Separator } from "@/components/ui/separator";
  import { Mail, Phone, Building, Award, BookOpen } from "lucide-react";
  
  interface ExpertDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    expert: {
      name: string;
      specialty: string;
      institution: string;
      expertise: string[];
      bio?: string;
      education?: string[];
      publications?: number;
      contact?: {
        email: string;
        phone: string;
      };
    } | null;
  }
  
  export const ExpertDetailsModal = ({ open, onOpenChange, expert }: ExpertDetailsModalProps) => {
    if (!expert) return null;
  
    const initials = expert.name.split(" ").map(n => n[0]).join("");
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold">{expert.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">{expert.specialty}</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                  <Building className="h-4 w-4" />
                  <span>{expert.institution}</span>
                </div>
              </div>
            </div>
            <DialogDescription className="sr-only">Expert profile details</DialogDescription>
          </DialogHeader>
  
          <div className="space-y-6">
            {/* Expertise Areas */}
            <div>
              <h3 className="font-semibold mb-2">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {expert.expertise.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
  
            <Separator />
  
            {/* Bio */}
            {expert.bio && (
              <>
                <div>
                  <h3 className="font-semibold mb-2">Biography</h3>
                  <p className="text-sm text-muted-foreground">{expert.bio}</p>
                </div>
                <Separator />
              </>
            )}
  
            {/* Education */}
            {expert.education && expert.education.length > 0 && (
              <>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Education & Credentials
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {expert.education.map((edu, i) => (
                      <li key={i}>{edu}</li>
                    ))}
                  </ul>
                </div>
                <Separator />
              </>
            )}
  
            {/* Publications */}
            {expert.publications && (
              <>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Publications
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {expert.publications}+ peer-reviewed publications
                  </p>
                </div>
                <Separator />
              </>
            )}
  
            {/* Contact Information */}
            {expert.contact && (
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${expert.contact.email}`} className="text-primary hover:underline">
                      {expert.contact.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{expert.contact.phone}</span>
                  </div>
                </div>
              </div>
            )}
  
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1">Request Meeting</Button>
              <Button variant="outline" className="flex-1">Save to Favorites</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
