import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trialService } from "@/services/trialService";
import { useToast } from "@/hooks/use-toast";

interface EditTrialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trial: {
    id?: string | number;
    title: string;
    phase: string;
    location: string;
    summary: string;
    recruiting: boolean;
    description?: string;
    eligibility?: string[];
    contact?: {
      name: string;
      email: string;
      phone: string;
    };
    institution?: string;
    enrollment?: string;
    status?: string;
  } | null;
  onSuccess?: () => void;
}

export const EditTrialModal = ({ open, onOpenChange, trial, onSuccess }: EditTrialModalProps) => {
  const { toast } = useToast();
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
    statusActive: false,
  });

  useEffect(() => {
    if (trial && open) {
      const statusActive = trial.status?.toLowerCase() === "active";
      console.log("Trial status:", trial.status, "-> statusActive:", statusActive);
      setForm({
        title: trial.title || "",
        phase: trial.phase || "",
        location: trial.location || "",
        summary: trial.summary || "",
        recruiting: trial.recruiting || false,
        description: trial.description || "",
        eligibility: trial.eligibility ? trial.eligibility.join("\n") : "",
        contactName: trial.contact?.name || "",
        contactEmail: trial.contact?.email || "",
        contactPhone: trial.contact?.phone || "",
        institution: trial.institution || "",
        enrollment: trial.enrollment || "",
        statusActive: statusActive,
      });
    } else if (!trial && open) {
      // Reset form when modal opens without trial
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
        statusActive: false,
      });
    }
  }, [trial, open]);

  const update = (key: string, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!trial?.id) {
      toast({
        title: "Error",
        description: "Trial ID is missing. Cannot update trial.",
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
        status: form.statusActive ? "active" : "inactive",
      };

      console.log("Updating trial with payload:", payload);
      await trialService.updateTrial(trial.id, payload);

      toast({
        title: "Success",
        description: "Trial updated successfully.",
      });

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to update trial",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!trial) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Clinical Trial</DialogTitle>
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
              id="recruiting-checkbox-edit"
              type="checkbox"
              checked={form.recruiting}
              onChange={(e) => update("recruiting", e.target.checked)}
            />
            <Label htmlFor="recruiting-checkbox-edit">Recruiting</Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="status-checkbox-edit"
              type="checkbox"
              checked={form.statusActive}
              onChange={(e) => update("statusActive", e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="status-checkbox-edit" className="cursor-pointer">
              Status: Active
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Update Trial"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

