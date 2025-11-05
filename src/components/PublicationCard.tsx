import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Heart } from "lucide-react";

interface PublicationCardProps {
  id?: string | number;
  title: string;
  authors: string;
  journal: string;
  year: string;
  abstract: string;
  tags: string[];
  onViewDetails?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const PublicationCard = ({ title, authors, journal, year, abstract, tags, onViewDetails, isFavorite, onToggleFavorite }: PublicationCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-accent shrink-0">
              <FileText className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold line-clamp-2">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{authors}</p>
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
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{journal}</span> • {year}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{abstract}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline" onClick={onViewDetails}>Read More</Button>
      </CardFooter>
    </Card>
  );
};
