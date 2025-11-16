import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TrialCard } from "@/components/TrialCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { trialService } from "@/services/trialService";
import { TrialDetailsModal } from "@/components/TrialDetailsModal";
import { useFavorites } from "@/hooks/useFavorites";
import { AddTrialModal } from "@/components/AddClinicalTrials Modal";

const ClinicalTrials = () => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [selectedTrial, setSelectedTrial] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recruitmentStatus, setRecruitmentStatus] = useState("all");
  const [location, setLocation] = useState("");

  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const role = localStorage.getItem("role")

  useEffect(() => {
    let mounted = true;
    async function loadTrials() {
      setLoading(true);
      setError(null);
      try {
        const data = await trialService.fetchTrials();
        if (mounted) setTrials(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (mounted) setError(err?.message ?? "Failed to load trials");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTrials();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredTrials = trials.filter((trial) => {
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      const inTitle = (trial.title ?? "").toLowerCase().includes(q);
      const inCondition = (trial.condition ?? "").toLowerCase().includes(q);
      const inDescription = (trial.description ?? "").toLowerCase().includes(q);
      const inSummary = (trial.summary ?? "").toLowerCase().includes(q);
      if (!inTitle && !inCondition && !inDescription && !inSummary) return false;
    }

    if (recruitmentStatus !== "all") {
      const trialStatus = trial.recruiting === true ? "recruiting" : "completed";
      if (trialStatus !== recruitmentStatus.toLowerCase()) return false;
    }

    if (location.trim()) {
      const loc = (trial.location ?? trial.site ?? "").toLowerCase();
      if (!loc.includes(location.trim().toLowerCase())) return false;
    }

    return true;
  });

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Recruitment Status</Label>
        <Select value={recruitmentStatus} onValueChange={setRecruitmentStatus}>
          <SelectTrigger>
            <SelectValue placeholder="All trials" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trials</SelectItem>
            <SelectItem value="recruiting">Recruiting</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
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
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Clinical Trials
            </h1>
            <p className="text-muted-foreground">
              Find clinical trials matching your condition
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for trials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

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

            <div className="hidden md:flex gap-4 justify-between">
              <div className="flex items-center justify-center gap-4">
                <Select value={recruitmentStatus} onValueChange={setRecruitmentStatus}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Recruitment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trials</SelectItem>
                    <SelectItem value="recruiting">Recruiting</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-[200px]"
                />
              </div>

              {/* Add Trial */}
             {role != "0" ? <AddTrialModal
                onSuccess={async () => {
                  try {
                    const data = await trialService.fetchTrials();
                    setTrials(Array.isArray(data) ? data : []);
                  } catch (err: any) {
                    console.error("Failed to refresh trials:", err);
                  }
                }}
              /> : ""}
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading clinical trials...</p>
            ) : error ? (
              <p className="text-sm text-destructive">Error loading trials: {error}</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Found {filteredTrials.length} clinical trials
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTrials.map((trial, i) => (
                    <TrialCard
                      key={trial.id ?? i}
                      {...trial}
                      isFavorite={isFavorite(trial.id, "trial")}
                      onToggleFavorite={() =>
                        toggleFavorite(trial.id, "trial", trial)
                      }
                      onViewDetails={() => setSelectedTrial(trial)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <TrialDetailsModal
        open={!!selectedTrial}
        onOpenChange={(open) => !open && setSelectedTrial(null)}
        trial={selectedTrial}
        onDelete={async () => {
          try {
            const data = await trialService.fetchTrials();
            setTrials(Array.isArray(data) ? data : []);
            setSelectedTrial(null);
          } catch (err: any) {
            console.error("Failed to refresh trials:", err);
          }
        }}
        onUpdate={async () => {
          try {
            const data = await trialService.fetchTrials();
            setTrials(Array.isArray(data) ? data : []);
            // Update selected trial with fresh data
            if (selectedTrial?.id) {
              const updatedTrial = data.find((t: any) => t.id === selectedTrial.id);
              if (updatedTrial) {
                setSelectedTrial(updatedTrial);
              }
            }
          } catch (err: any) {
            console.error("Failed to refresh trials:", err);
          }
        }}
      />
    </div>
  );
};

export default ClinicalTrials;