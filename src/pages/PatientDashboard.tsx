import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TrialCard } from "@/components/TrialCard";
import { ExpertCard } from "@/components/ExpertCard";
import { TrialDetailsModal } from "@/components/TrialDetailsModal";
import { ExpertDetailsModal } from "@/components/ExpertDetailsModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trialService } from "@/services/trialService";
import { fetchExperts } from "@/services/expertService";
import { authService } from "@/services/authService";
import { useFavorites } from "@/hooks/useFavorites";

const PatientDashboard = () => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId")
  const userRole = localStorage.getItem("role")
  // console.log("user role type : ",typeof(userRole));

  const [selectedTrial, setSelectedTrial] = useState<any | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  const [trials, setTrials] = useState<any[]>([]);
  const [trialsLoading, setTrialsLoading] = useState(false);
  const [trialsError, setTrialsError] = useState<string | null>(null);

  const [experts, setExperts] = useState<any[]>([]);
  const [expertsLoading, setExpertsLoading] = useState(false);
  const [expertsError, setExpertsError] = useState<string | null>(null);

  const [userDetails, setUserDetails] = useState<any>();

  useEffect(() => {
    const load = async () => {
      setTrialsLoading(true);
      try {
        const data = await trialService.fetchTrials();
        setTrials(data);
      } catch (err: any) {
        setTrialsError(err.message || "Failed to load trials");
      } finally {
        setTrialsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadExperts = async () => {
      setExpertsLoading(true);
      try {
        const data = await fetchExperts();
        setExperts(data);
        console.log("Data: ",data);
      } catch (err: any) {
        setExpertsError(err.message || "Failed to load experts");
      } finally {
        setExpertsLoading(false);
      }
    };
    loadExperts();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.fetchUserById(userId);
        setUserDetails(user);
        // Log fetched user's name to console for debugging
        // console.log("Fetched user name:", user?.name);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar showSearch />

      <main className="flex-1">
        <div className="container py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome back, {userDetails?.name}
            </h1>
            <p className="text-muted-foreground">
              Here are your personalized recommendations based on your profile
            </p>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
              <TabsTrigger value="overview">Dashboard</TabsTrigger>
              <TabsTrigger value="trials">Clinical Trials</TabsTrigger>
              <TabsTrigger value="experts">Experts</TabsTrigger>
              <TabsTrigger value="forums" onClick={() => navigate("/forums")}>
                Forums
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Recommended Clinical Trials */}
              <section>
                <div className="flex items-center justify-between mb-4 md:mt-0 mt-16">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Recommended Clinical Trials
                  </h2>
                  <Button variant="ghost" onClick={() => navigate("/clinical-trials")}>
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-row gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {trialsLoading ? (
                    <div>Loading trials...</div>
                  ) : trialsError ? (
                    <div className="text-red-500">Error loading trials: {trialsError}</div>
                  ) : trials.length === 0 ? (
                    <div>No trials found.</div>
                  ) : (
                    trials.map((trial) => (
                      <div key={trial.id ?? trial.title} className="flex-shrink-0 w-80">
                      <TrialCard
                        key={trial.id ?? trial.title}
                        {...trial}
                        isFavorite={isFavorite(trial.id, 'trial')}
                          onToggleFavorite={() => toggleFavorite(trial.id, 'trial', trial)}
                          onViewDetails={() => setSelectedTrial(trial)}
                        />
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Recommended Experts */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Recommended Health Experts
                  </h2>
                  <Button variant="ghost" onClick={() => navigate("/experts")}>
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {expertsLoading ? (
                    <div>Loading experts...</div>
                  ) : expertsError ? (
                    <div className="text-red-500">Error loading experts: {expertsError}</div>
                  ) : experts.length === 0 ? (
                    <div>No experts found.</div>
                  ) : (
                    experts.map((expert) => (
                      <ExpertCard
                        key={expert.email ?? expert.name}
                        {...expert}
                        isFavorite={isFavorite(expert.id, 'expert')}
                        onToggleFavorite={() => toggleFavorite(expert.id, 'expert', expert)}
                        onViewDetails={() => setSelectedExpert(expert)}
                      />
                    ))
                  )}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="trials" className="space-y-6">
              <div className="flex items-center justify-between mb-4 md:mt-0 mt-16">
                <h2 className="text-2xl font-semibold text-foreground">
                  All Clinical Trials
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trialsLoading ? (
                  <div>Loading trials...</div>
                ) : trialsError ? (
                  <div className="text-red-500">Error loading trials: {trialsError}</div>
                ) : trials.length === 0 ? (
                  <div>No trials found.</div>
                ) : (
                  trials.map((trial) => (
                    <TrialCard
                      key={trial.id ?? trial.title}
                      {...trial}
                      isFavorite={isFavorite(trial.id, 'trial')}
                      onToggleFavorite={() => toggleFavorite(trial.id, 'trial', trial)}
                      onViewDetails={() => setSelectedTrial(trial)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="experts" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expertsLoading ? (
                  <div>Loading experts...</div>
                ) : expertsError ? (
                  <div className="text-red-500">Error loading experts: {expertsError}</div>
                ) : experts.length === 0 ? (
                  <div>No experts found.</div>
                ) : (
                  experts.map((expert) => (
                    <ExpertCard
                      key={expert.email ?? expert.name}
                      {...expert}
                      isFavorite={isFavorite(expert.id, 'expert')}
                      onToggleFavorite={() => toggleFavorite(expert.id, 'expert', expert)}
                      onViewDetails={() => setSelectedExpert(expert)}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Modals */}
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
    </div>
  );
};

export default PatientDashboard;
