"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReportBikeForm } from "./ReportBikeForm";
import { Shield } from "lucide-react";

interface ReportBikeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportBikeDialog({ open, onOpenChange }: ReportBikeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add bike data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'images') {
          formData.append(key, value as string);
        }
      });
      
      // Add images
      data.images.forEach((image: File) => {
        formData.append(`images`, image);
      });

      // Submit to API
      const response = await fetch('/api/bikes/report', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit report');
      }

      // Show success message and close dialog
      alert(`Report submitted successfully! Report ID: ${result.reportId}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert(`Error submitting report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-orange-500" />
            Report Lost Bike
          </DialogTitle>
          <DialogDescription>
            Help us recover your stolen motorcycle by providing detailed information about your bike and the theft incident.
          </DialogDescription>
        </DialogHeader>
        <ReportBikeForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}