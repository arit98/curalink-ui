import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Users, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { colorPool } from "@/lib/helper";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiConfig";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DiscussionModal } from "@/components/Discussion Modal";

const Forums = () => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const location = useLocation();
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    role: "",
    category_id: "",
    preview: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = (now.getTime() - past.getTime()) / 1000;

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${getApiBaseUrl()}/forums/categories`
      );
      const data = response.data;

      const enhanced = data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        posts: cat.total_posts ?? 0,
        color: colorPool[Math.floor(Math.random() * colorPool.length)],
      }));

      setCategories(enhanced);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        `${getApiBaseUrl()}/forums/posts`
      );
      const data = response.data;

      const merged = data.map((post: any) => {
        const category = categories.find((c: any) => c.id === post.category_id);
        return {
          ...post,
          categoryName: category ? category.name : null,
          timestampText: timeAgo(post.timestamp),
        };
      });

      // Filter out posts with no valid category
      const validPosts = merged.filter((post: any) => post.categoryName !== null);
      setPosts(validPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!form.title.trim() || !form.author.trim() || !form.category_id || !form.preview.trim()) {
      toast({
        title: "Missing details",
        description: "Please fill in the title, author, category, and preview before submitting.",
        variant: "destructive",
      });
      return;
    }

    const body = {
      ...form,
      role: localStorage.getItem("role") === "0" ? "patient" : "researcher",
      replies: 0,
    };

    setIsSubmitting(true);
    try {
      await axios.post(`${getApiBaseUrl()}/forums/posts`, body, {
        headers: { "Content-Type": "application/json" },
      });

      toast({ title: "Post created", description: "Your discussion is now live." });
      setOpen(false);
      setForm({
        title: "",
        author: "",
        role: "",
        category_id: "",
        preview: "",
      });
      fetchPosts();
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "Failed to create post",
        description: error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Only fetch posts after categories are loaded
    if (categories.length > 0) {
      fetchPosts();
    }
  }, [categories]);

  // Get search query from URL params
  const searchQuery = new URLSearchParams(location.search).get("search") || "";

  // Filter posts by search query only (for category counts)
  const searchFilteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    
    const q = searchQuery.toLowerCase();
    const matchesTitle = (post.title ?? "").toLowerCase().includes(q);
    const matchesAuthor = (post.author ?? "").toLowerCase().includes(q);
    const matchesPreview = (post.preview ?? "").toLowerCase().includes(q);
    const matchesCategory = (post.categoryName ?? post.category ?? "").toLowerCase().includes(q);
    
    return matchesTitle || matchesAuthor || matchesPreview || matchesCategory;
  });

  // Filter posts based on search query and selected category (for display)
  const filteredPosts = searchFilteredPosts.filter((post) => {
    // Filter by category
    if (selectedCategoryId !== null && post.category_id !== selectedCategoryId) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* -------- MODAL FOR CREATE POST -------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter post title"
              />
            </div>

            <div>
              <Label>Author</Label>
              <Input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label>Role</Label>
              <Input
                readOnly
                type="string"
                value={localStorage.getItem("role") === "0" ? "Patient" : "Researcher"}
                placeholder="1"
              />
            </div>

            <div>
              <Label>Category</Label>
              <select
                className="border rounded-md w-full p-2"
                value={form.category_id}
                onChange={(e) =>
                  // @ts-ignore
                  setForm({ ...form, category_id: Number(e.target.value) })
                }
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Preview Text</Label>
              <Textarea
                value={form.preview}
                onChange={(e) =>
                  setForm({ ...form, preview: e.target.value })
                }
                placeholder="Short description..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleCreatePost} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* -------- END MODAL -------- */}

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
                  <Button
                    variant={selectedCategoryId === null ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategoryId(null)}
                  >
                    <span className="flex-1 text-left font-medium">All Categories</span>
                    <span className="text-xs text-muted-foreground">
                      {filteredPosts.length}
                    </span>
                  </Button>
                  {categories.map((category) => {
                    const postCount = searchFilteredPosts.filter((post) => post.category_id === category.id).length;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategoryId === category.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategoryId(category.id)}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${category.color} mr-2`}
                        />
                        <span className="flex-1 text-left">
                          {category.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {postCount}
                        </span>
                      </Button>
                    );
                  })}
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
                    <span className="font-semibold text-muted-foreground">
                      {filteredPosts.length.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-semibold text-muted-foreground">
                      {new Set(filteredPosts.map((post) => post.author)).size.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Researchers</span>
                    <span className="font-semibold text-muted-foreground">
                      {new Set(
                        filteredPosts
                          .filter((post) =>
                            post.role?.toLowerCase?.().includes("researcher")
                          )
                          .map((post) => post.author)
                      ).size.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Posts */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-foreground">
                  Recent Discussions
                </h2>
                <Button onClick={() => setOpen(true)}>New Post</Button>
              </div>

              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {post.author?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base mb-1">
                            {post.title}
                          </CardTitle>

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
                      <div className="flex items-center gap-2">
                        {(post.category || post.categoryName) && (
                          <Badge variant="default">{post.category || post.categoryName}</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(post.id, 'forum', post);
                          }}
                        >
                          <Heart
                            className={`h-4 w-4 ${isFavorite(post.id, 'forum') ? 'fill-destructive text-destructive' : ''}`}
                          />
                        </Button>
                      </div>
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
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedPost(post);
                        setIsModalOpen(true);
                      }}>
                        View Discussion
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <DiscussionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        postId={selectedPost?.id || null}
        isFavorite={selectedPost ? isFavorite(selectedPost.id, 'forum') : false}
        onToggleFavorite={() => {
          if (selectedPost) {
            toggleFavorite(selectedPost.id, 'forum', selectedPost);
          }
        }}
        onPostDeleted={() => {
          fetchPosts();
        }}
        onReplyAdded={(postId, replyCount) => {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, replies: replyCount } : post
            )
          );
        }}
      />
    </div>
  );
};

export default Forums;