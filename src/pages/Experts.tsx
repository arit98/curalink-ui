import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { ExpertCard } from "@/components/ExpertCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { fetchExperts } from "@/services/expertService";
import { ExpertDetailsModal } from "@/components/ExpertDetailsModal";
import { useFavorites } from "@/hooks/useFavorites";

const Experts = () => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [location, setLocation] = useState("");

  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadExperts() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchExperts();
        if (mounted) setExperts(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (mounted) setError(err?.message ?? "Failed to load experts");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadExperts();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredExperts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return experts.filter((expert) => {
      const specialty = expert.specialty?.toLowerCase() ?? "";
      const matchesSpecialty = filterSpecialty === "all" || specialty === filterSpecialty.toLowerCase();
      const loc = location.trim().toLowerCase();
      const matchesLocation =
        !loc ||
        (expert.location?.toLowerCase().includes(loc) ?? false) ||
        (expert.institution?.toLowerCase().includes(loc) ?? false);

      if (!q) return matchesSpecialty && matchesLocation;

      const inName = expert.name?.toLowerCase().includes(q);
      const inInstitution = expert.institution?.toLowerCase().includes(q);
      const inExpertise =
        Array.isArray(expert.expertise) && expert.expertise.join(" ").toLowerCase().includes(q);
      const inSpecialty = specialty.includes(q);

      return matchesSpecialty && matchesLocation && (inName || inInstitution || inExpertise || inSpecialty);
    });
  }, [experts, searchQuery, filterSpecialty, location]);

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Specialty</Label>
        <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
          <SelectTrigger>
            <SelectValue placeholder="All specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            <SelectItem value="oncology">Oncology</SelectItem>
            <SelectItem value="cardiology">Cardiology</SelectItem>
            <SelectItem value="neurology">Neurology</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="location-filter">Location</Label>
        <Input
          id="location-filter"
          placeholder="City or State"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <Button className="w-full">Apply Filters</Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar showSearch />

      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Experts</h1>
            <p className="text-muted-foreground">Browse experts and request consultations</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for experts (e.g., thoracic oncology specialists)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Mobile Filter Sheet */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon">
                    <Filter className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex gap-4">
              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="oncology">Oncology</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-[200px]"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading experts...</p>
            ) : error ? (
              <p className="text-sm text-destructive">Error loading experts: {error}</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Found {filteredExperts.length} of {experts.length} experts</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExperts.map((expert, i) => (
                    <ExpertCard
                      key={expert.id ?? i}
                      id={expert.id}
                      name={expert.name}
                      specialty={expert.specialty}
                      institution={expert.institution}
                      expertise={expert.expertise ?? []}
                      isFavorite={isFavorite(expert.id, 'expert')}
                      onToggleFavorite={() => toggleFavorite(expert.id, 'expert', expert)}
                      onViewDetails={() => setSelectedExpert(expert)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <ExpertDetailsModal
        open={!!selectedExpert}
        onOpenChange={(open) => !open && setSelectedExpert(null)}
        expert={selectedExpert}
      />
    </div>
  );
};

export default Experts;


