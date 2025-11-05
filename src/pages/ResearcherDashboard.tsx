import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { TrialCard } from "@/components/TrialCard";
import { PublicationCard } from "@/components/PublicationCard";
import { TrialDetailsModal } from "@/components/TrialDetailsModal";
import { PublicationDetailsModal } from "@/components/PublicationDetailsModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Users, FileText, FlaskConical, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchTrials } from "@/services/trialService";
import { fetchAllPublications } from "@/services/publicationService";
import { authService } from "@/services/authService";
import { useFavorites } from "@/hooks/useFavorites";

const ResearcherDashboard = () => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId")

  const [selectedTrial, setSelectedTrial] = useState<any | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<any | null>(null);
  const [trials, setTrials] = useState<any[]>([]);
  const [trialsLoading, setTrialsLoading] = useState(false);
  const [trialsError, setTrialsError] = useState<string | null>(null);

  const [publications, setPublications] = useState<any[]>([]);
  const [publicationsLoading, setPublicationsLoading] = useState(false);
  const [publicationsError, setPublicationsError] = useState<string | null>(null);

  const [userDetails, setUserDetails] = useState<any>();

  useEffect(() => {
    const load = async () => {
      setTrialsLoading(true);
      try {
        const data = await fetchTrials();
        const activeTrials = Array.isArray(data) ? data.filter((d) => d?.status === "recruiting") : [];
        setTrials(activeTrials);
        // console.log("Data ", data);
      } catch (err: any) {
        setTrialsError(err.message || "Failed to load trials");
      } finally {
        setTrialsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadPublications = async () => {
      setPublicationsLoading(true);
      try {
        const data = await fetchAllPublications();
        const recentPublications = Array.isArray(data) ? data.filter((d) => d?.year === "2025" || d?.year === "2024") : [];
        setPublications(recentPublications);
      } catch (err: any) {
        setPublicationsError(err.message || "Failed to load publications");
      } finally {
        setPublicationsLoading(false);
      }
    };
    loadPublications();
  }, []);

  const stats = [
    {
      title: "Active Trials",
      value: "12",
      change: "+3 this month",
      icon: FlaskConical,
    },
    {
      title: "Total Patients",
      value: "847",
      change: "+124 this month",
      icon: Users,
    },
    {
      title: "Publications",
      value: "28",
      change: "+5 this quarter",
      icon: FileText,
    },
    {
      title: "Success Rate",
      value: "78%",
      change: "+12% vs last year",
      icon: TrendingUp,
    },
  ];

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
              Overview of your research activities and collaborations
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
              <TabsTrigger value="overview">Dashboard</TabsTrigger>
              <TabsTrigger value="trials">My Trials</TabsTrigger>
              <TabsTrigger value="publications">Publications</TabsTrigger>
              <TabsTrigger value="forums" onClick={() => navigate("/forums")}>
                Forums
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Active Clinical Trials */}
              <section>
                <div className="flex items-center justify-between mb-4 md:mt-0 mt-16">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Active Clinical Trials
                  </h2>
                  <Button variant="ghost" onClick={() => navigate("/clinical-trials")}>
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
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
              </section>

              {/* Recent Publications */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Recent Publications
                  </h2>
                  <Button variant="ghost" onClick={() => navigate("/publications")}>
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {publicationsLoading ? (
                    <div>Loading publications...</div>
                  ) : publicationsError ? (
                    <div className="text-red-500">Error loading publications: {publicationsError}</div>
                  ) : publications.length === 0 ? (
                    <div>No publications found.</div>
                  ) : (
                    publications.map((pub) => (
                      <PublicationCard
                        key={pub.id ?? pub.title}
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
                    ))
                  )}
                </div>
              </section>

              {/* Patient Inquiries */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Recent Patient Inquiries
                  </h2>
                  <Button variant="ghost">
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      name: "Alex Chen",
                      condition: "Non-Small Cell Lung Cancer",
                      message: "Interested in the Phase 2 immunotherapy trial...",
                      time: "2 hours ago",
                    },
                    {
                      name: "Maria Garcia",
                      condition: "Glioblastoma",
                      message: "Would like to learn more about CAR-T therapy eligibility...",
                      time: "5 hours ago",
                    },
                    {
                      name: "John Smith",
                      condition: "EGFR+ Lung Cancer",
                      message: "Requesting consultation for targeted therapy trial...",
                      time: "1 day ago",
                    },
                  ].map((inquiry, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{inquiry.name}</CardTitle>
                            <CardDescription>{inquiry.condition}</CardDescription>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {inquiry.time}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {inquiry.message}
                        </p>
                        <Button size="sm">Respond</Button>
                      </CardContent>
                    </Card>
                  ))}
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

            <TabsContent value="publications" className="space-y-6">
              <div className="flex items-center justify-between mb-4 md:mt-0 mt-16">
                <h2 className="text-2xl font-semibold text-foreground">
                  All Publications
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {publicationsLoading ? (
                  <div>Loading publications...</div>
                ) : publicationsError ? (
                  <div className="text-red-500">Error loading publications: {publicationsError}</div>
                ) : publications.length === 0 ? (
                  <div>No publications found.</div>
                ) : (
                  publications.map((pub) => (
                    <PublicationCard
                      key={pub.id ?? pub.title}
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
      <PublicationDetailsModal
        open={!!selectedPublication}
        onOpenChange={(open) => !open && setSelectedPublication(null)}
        publication={selectedPublication}
      />
    </div>
  );
};

export default ResearcherDashboard;
