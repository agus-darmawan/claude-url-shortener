"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Edit } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const editUrlSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});

type EditFormData = z.infer<typeof editUrlSchema>;

interface EditUrlDialogProps {
  url: {
    id: string;
    title: string | null;
    description: string | null;
    expiresAt: string | null;
    isActive: boolean;
  };
  onUpdate: () => void;
}

export function EditUrlDialog({ url, onUpdate }: EditUrlDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm<EditFormData>({
    resolver: zodResolver(editUrlSchema),
    defaultValues: {
      title: url.title || "",
      description: url.description || "",
      expiresAt: url.expiresAt
        ? new Date(url.expiresAt).toISOString().slice(0, 16)
        : "",
      isActive: url.isActive,
    },
  });

  const isActive = watch("isActive");

  const onSubmit = async (data: EditFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/urls/${url.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title || null,
          description: data.description || null,
          expiresAt: data.expiresAt
            ? new Date(data.expiresAt).toISOString()
            : null,
          isActive: data.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update URL");
      }

      toast.success("Link updated successfully!");
      setOpen(false);
      onUpdate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Link
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>
            Update your link settings and metadata.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              {...register("title")}
              id="title"
              placeholder="My awesome link"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              {...register("description")}
              id="description"
              placeholder="Link description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
            <div className="relative">
              <Input
                {...register("expiresAt")}
                id="expiresAt"
                type="datetime-local"
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
