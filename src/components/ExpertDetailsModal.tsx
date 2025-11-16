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
  import { Mail, Phone, Building, Award, BookOpen, MapPin, User, Heart } from "lucide-react";
  
  interface ExpertDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    expert: {
      id?: string | number;
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
      npi?: number;
      gender?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        country?: string;
        zip?: string;
      };
    } | null;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
  }
  
  export const ExpertDetailsModal = ({ open, onOpenChange, expert, isFavorite = false, onToggleFavorite }: ExpertDetailsModalProps) => {
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
  
            {/* Address Information */}
            {expert.address && (
              <>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {expert.address.line1 && <p>{expert.address.line1}</p>}
                    {expert.address.line2 && <p>{expert.address.line2}</p>}
                    <p>
                      {expert.address.city}, {expert.address.state} {expert.address.zip}
                    </p>
                    {expert.address.country && <p>{expert.address.country}</p>}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Additional Information */}
            {(expert.npi || expert.gender) && (
              <>
                <div>
                  <h3 className="font-semibold mb-3">Additional Information</h3>
                  <div className="space-y-2 text-sm">
                    {expert.npi && (
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">NPI:</span>
                        <span className="font-medium">{expert.npi}</span>
                      </div>
                    )}
                    {expert.gender && (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="font-medium">{expert.gender === 'M' ? 'Male' : expert.gender === 'F' ? 'Female' : expert.gender}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Contact Information */}
            {expert.contact && (
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {expert.contact.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${expert.contact.email}`} className="text-primary hover:underline">
                        {expert.contact.email}
                      </a>
                    </div>
                  )}
                  {expert.contact.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${expert.contact.phone}`} className="text-primary hover:underline">
                        {expert.contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
  
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1">Request Meeting</Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onToggleFavorite}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} />
                {isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
