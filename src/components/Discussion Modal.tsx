import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Mail, Trash2, Send, ThumbsUp, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiConfig";

interface Reply {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;

  // UI fields
  editing?: boolean;
  editText?: string;
}

interface DiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number | null;
  onPostDeleted?: () => void;
  onReplyAdded?: (postId: number, replyCount: number) => void;
}

export const DiscussionModal = ({ isOpen, onClose, postId, onPostDeleted, onReplyAdded }: DiscussionModalProps) => {
  const [post, setPost] = useState<any | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostPreview, setEditPostPreview] = useState("");

  const BASE_URL = getApiBaseUrl();

  const fetchPostDetails = async () => {
    if (!postId) return;

    try {
      const response = await axios.get(`${BASE_URL}/forums/posts/${postId}`);
      setPost(response.data || null);
    } catch (err) {
      console.error("Error loading post:", err);
      setPost(null);
    }
  };

  const deletePost = async () => {
    if (!postId) return;

    try {
      await axios.delete(`${BASE_URL}/forums/posts/${postId}`);
      setShowDeleteDialog(false);
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      });
      onClose();
      onPostDeleted?.();
    } catch (err) {
      console.error("Error deleting post:", err);
      setShowDeleteDialog(false);
      toast({
        title: "Failed to delete post",
        description: "An error occurred while deleting the post.",
        variant: "destructive",
      });
    }
  };

  const fetchReplies = async (): Promise<number> => {
    if (!postId) return 0;

    try {
      const response = await axios.get(`${BASE_URL}/forums/posts/${postId}/replies`);
      let data = response.data;

      if (Array.isArray(data)) {
        const count = data.length;
        data = data.map((r: any) => ({
          ...r,
          editing: false,
          editText: r.content,
        }));
        setReplies(data);
        return count;
      }

      setReplies([]);
      return 0;
    } catch (err) {
      console.error("Error loading replies:", err);
      setReplies([]);
      return 0;
    }
  };

  const deleteReply = async (replyId: string) => {
    try {
      await axios.delete(`${BASE_URL}/forums/posts/${postId}/replies/${replyId}`);
      toast({ title: "Reply deleted" });
      const count = await fetchReplies();
      if (postId && onReplyAdded) {
        onReplyAdded(postId, count);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to delete reply", variant: "destructive" });
    }
  };

  const saveEditedReply = async (replyId: string) => {
    const reply = replies.find((r) => r.id === replyId);
    if (!reply || !reply.editText?.trim()) return;

    try {
      await axios.put(`${BASE_URL}/forums/posts/${postId}/replies/${replyId}`, {
        content: reply.editText,
      }, {
        headers: { "Content-Type": "application/json" },
      });

      toast({ title: "Reply updated" });
      fetchReplies();
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to update reply", variant: "destructive" });
    }
  };

  const saveEditedPost = async () => {
    if (!postId || !editPostTitle.trim() || !editPostPreview.trim()) {
      toast({
        title: "Invalid input",
        description: "Title and preview cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.put(`${BASE_URL}/forums/posts/${postId}`, {
        title: editPostTitle,
        preview: editPostPreview,
      }, {
        headers: { "Content-Type": "application/json" },
      });

      toast({ title: "Post updated" });
      setIsEditingPost(false);
      fetchPostDetails();
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to update post", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (isOpen && postId) {
      fetchPostDetails();
      fetchReplies();
      setIsEditingPost(false);
    }
  }, [isOpen, postId]);

  useEffect(() => {
    if (post) {
      setEditPostTitle(post.title || "");
      setEditPostPreview(post.preview || "");
    }
  }, [post]);

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      return toast({
        title: "Empty reply",
        description: "Write something before sending!",
        variant: "destructive",
      });
    }

    try {
      const body = {
        content: replyText,
        author: localStorage.getItem("username") || "Anonymous",
        role: localStorage.getItem("role") === "0" ? "Patient" : "Researcher",
      };

      await axios.post(`${BASE_URL}/forums/posts/${postId}/replies`, body, {
        headers: { "Content-Type": "application/json" },
      });

      setReplyText("");
      const count = await fetchReplies();
      if (postId && onReplyAdded) {
        onReplyAdded(postId, count);
      }
      toast({ title: "Reply posted successfully" });
    } catch (err) {
      console.error("Error sending reply:", err);
      toast({ title: "Failed to send reply", variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[82vh] p-0 pt-8">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 bg-primary/10 text-primary">
              <AvatarFallback className="text-lg font-semibold">
                {post?.author?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              {isEditingPost ? (
                <div className="space-y-3">
                  <Input
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                    placeholder="Post title"
                    className="text-lg font-bold"
                  />
                  <Textarea
                    value={editPostPreview}
                    onChange={(e) => setEditPostPreview(e.target.value)}
                    placeholder="Post preview"
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEditedPost}>
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingPost(false);
                        setEditPostTitle(post.title || "");
                        setEditPostPreview(post.preview || "");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <DialogTitle className="text-lg font-bold">{post.title}</DialogTitle>

                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-medium">{post.author}</span>

                    <Badge variant="default" className="text-xs">
                      {post.role}
                    </Badge>

                    <span className="text-sm text-muted-foreground">
                      {formatDate(post.timestamp)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {!isEditingPost && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:text-yellow-500 hover:bg-yellow-500/10"
                  onClick={() => setIsEditingPost(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:text-red-500 hover:bg-red-500/10"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="sm" className="gap-2">
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {!isEditingPost && (
            <DialogDescription className="mt-4 text-base">
              {post.preview}
            </DialogDescription>
          )}
        </DialogHeader>

        <Separator />

        {/* Replies */}
        <ScrollArea
          className="px-6 pt-4 pb-0 h-[250px] scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
        >
          <div className="space-y-6">
            <h3 className="text-sm font-semibold">Discussion ({replies.length})</h3>

            {replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <Avatar className="h-9 w-9 bg-secondary">
                  <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{reply.author}</span>

                    <Badge variant="outline">{reply.role}</Badge>

                    <span className="text-xs text-muted-foreground">
                      {formatDate(reply.timestamp)}
                    </span>
                  </div>

                  {/* EDIT MODE */}
                  {reply.editing ? (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={reply.editText}
                        onChange={(e) => {
                          setReplies((prev) =>
                            prev.map((r) =>
                              r.id === reply.id ? { ...r, editText: e.target.value } : r
                            )
                          );
                        }}
                      />
                      <Button size="sm" onClick={() => saveEditedReply(reply.id)}>
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setReplies((prev) =>
                            prev.map((r) =>
                              r.id === reply.id ? { ...r, editing: false } : r
                            )
                          )
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm mt-1">{reply.content}</p>
                  )}

                  <div className="flex gap-3 mt-2">
                    <Button
                      variant="ghost"
                      className="text-xs px-2"
                      onClick={() =>
                        setReplies((prev) =>
                          prev.map((r) =>
                            r.id === reply.id
                              ? { ...r, editing: true, editText: r.content }
                              : r
                          )
                        )
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      variant="ghost"
                      className="text-xs text-red-500 px-2"
                      onClick={() => deleteReply(reply.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        {/* Add Reply */}
        <div className="flex items-center justify-center mb-16">
          <Input
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-[600px] m-auto"
          />

          <div className="flex justify-end m-auto">
            <Button onClick={handleSendReply} disabled={!replyText.trim()}>
              <Send className="h-4 w-4 mr-1 rotate-45" />
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post and all its replies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deletePost}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
