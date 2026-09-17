import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { supabase, TaskProposal, Task } from "../lib/supabase";
import { toast } from "../hooks/use-toast";
import NegotiationChat from "./NegotiationChat";

interface ServiceProviderProposalReviewProps {
  proposal: TaskProposal | null;
  taskTitle: string;
  managerName: string;
  task?: Task;
  currentUserId?: string; // auth.users.id
  currentUserProfileId?: string; // user_profiles.id
  onProposalUpdated?: () => void;
}

type ProposalAction = "accept" | "decline" | "counter" | "chat";

export const ServiceProviderProposalReview: React.FC<ServiceProviderProposalReviewProps> = ({
  proposal,
  taskTitle,
  managerName,
  task,
  currentUserId,
  currentUserProfileId,
  onProposalUpdated,
}) => {
  const [selectedAction, setSelectedAction] = useState<ProposalAction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showNegotiationChat, setShowNegotiationChat] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [counterPrice, setCounterPrice] = useState("");
  const [counterTimeline, setCounterTimeline] = useState("");
  const [counterCategory, setCounterCategory] = useState("");
  const [counterEstimatedTime, setCounterEstimatedTime] = useState("");
  const [counterPaymentTerms, setCounterPaymentTerms] = useState("");
  const [counterNotes, setCounterNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!proposal) return null;

  const handleSubmitResponse = async () => {
    if (!selectedAction) return;

    setIsSubmitting(true);
    try {
      if (selectedAction === "accept") {
        // Accept the proposal - updates status to accepted
        const { error } = await supabase
          .from("task_proposals")
          .update({ status: "accepted" })
          .eq("id", proposal.id);

        if (error) throw error;

        toast({
          title: "Proposal Accepted",
          description: "Your proposal has been accepted! A todo will be created with the agreed terms.",
        });
      } else if (selectedAction === "decline") {
        // Decline the proposal
        const { error } = await supabase
          .from("task_proposals")
          .update({
            status: "declined",
            proposal_notes: declineReason || proposal.proposal_notes,
          })
          .eq("id", proposal.id);

        if (error) throw error;

        toast({
          title: "Proposal Declined",
          description: "The manager has been notified. You can submit a new proposal.",
        });
      } else if (selectedAction === "counter") {
        // Counter-propose with new terms
        const { error } = await supabase
          .from("task_proposals")
          .update({
            status: "counter_proposed",
            quoted_price: counterPrice ? parseFloat(counterPrice) : proposal.quoted_price,
            proposed_timeline: counterTimeline || proposal.proposed_timeline,
            proposed_category: counterCategory || proposal.proposed_category,
            proposed_estimated_time: counterEstimatedTime || proposal.proposed_estimated_time,
            proposed_payment_terms: counterPaymentTerms || proposal.proposed_payment_terms,
            proposal_notes: counterNotes || proposal.proposal_notes,
          })
          .eq("id", proposal.id);

        if (error) throw error;

        toast({
          title: "Counter-Proposal Sent",
          description: "Your counter-proposal has been sent to the manager. They will review and respond.",
        });
      }

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
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Waiting for Manager
          </Badge>
        );
      case "counter_proposed":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Manager Counter-Proposed
          </Badge>
        );
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted ✓</Badge>;
      case "declined":
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const isNegotiationActive = proposal.status === "pending" || proposal.status === "counter_proposed";

  return (
    <>
      <Card className="border-2 border-sheraton-gold/30 bg-gradient-to-br from-white to-sheraton-cream">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg text-sheraton-navy">
                Manager Response
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                For: {taskTitle}
              </p>
            </div>
            {getStatusBadge(proposal.status)}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {proposal.quoted_price && (
              <div className="p-4 bg-white rounded-lg border border-sheraton-gold/20">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Quoted Price
                </p>
                <p className="text-2xl font-bold text-green-700">
                  ${proposal.quoted_price.toFixed(2)}
                </p>
              </div>
            )}

            {proposal.proposed_timeline && (
              <div className="p-4 bg-white rounded-lg border border-sheraton-gold/20">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Timeline
                </p>
                <p className="text-lg font-semibold text-sheraton-navy">
                  {proposal.proposed_timeline}
                </p>
              </div>
            )}

            <div className="p-4 bg-white rounded-lg border border-sheraton-gold/20">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Status
              </p>
              <p className="text-lg font-semibold text-sheraton-navy capitalize">
                {proposal.status.replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Notes from Manager */}
          {proposal.proposal_notes && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Manager's Message
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">{proposal.proposal_notes}</p>
              </div>
            </div>
          )}

          {/* Status-specific messaging */}
          {proposal.status === "accepted" && (
            <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-sm font-semibold text-green-800">
                ✓ Your proposal has been accepted by the manager!
              </p>
              <p className="text-xs text-green-700 mt-2">
                A todo will be created in your Todo List with these agreed terms.
              </p>
            </div>
          )}

          {proposal.status === "declined" && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-sm font-semibold text-red-800">
                This proposal was declined
              </p>
              <p className="text-xs text-red-700 mt-2">
                You can submit a new proposal or use live chat to discuss alternatives.
              </p>
            </div>
          )}

          {proposal.status === "counter_proposed" && (
            <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg">
              <p className="text-sm font-semibold text-blue-800">
                Manager has sent a counter-proposal
              </p>
              <p className="text-xs text-blue-700 mt-2">
                Review the terms above and decide to accept, counter, or discuss via chat.
              </p>
            </div>
          )}

          {/* Action Buttons - Only for active negotiation */}
          {isNegotiationActive && (
            <div className="flex gap-3 pt-4 border-t flex-wrap">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
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
                className="sheraton-gradient text-white"
                onClick={() => {
                  setSelectedAction("counter");
                  setIsDialogOpen(true);
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Counter-Propose
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="ml-auto border-sheraton-gold text-sheraton-gold hover:bg-sheraton-cream"
                onClick={() => setShowNegotiationChat(true)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Open Chat
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
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
                ? "Accept this proposal and proceed with the task."
                : selectedAction === "decline"
                  ? "Decline and explain why you cannot accept."
                  : "Suggest different terms."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedAction === "decline" && (
              <div>
                <Label htmlFor="decline-reason" className="font-semibold">
                  Why are you declining? (optional)
                </Label>
                <Textarea
                  id="decline-reason"
                  placeholder="Explain your reason..."
                  rows={3}
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
                    Your Counter Price (optional)
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
                    Your Counter Timeline (optional)
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
                <p className="text-sm text-green-800 font-semibold">
                  ✓ By accepting, you agree to the terms above.
                </p>
                <p className="text-xs text-green-700 mt-2">
                  A todo will be created immediately with these agreed terms.
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
              onClick={handleSubmitResponse}
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
                "Accept"
              ) : selectedAction === "decline" ? (
                "Decline"
              ) : (
                "Send Counter-Proposal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Negotiation Chat Dialog */}
      <Dialog open={showNegotiationChat} onOpenChange={setShowNegotiationChat}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Negotiation Discussion</DialogTitle>
            <DialogDescription>
              Discuss and finalize terms with {managerName}
            </DialogDescription>
          </DialogHeader>

          {proposal && task && currentUserId && currentUserProfileId && (
            <div className="p-6">
              <NegotiationChat
                proposalId={proposal.id}
                taskId={proposal.task_id}
                currentUserId={currentUserId}
                currentUserProfileId={currentUserProfileId}
                currentUserRole="service_provider"
                otherPartyName={managerName}
                initialProposal={proposal}
                task={task}
                onNegotiationFinalized={() => {
                  setShowNegotiationChat(false);
                  onProposalUpdated?.();
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServiceProviderProposalReview;
