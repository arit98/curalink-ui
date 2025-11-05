import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { fetchAllPublications } from "@/services/publicationService";
import { PublicationCard } from "@/components/PublicationCard";
import { useFavorites } from "@/hooks/useFavorites";
import { PublicationDetailsModal } from "@/components/PublicationDetailsModal";

const Publications = () => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [selectedPublication, setSelectedPublication] = useState<any | null>(null);
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadPublications() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAllPublications();
        if (mounted) setPublications(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (mounted) setError(err?.message ?? "Failed to load publications");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPublications();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = publications.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.title ?? "").toString().toLowerCase().includes(q) ||
      (p.authors ?? "").toString().toLowerCase().includes(q) ||
      (p.journal ?? "").toString().toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar showSearch />

      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Publications</h1>
            <p className="text-muted-foreground">Browse research publications and medical literature.</p>
          </div>

          <div className="mb-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search publications, authors, or journals"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading publications...</p>
            ) : error ? (
              <p className="text-sm text-destructive">Error loading publications: {error}</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Found {filtered.length} publications</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((pub, i) => (
                    <PublicationCard
                      key={pub.id ?? i}
                      id={pub.id}
                      title={pub.title}
                      authors={pub.authors}
                      journal={pub.journal ?? ""}
                      year={pub.year ? String(pub.year) : ""}
                      abstract={pub.abstract ?? ""}
                      tags={Array.isArray(pub.tags) ? pub.tags : pub.tags ? String(pub.tags).split(",").map(t=>t.trim()) : []}
                      isFavorite={isFavorite(pub.id, 'publication')}
                      onToggleFavorite={() => toggleFavorite(pub.id, 'publication', pub)}
                      onViewDetails={() => setSelectedPublication(pub)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <PublicationDetailsModal
        open={!!selectedPublication}
        onOpenChange={(open) => !open && setSelectedPublication(null)}
        publication={selectedPublication}
      />
    </div>
  );
};

export default Publications;


