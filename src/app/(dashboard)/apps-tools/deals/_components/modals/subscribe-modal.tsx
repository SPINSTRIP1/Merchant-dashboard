import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campaign, campaignSchema } from "../../_schemas";
import toast from "react-hot-toast";
import api from "@/lib/api/axios-client";
import { SERVER_URL } from "@/constants";

export default function SubscribeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    formState: { errors },
    trigger,
    reset,
    getValues,
  } = useForm<Campaign>({
    resolver: zodResolver(campaignSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
    },
  });

  const handleNext = async () => {
    const isValid = await trigger([
      "name",
      "description",
      "startDate",
      "endDate",
    ]);
    if (!isValid) {
      toast.error("Please fill out all required fields.");
      return;
    }
    setLoading(true);
    try {
      const payload = getValues();
      await api.post(SERVER_URL + "/deals/campaigns", payload);
      toast.success("Campaign created successfully!");
      onClose();
      reset();
      return;
    } catch (error) {
      console.log(error);
      toast.error("Failed to create campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        className={
          "bg-foreground rounded-3xl flex flex-col gap-y-3 px-4 py-5  shadow-xl w-full max-h-[90vh] max-w-[760px] overflow-y-auto"
        }
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl text-primary-text font-bold">
          Create a Campaign
        </h1>
        <div className="space-y-7 mt-2">
          <div className="space-y-1.5">
            <Label>Campaign Name</Label>
            <Input
              {...register("name")}
              className="!rounded-2xl border border-neutral-accent"
              placeholder="Enter name of campaign"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Campaign Description</Label>
            <Textarea
              {...register("description")}
              className="rounded-2xl"
              placeholder="Describe the campaign"
              rows={6}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input
                {...register("startDate")}
                className="!rounded-2xl border border-neutral-accent"
                placeholder="Enter start date"
                type="date"
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input
                {...register("endDate")}
                className="!rounded-2xl border border-neutral-accent"
                placeholder="Enter end date"
                type="date"
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>
        </div>
        <div className="w-full gap-x-2 flex items-center mt-5 justify-center">
          <Button
            type="button"
            className="w-full"
            size={"lg"}
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
