import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Users } from "lucide-react";

const Forums = () => {
  const categories = [
    { name: "Cancer Research", posts: 142, color: "bg-primary" },
    { name: "Clinical Trials", posts: 89, color: "bg-secondary" },
    { name: "Treatment Options", posts: 234, color: "bg-primary" },
    { name: "Patient Support", posts: 567, color: "bg-secondary" },
  ];

  const posts = [
    {
      id: 1,
      title: "New immunotherapy combination showing promising results",
      author: "Dr. Sarah Chen",
      role: "Researcher",
      category: "Cancer Research",
      replies: 24,
      preview: "Recent data from our Phase 2 trial indicates that combining checkpoint inhibitors with targeted therapy may improve outcomes...",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      title: "Questions about eligibility criteria for CAR-T trials",
      author: "Patient Alex",
      role: "Patient",
      category: "Clinical Trials",
      replies: 12,
      preview: "I've been diagnosed with glioblastoma and wondering if I would qualify for CAR-T cell therapy trials...",
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      title: "Understanding biomarker testing for precision medicine",
      author: "Dr. Michael Rodriguez",
      role: "Researcher",
      category: "Treatment Options",
      replies: 31,
      preview: "Comprehensive guide on how biomarker testing helps match patients with targeted therapies based on tumor characteristics...",
      timestamp: "1 day ago",
    },
    {
      id: 4,
      title: "Managing side effects of immunotherapy",
      author: "Patient Jordan",
      role: "Patient",
      category: "Patient Support",
      replies: 45,
      preview: "I'm currently on pembrolizumab and experiencing some fatigue. What strategies have helped others manage these side effects?",
      timestamp: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar showSearch />

      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Community Forums
            </h1>
            <p className="text-muted-foreground">
              Connect with researchers and other patients
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar - Categories */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category.name}
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <div className={`h-2 w-2 rounded-full ${category.color} mr-2`} />
                      <span className="flex-1 text-left">{category.name}</span>
                      <span className="text-xs text-muted-foreground">{category.posts}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Posts</span>
                    <span className="font-semibold">1,032</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-semibold">423</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Researchers</span>
                    <span className="font-semibold">87</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Posts */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-foreground">Recent Discussions</h2>
                <Button>New Post</Button>
              </div>

              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {post.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base mb-1">{post.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium">{post.author}</span>
                            <Badge variant="outline" className="text-xs">
                              {post.role}
                            </Badge>
                            <span>•</span>
                            <span>{post.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.preview}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{post.replies} replies from researchers</span>
                      </div>
                      <Button variant="outline" size="sm">View Discussion</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Forums;
