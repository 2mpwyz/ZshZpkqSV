import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { CheckCircle, XCircle, MessageCircle, Loader } from "lucide-react";
import { supabase, TaskProposal } from "../lib/supabase";
import { toast } from "../hooks/use-toast";

interface ManagerProposalReviewProps {
  proposal: TaskProposal | null;
  taskTitle: string;
  providerName: string;
  onProposalUpdated?: () => void;
}

type ReviewAction = "accept" | "decline" | "counter";

export const ManagerProposalReview: React.FC<ManagerProposalReviewProps> = ({
  proposal,
  taskTitle,
  providerName,
  onProposalUpdated,
}) => {
  const [selectedAction, setSelectedAction] = useState<ReviewAction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [counterPrice, setCounterPrice] = useState("");
  const [counterTimeline, setCounterTimeline] = useState("");
  const [counterCategory, setCounterCategory] = useState("");
  const [counterEstimatedTime, setCounterEstimatedTime] = useState("");
  const [counterPaymentTerms, setCounterPaymentTerms] = useState("");
  const [counterNotes, setCounterNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!proposal) return null;

  const handleSubmitReview = async () => {
    if (!selectedAction) return;

    setIsSubmitting(true);
    try {
      const updateData: Record<string, any> = {};

      if (selectedAction === "accept") {
        updateData.status = "accepted";
      } else if (selectedAction === "decline") {
        updateData.status = "declined";
        updateData.proposal_notes = declineReason || proposal.proposal_notes;
      } else if (selectedAction === "counter") {
        updateData.status = "counter_proposed";
        if (counterPrice) updateData.quoted_price = parseFloat(counterPrice);
        if (counterTimeline) updateData.proposed_timeline = counterTimeline;
        if (counterCategory) updateData.proposed_category = counterCategory;
        if (counterEstimatedTime) updateData.proposed_estimated_time = counterEstimatedTime;
        if (counterPaymentTerms) updateData.proposed_payment_terms = counterPaymentTerms;
        if (counterNotes) updateData.proposal_notes = counterNotes;
      }

      const { error } = await supabase
        .from("task_proposals")
        .update(updateData)
        .eq("id", proposal.id);

      if (error) throw error;

      toast({
        title: "Success",
        description:
          selectedAction === "accept"
            ? "Proposal accepted! Task will move to provider's todo list."
            : selectedAction === "decline"
              ? "Proposal declined. Provider has been notified."
              : "Counter-proposal sent. Awaiting provider response.",
      });

      setSelectedAction(null);
      setDeclineReason("");
      setCounterPrice("");
      setCounterTimeline("");
      setCounterCategory("");
      setCounterEstimatedTime("");
      setCounterPaymentTerms("");
      setCounterNotes("");
      setIsDialogOpen(false);
      onProposalUpdated?.();
    } catch (error) {
      console.error("Error updating proposal:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update proposal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case "declined":
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      case "counter_proposed":
        return <Badge className="bg-blue-100 text-blue-800">Counter-Proposed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="border-sheraton-gold/30">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg text-sheraton-navy">
                Proposal from {providerName}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                For: {taskTitle}
              </CardDescription>
            </div>
            {getStatusBadge(proposal.status)}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Proposal Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {proposal.quoted_price && (
              <div className="p-4 bg-sheraton-cream rounded-lg border border-sheraton-gold/20">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Quoted Price
                </p>
                <p className="text-2xl font-bold text-green-700">
                  ${proposal.quoted_price.toFixed(2)}
                </p>
              </div>
            )}

            {proposal.proposed_timeline && (
              <div className="p-4 bg-sheraton-cream rounded-lg border border-sheraton-gold/20">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Timeline
                </p>
                <p className="text-lg font-semibold text-sheraton-navy">
                  {proposal.proposed_timeline}
                </p>
              </div>
            )}

            <div className="p-4 bg-sheraton-cream rounded-lg border border-sheraton-gold/20">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Status
              </p>
              <p className="text-lg font-semibold text-sheraton-navy capitalize">
                {proposal.status.replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Notes */}
          {proposal.proposal_notes && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Provider's Notes
              </p>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">{proposal.proposal_notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons - Only show if pending */}
          {proposal.status === "pending" && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => {
                  setSelectedAction("accept");
                  setIsDialogOpen(true);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => {
                  setSelectedAction("decline");
                  setIsDialogOpen(true);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  setSelectedAction("counter");
                  setIsDialogOpen(true);
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Counter-Propose
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedAction === "accept"
                ? "Accept Proposal"
                : selectedAction === "decline"
                  ? "Decline Proposal"
                  : "Counter-Propose"}
            </DialogTitle>
            <DialogDescription>
              {selectedAction === "accept"
                ? "Accept this proposal and move the task to the provider's todo list."
                : selectedAction === "decline"
                  ? "Decline this proposal and provide feedback if needed."
                  : "Suggest different terms for this task."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedAction === "decline" && (
              <div>
                <Label htmlFor="decline-feedback" className="font-semibold">
                  Feedback (optional)
                </Label>
                <Textarea
                  id="decline-feedback"
                  placeholder="Explain why you're declining this proposal..."
                  rows={4}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}

            {selectedAction === "counter" && (
              <>
                <div>
                  <Label htmlFor="counter-price" className="font-semibold">
                    Counter Price (optional)
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-gray-600">$</span>
                    <Input
                      id="counter-price"
                      type="number"
                      placeholder={proposal.quoted_price?.toString() || "0.00"}
                      step="0.01"
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="counter-timeline" className="font-semibold">
                    Counter Timeline (optional)
                  </Label>
                  <Input
                    id="counter-timeline"
                    type="text"
                    placeholder="e.g., 5 days, 1 week"
                    value={counterTimeline}
                    onChange={(e) => setCounterTimeline(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="counter-category" className="font-semibold">
                    Category (optional)
                  </Label>
                  <select
                    id="counter-category"
                    value={counterCategory}
                    onChange={(e) => setCounterCategory(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select a category</option>
                    <option value="operations">Operations</option>
                    <option value="service">Service</option>
                    <option value="training">Training</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="counter-estimated-time" className="font-semibold">
                    Estimated Time (optional)
                  </Label>
                  <Input
                    id="counter-estimated-time"
                    type="text"
                    placeholder="e.g., 8 hours, 2 days"
                    value={counterEstimatedTime}
                    onChange={(e) => setCounterEstimatedTime(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="counter-payment-terms" className="font-semibold">
                    Payment Terms (optional)
                  </Label>
                  <Textarea
                    id="counter-payment-terms"
                    placeholder="e.g., 50% upfront, 50% on completion"
                    rows={2}
                    value={counterPaymentTerms}
                    onChange={(e) => setCounterPaymentTerms(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="counter-notes" className="font-semibold">
                    Additional Notes (optional)
                  </Label>
                  <Textarea
                    id="counter-notes"
                    placeholder="Explain your counter-proposal and any other conditions..."
                    rows={3}
                    value={counterNotes}
                    onChange={(e) => setCounterNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </>
            )}

            {selectedAction === "accept" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Accepting this proposal will create a task entry in the
                  provider's todo list with the agreed terms.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className={
                selectedAction === "accept"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : selectedAction === "decline"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "sheraton-gradient text-white"
              }
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : selectedAction === "accept" ? (
                "Accept Proposal"
              ) : selectedAction === "decline" ? (
                "Decline Proposal"
              ) : (
                "Send Counter-Proposal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManagerProposalReview;
