import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { trialService } from "@/services/trialService";
import { toast } from "@/hooks/use-toast";

export const AddTrialModal = ({
  onSuccess,
}: {
  onSuccess: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    phase: "",
    location: "",
    summary: "",
    recruiting: false,
    description: "",
    eligibility: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    institution: "",
    enrollment: "",
  });

  const update = (key: string, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.phase.trim() || !form.location.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please provide a title, phase, and location.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: form.title,
        phase: form.phase,
        location: form.location,
        summary: form.summary,
        recruiting: form.recruiting,
        description: form.description,
        eligibility: form.eligibility
          .split("\n")
          .map((e) => e.trim())
          .filter(Boolean),
        contact: {
          name: form.contactName,
          email: form.contactEmail,
          phone: form.contactPhone,
        },
        institution: form.institution,
        enrollment: form.enrollment,
      };

      await trialService.createTrial(payload);

      toast({
        title: "Trial created",
        description: "The clinical trial has been added successfully.",
      });
      onSuccess();
      setOpen(false);

      // reset form
      setForm({
        title: "",
        phase: "",
        location: "",
        summary: "",
        recruiting: false,
        description: "",
        eligibility: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        institution: "",
        enrollment: "",
      });
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to save trial";
      toast({
        title: "Failed to save trial",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Trial
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Clinical Trial</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>

          <div>
            <Label>Phase</Label>
            <Input
              value={form.phase}
              onChange={(e) => update("phase", e.target.value)}
              placeholder="Phase 1 / Phase 2 / Phase 3"
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => update("location", e.target.value)} />
          </div>

          <div>
            <Label>Summary</Label>
            <Textarea value={form.summary} onChange={(e) => update("summary", e.target.value)} />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>

          <div>
            <Label>Eligibility (one per line)</Label>
            <Textarea
              value={form.eligibility}
              onChange={(e) => update("eligibility", e.target.value)}
              placeholder={`Adults aged 40-85 years\nDiagnosed non-valvular atrial fibrillation`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Contact Name</Label>
              <Input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
            </div>

            <div>
              <Label>Contact Email</Label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
              />
            </div>

            <div>
              <Label>Contact Phone</Label>
              <Input
                value={form.contactPhone}
                onChange={(e) => update("contactPhone", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Institution</Label>
            <Input value={form.institution} onChange={(e) => update("institution", e.target.value)} />
          </div>

          <div>
            <Label>Enrollment</Label>
            <Input value={form.enrollment} onChange={(e) => update("enrollment", e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="recruiting-checkbox"
              type="checkbox"
              checked={form.recruiting}
              onChange={(e) => update("recruiting", e.target.checked)}
            />
            <Label htmlFor="recruiting-checkbox">Recruiting</Label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Trial"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
