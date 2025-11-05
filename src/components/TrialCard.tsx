import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Heart } from "lucide-react";

interface TrialCardProps {
  id?: string | number;
  title: string;
  phase: string;
  location: string;
  summary: string;
  recruiting: boolean;
  onViewDetails?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const TrialCard = ({ title, phase, location, summary, recruiting, onViewDetails, isFavorite, onToggleFavorite }: TrialCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">{title}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
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
            <Badge variant={recruiting ? "default" : "secondary"}>
              {recruiting ? "Recruiting" : "Completed"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground space-x-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{phase}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{location}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{summary}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onViewDetails}>View Details</Button>
      </CardFooter>
    </Card>
  );
};
