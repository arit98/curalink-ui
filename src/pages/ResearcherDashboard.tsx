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
import { trialService } from "@/services/trialService";
import { publicationService } from "@/services/publicationService";
import { authService } from "@/services/authService";
import { researcherService } from "@/services/researcherService";
import { useFavorites } from "@/hooks/useFavorites";
import { CreatePublicationModal } from "@/components/CreatePublicationModal";
import { DiscussionModal } from "@/components/Discussion Modal";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiConfig";

const ResearcherDashboard = () => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId")

  const [selectedTrial, setSelectedTrial] = useState<any | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<any | null>(null);
  const [trials, setTrials] = useState<any[]>([]);
  const [allTrials, setAllTrials] = useState<any[]>([]);
  const [trialsLoading, setTrialsLoading] = useState(false);
  const [trialsError, setTrialsError] = useState<string | null>(null);

  const [publications, setPublications] = useState<any[]>([]);
  const [publicationsLoading, setPublicationsLoading] = useState(false);
  const [publicationsError, setPublicationsError] = useState<string | null>(null);

  const [patients, setPatients] = useState<any[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState<string | null>(null);

  const [forumReplies, setForumReplies] = useState<any[]>([]);
  const [forumRepliesLoading, setForumRepliesLoading] = useState(false);

  const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const [userDetails, setUserDetails] = useState<any>();

  useEffect(() => {
    const load = async () => {
      setTrialsLoading(true);
      try {
        const data = await trialService.fetchTrials();
        const allTrialsData = Array.isArray(data) ? data : [];
        setAllTrials(allTrialsData);
        const activeTrials = allTrialsData.filter((d) => {
          const status = (d?.status || "").toLowerCase();
          return status === "active";
        });
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
        const data = await publicationService.fetchAllPublications();
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

  useEffect(() => {
    const loadPatients = async () => {
      setPatientsLoading(true);
      try {
        const data = await researcherService.fetchPatientsInterested();
        setPatients(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setPatientsError(err.message || "Failed to load patients");
        console.error("Error loading patients:", err);
      } finally {
        setPatientsLoading(false);
      }
    };
    loadPatients();
  }, []);

  // Helper function to get date from various possible field names
  const getDateFromObject = (obj: any): Date | null => {
    if (!obj) return null;
    const dateFields = ['created_at', 'createdAt', 'timestamp', 'date', 'created_date', 'start_date'];
    for (const field of dateFields) {
      if (obj[field]) {
        const date = new Date(obj[field]);
        if (!isNaN(date.getTime())) return date;
      }
    }
    return null;
  };

  // Calculate active trials change this month
  const calculateActiveTrialsChange = () => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const currentActive = trials.filter(t => {
      const status = (t?.status || "").toLowerCase();
      return status === "active";
    }).length;

    // Count trials that became active this month
    const activeThisMonth = allTrials.filter(t => {
      const status = (t?.status || "").toLowerCase();
      if (status !== "active") return false;
      const trialDate = getDateFromObject(t);
      return trialDate && trialDate >= oneMonthAgo && trialDate <= now;
    }).length;

    if (activeThisMonth === 0) return "No change this month";
    return `+${activeThisMonth} this month`;
  };

  // Calculate patients change this month
  const calculatePatientsChange = () => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const patientsThisMonth = patients.filter(p => {
      const patientDate = getDateFromObject(p);
      return patientDate && patientDate >= oneMonthAgo && patientDate <= now;
    }).length;

    if (patientsThisMonth === 0) return "No change this month";
    return `+${patientsThisMonth} this month`;
  };

  // Calculate publications change this quarter
  const calculatePublicationsChange = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3); // 0, 1, 2, or 3
    
    // Get publications from current quarter
    const publicationsThisQuarter = publications.filter(pub => {
      const pubYear = pub.year ? parseInt(pub.year) : null;
      if (pubYear !== currentYear) return false;
      
      const pubDate = getDateFromObject(pub);
      if (pubDate) {
        const pubMonth = pubDate.getMonth();
        const pubQuarter = Math.floor(pubMonth / 3);
        return pubQuarter === currentQuarter;
      }
      // Fallback: if no date, assume current quarter if year matches
      return true;
    }).length;

    if (publicationsThisQuarter === 0) return "No change this quarter";
    return `+${publicationsThisQuarter} this quarter`;
  };

  // Calculate success rate dynamically
  const calculateSuccessRate = () => {
    const totalTrials = allTrials.length;
    if (totalTrials === 0) return { value: "0%", change: "No data" };

    // Count completed/successful trials
    const completedTrials = allTrials.filter(t => {
      const status = (t?.status || "").toLowerCase();
      return status === "completed" || status === "successful" || status === "closed";
    }).length;

    const successRate = totalTrials > 0 ? Math.round((completedTrials / totalTrials) * 100) : 0;

    // Calculate change from last year (simplified - compare with previous year's data if available)
    // For now, we'll use a simple calculation based on recent completions
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    const recentCompleted = allTrials.filter(t => {
      const status = (t?.status || "").toLowerCase();
      if (status !== "completed" && status !== "successful" && status !== "closed") return false;
      const trialDate = getDateFromObject(t);
      return trialDate && trialDate >= oneYearAgo && trialDate <= now;
    }).length;

    // Estimate previous year's rate (simplified)
    const previousTotal = Math.max(1, totalTrials - recentCompleted);
    const previousCompleted = Math.max(0, completedTrials - recentCompleted);
    const previousRate = previousTotal > 0 ? Math.round((previousCompleted / previousTotal) * 100) : 0;
    const change = successRate - previousRate;

    if (change === 0) return { value: `${successRate}%`, change: "No change vs last year" };
    const changeSign = change > 0 ? "+" : "";
    return { value: `${successRate}%`, change: `${changeSign}${change}% vs last year` };
  };

  const successRateData = calculateSuccessRate();

  const stats = [
    {
      title: "Active Trials",
      value: trials.filter(t => {
        const status = (t?.status || "").toLowerCase();
        return status === "active";
      }).length,
      change: calculateActiveTrialsChange(),
      icon: FlaskConical,
    },
    {
      title: "Total Patients",
      value: patientsLoading ? "..." : patients.length.toString(),
      change: calculatePatientsChange(),
      icon: Users,
    },
    {
      title: "Publications",
      value: publications.length,
      change: calculatePublicationsChange(),
      icon: FileText,
    },
    {
      title: "Success Rate",
      value: successRateData.value,
      change: successRateData.change,
      icon: TrendingUp,
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.fetchUserById(userId);
        setUserDetails(user);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = (now.getTime() - past.getTime()) / 1000;

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return `${Math.floor(diff / 604800)} weeks ago`;
  };

  const fetchForumReplies = async () => {
    setForumRepliesLoading(true);
    try {
      const BASE_URL = getApiBaseUrl();
      
      // Fetch categories first to get category names
      const categoriesResponse = await axios.get(`${BASE_URL}/forums/categories`);
      const categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
      
      // Fetch all forum posts
      const postsResponse = await axios.get(`${BASE_URL}/forums/posts`);
      const posts = Array.isArray(postsResponse.data) ? postsResponse.data : [];
      
      // Fetch replies for each post
      const allReplies: any[] = [];
      for (const post of posts) {
        try {
          const repliesResponse = await axios.get(`${BASE_URL}/forums/posts/${post.id}/replies`);
          const replies = Array.isArray(repliesResponse.data) ? repliesResponse.data : [];
          
          // Find category name for this post
          const category = categories.find((c: any) => c.id === post.category_id);
          const categoryName = category?.name || post.category || post.categoryName || "General";
          
          // Add post information to each reply
          replies.forEach((reply: any) => {
            allReplies.push({
              ...reply,
              postId: post.id,
              postTitle: post.title,
              postCategory: categoryName,
            });
          });
        } catch (err) {
          // Skip posts with no replies or errors
          console.error(`Error fetching replies for post ${post.id}:`, err);
        }
      }
      
      // Randomly shuffle and select up to 5 replies
      const shuffled = allReplies.sort(() => Math.random() - 0.5);
      const selectedReplies = shuffled.slice(0, 5).map((reply: any) => ({
        name: reply.author || "Anonymous",
        condition: reply.postCategory || reply.postTitle || "General Discussion",
        message: reply.content || "",
        time: timeAgo(reply.timestamp || new Date().toISOString()),
        postId: reply.postId,
      }));
      
      setForumReplies(selectedReplies);
    } catch (err) {
      console.error("Error fetching forum replies:", err);
      setForumReplies([]);
    } finally {
      setForumRepliesLoading(false);
    }
  };

  useEffect(() => {
    fetchForumReplies();
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
                <div className="flex flex-row gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {publicationsLoading ? (
                    <div>Loading publications...</div>
                  ) : publicationsError ? (
                    <div className="text-red-500">Error loading publications: {publicationsError}</div>
                  ) : publications.length === 0 ? (
                    <div>No publications found.</div>
                  ) : (
                    publications.map((pub) => (
                      <div key={pub.id ?? pub.title} className="flex-shrink-0 w-[42rem]">
                        <PublicationCard
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
                      </div>
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
                </div>
                <div className="space-y-4">
                  {forumRepliesLoading ? (
                    <div>Loading inquiries...</div>
                  ) : forumReplies.length === 0 ? (
                    <div>No inquiries found.</div>
                  ) : (
                    forumReplies.map((inquiry, i) => (
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
                        <Button 
                          size="sm" 
                          onClick={() => {
                            if (inquiry.postId) {
                              setSelectedPostId(inquiry.postId);
                              setIsDiscussionModalOpen(true);
                            }
                          }}
                        >
                          Respond
                        </Button>
                      </CardContent>
                    </Card>
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
                ) : allTrials.length === 0 ? (
                  <div>No trials found.</div>
                ) : (
                  allTrials.map((trial) => (
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
                  Top Publications
                </h2>
                <CreatePublicationModal
                  onSuccess={async () => {
                    try {
                      const data = await publicationService.fetchAllPublications();
                      const recentPublications = Array.isArray(data) ? data.filter((d) => d?.year === "2025" || d?.year === "2024") : [];
                      setPublications(recentPublications);
                    } catch (err: any) {
                      console.error("Failed to refresh publications:", err);
                    }
                  }}
                />
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
        onDelete={async () => {
          try {
            const data = await trialService.fetchTrials();
            const allTrialsData = Array.isArray(data) ? data : [];
            setAllTrials(allTrialsData);
            const activeTrials = allTrialsData.filter((d) => {
              const status = (d?.status || "").toLowerCase();
              return status === "active";
            });
            setTrials(activeTrials);
            setSelectedTrial(null);
          } catch (err: any) {
            console.error("Failed to refresh trials:", err);
          }
        }}
        onUpdate={async () => {
          try {
            const data = await trialService.fetchTrials();
            const allTrialsData = Array.isArray(data) ? data : [];
            setAllTrials(allTrialsData);
            const activeTrials = allTrialsData.filter((d) => {
              const status = (d?.status || "").toLowerCase();
              return status === "active";
            });
            setTrials(activeTrials);
            // Update selected trial with fresh data
            if (selectedTrial?.id) {
              const updatedTrial = allTrialsData.find((t: any) => t.id === selectedTrial.id);
              if (updatedTrial) {
                setSelectedTrial(updatedTrial);
              }
            }
          } catch (err: any) {
            console.error("Failed to refresh trials:", err);
          }
        }}
      />
      <PublicationDetailsModal
        open={!!selectedPublication}
        onOpenChange={(open) => !open && setSelectedPublication(null)}
        publication={selectedPublication}
        isFavorite={selectedPublication ? isFavorite(selectedPublication.id, 'publication') : false}
        onToggleFavorite={() => selectedPublication && toggleFavorite(selectedPublication.id, 'publication', selectedPublication)}
        onDelete={async () => {
          setSelectedPublication(null);
          try {
            const data = await publicationService.fetchAllPublications();
            const recentPublications = Array.isArray(data) ? data.filter((d) => d?.year === "2025" || d?.year === "2024") : [];
            setPublications(recentPublications);
          } catch (err: any) {
            console.error("Failed to refresh publications:", err);
          }
        }}
      />
      <DiscussionModal
        isOpen={isDiscussionModalOpen}
        onClose={() => {
          setIsDiscussionModalOpen(false);
          setSelectedPostId(null);
        }}
        postId={selectedPostId}
        isFavorite={selectedPostId ? isFavorite(selectedPostId, 'forum') : false}
        onToggleFavorite={() => {
          if (selectedPostId) {
            // Find the post to toggle favorite
            // We'll need to fetch it or pass it, but for now just toggle by ID
            toggleFavorite(selectedPostId, 'forum', { id: selectedPostId });
          }
        }}
        onPostDeleted={() => {
          // Refresh forum replies when a post is deleted
          fetchForumReplies();
        }}
        onReplyAdded={(postId, replyCount) => {
          // Optionally refresh the replies list
          console.log(`Reply added to post ${postId}, new count: ${replyCount}`);
        }}
      />
    </div>
  );
};

export default ResearcherDashboard;
