import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { TrialCard } from "@/components/TrialCard";
import { ExpertCard } from "@/components/ExpertCard";
import { PublicationCard } from "@/components/PublicationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { TrialDetailsModal } from "@/components/TrialDetailsModal";
import { ExpertDetailsModal } from "@/components/ExpertDetailsModal";
import { PublicationDetailsModal } from "@/components/PublicationDetailsModal";
import { DiscussionModal } from "@/components/Discussion Modal";

const Favorites = () => {
  const { getFavoritesByType, toggleFavorite, isFavorite } = useFavorites();
  const [selectedTrial, setSelectedTrial] = useState<any | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<any | null>(null);
  const [selectedForum, setSelectedForum] = useState<any | null>(null);
  const [isForumModalOpen, setIsForumModalOpen] = useState(false);

  const favoriteTrials = getFavoritesByType('trial');
  const favoriteExperts = getFavoritesByType('expert');
  const favoritePublications = getFavoritesByType('publication');
  const favoriteForums = getFavoritesByType('forum');

  const role = localStorage.getItem("role");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar showSearch />

      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Your Favorites
            </h1>
            <p className="text-muted-foreground">
              Items you've saved for later
            </p>
          </div>

          <Tabs defaultValue="trials" className="space-y-6">
            <TabsList>
              <TabsTrigger value="trials">Clinical Trials</TabsTrigger>
              {role != "1" && <TabsTrigger value="experts">Experts</TabsTrigger>}
              {role != "0" && <TabsTrigger value="publications">Publications</TabsTrigger>}
              <TabsTrigger value="forums">Forums</TabsTrigger>
            </TabsList>

            <TabsContent value="trials" className="space-y-6">
              {favoriteTrials.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteTrials.map((trial, i) => (
                    <TrialCard
                      key={trial.id ?? i}
                      {...trial}
                      isFavorite={isFavorite(trial.id, 'trial')}
                      onToggleFavorite={() => toggleFavorite(trial.id, 'trial', trial)}
                      onViewDetails={() => setSelectedTrial(trial)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No saved trials yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="experts" className="space-y-6">
              {favoriteExperts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteExperts.map((expert, i) => (
                    <ExpertCard
                      key={expert.id ?? i}
                      {...expert}
                      isFavorite={isFavorite(expert.id, 'expert')}
                      onToggleFavorite={() => toggleFavorite(expert.id, 'expert', expert)}
                      onViewDetails={() => setSelectedExpert(expert)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No saved experts yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="publications" className="space-y-6">
              {favoritePublications.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {favoritePublications.map((pub, i) => (
                    <PublicationCard
                      key={pub.id ?? i}
                      {...pub}
                      isFavorite={isFavorite(pub.id, 'publication')}
                      onToggleFavorite={() => toggleFavorite(pub.id, 'publication', pub)}
                      onViewDetails={() => setSelectedPublication(pub)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No saved publications yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="forums" className="space-y-6">
              {favoriteForums.length > 0 ? (
                <div className="space-y-4">
                  {favoriteForums.map((forum, i) => (
                    <Card key={forum.id ?? i} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {forum.author?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base mb-1">
                                {forum.title}
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-medium">{forum.author}</span>
                                <Badge variant="outline" className="text-xs">
                                  {forum.role}
                                </Badge>
                                <span>•</span>
                                <span>{forum.timestamp}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {(forum.category || forum.categoryName) && (
                              <Badge variant="default">{forum.category || forum.categoryName}</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(forum.id, 'forum', forum);
                              }}
                            >
                              <Heart
                                className={`h-4 w-4 ${isFavorite(forum.id, 'forum') ? 'fill-destructive text-destructive' : ''}`}
                              />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {forum.preview}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span>{forum.replies || 0} replies from researchers</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedForum(forum);
                              setIsForumModalOpen(true);
                            }}
                          >
                            View Discussion
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No saved forums yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <TrialDetailsModal
        open={!!selectedTrial}
        onOpenChange={(open) => !open && setSelectedTrial(null)}
        trial={selectedTrial}
      />
      <ExpertDetailsModal
        open={!!selectedExpert}
        onOpenChange={(open) => !open && setSelectedExpert(null)}
        expert={selectedExpert}
        isFavorite={selectedExpert ? isFavorite(selectedExpert.id, 'expert') : false}
        onToggleFavorite={() => selectedExpert && toggleFavorite(selectedExpert.id, 'expert', selectedExpert)}
      />
      <PublicationDetailsModal
        open={!!selectedPublication}
        onOpenChange={(open) => !open && setSelectedPublication(null)}
        publication={selectedPublication}
        isFavorite={selectedPublication ? isFavorite(selectedPublication.id, 'publication') : false}
        onToggleFavorite={() => selectedPublication && toggleFavorite(selectedPublication.id, 'publication', selectedPublication)}
        onDelete={() => {
          setSelectedPublication(null);
          // The favorites list will automatically update since it reads from localStorage
        }}
      />
      <DiscussionModal
        isOpen={isForumModalOpen}
        onClose={() => {
          setIsForumModalOpen(false);
          setSelectedForum(null);
        }}
        postId={selectedForum?.id || null}
        isFavorite={selectedForum ? isFavorite(selectedForum.id, 'forum') : false}
        onToggleFavorite={() => {
          if (selectedForum) {
            toggleFavorite(selectedForum.id, 'forum', selectedForum);
          }
        }}
        onPostDeleted={() => {
          // The favorites list will automatically update since it reads from localStorage
        }}
        onReplyAdded={() => {
          // Handle reply count update if needed
        }}
      />
    </div>
  );
};

export default Favorites;
