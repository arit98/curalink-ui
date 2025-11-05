import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { TrialCard } from "@/components/TrialCard";
import { ExpertCard } from "@/components/ExpertCard";
import { PublicationCard } from "@/components/PublicationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavorites } from "@/hooks/useFavorites";
import { TrialDetailsModal } from "@/components/TrialDetailsModal";
import { ExpertDetailsModal } from "@/components/ExpertDetailsModal";
import { PublicationDetailsModal } from "@/components/PublicationDetailsModal";

const Favorites = () => {
  const { getFavoritesByType, toggleFavorite, isFavorite } = useFavorites();
  const [selectedTrial, setSelectedTrial] = useState<any | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<any | null>(null);

  const favoriteTrials = getFavoritesByType('trial');
  const favoriteExperts = getFavoritesByType('expert');
  const favoritePublications = getFavoritesByType('publication');

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
              <TabsTrigger value="experts">Experts</TabsTrigger>
              <TabsTrigger value="publications">Publications</TabsTrigger>
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
      />
      <PublicationDetailsModal
        open={!!selectedPublication}
        onOpenChange={(open) => !open && setSelectedPublication(null)}
        publication={selectedPublication}
      />
    </div>
  );
};

export default Favorites;
