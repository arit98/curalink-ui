import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

interface ExpertCardProps {
  id?: string | number;
  name: string;
  specialty: string;
  institution: string;
  expertise: string[];
  onViewDetails?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const ExpertCard = ({ name, specialty, institution, expertise, onViewDetails, isFavorite, onToggleFavorite }: ExpertCardProps) => {
  const initials = name.split(" ").map(n => n[0]).join("");

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{name}</h3>
              <p className="text-sm text-muted-foreground truncate">{specialty}</p>
            </div>
          </div>
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? 'fill-destructive text-destructive' : ''}`}
              />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{institution}</p>
        <div className="flex flex-wrap gap-2">
          {expertise.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button className="flex-1" variant="outline" onClick={onViewDetails}>View Profile</Button>
        <Button className="flex-1">Request Meeting</Button>
      </CardFooter>
    </Card>
  );
};
