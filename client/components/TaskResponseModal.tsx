import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { supabase, Task as TaskType } from "../lib/supabase";
import { toast } from "../hooks/use-toast";

interface TaskResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskType | null;
  providerId: string;
  providerName: string;
  onResponseSubmitted?: () => void;
}

type ResponseAction = "accept" | "decline" | "propose";

export const TaskResponseModal: React.FC<TaskResponseModalProps> = ({
  isOpen,
  onClose,
  task,
  providerId,
  providerName,
  onResponseSubmitted,
}) => {
  const [selectedAction, setSelectedAction] = useState<ResponseAction | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [proposalNotes, setProposalNotes] = useState("");
  const [proposedTimeline, setProposedTimeline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task) return null;

  const handleSubmitResponse = async () => {
    if (!selectedAction) return;

    setIsSubmitting(true);
    try {
      // 1. Insert task response
      const { data: responseData, error: responseError } = await supabase
        .from("task_responses")
        .insert([
          {
            task_id: task.id,
            provider_id: providerId,
            action: selectedAction,
            response_message:
              selectedAction === "decline"
                ? declineReason
                : selectedAction === "propose"
                  ? proposalNotes
                  : null,
          },
        ])
        .select()
        .single();

      if (responseError) throw responseError;

      // 2. If proposing, create proposal record
      if (selectedAction === "propose") {
        const { error: proposalError } = await supabase
          .from("task_proposals")
          .insert([
            {
              task_id: task.id,
              provider_id: providerId,
              manager_id: task.created_by,
              status: "pending",
              quoted_price: quotedPrice ? parseFloat(quotedPrice) : null,
              proposal_notes: proposalNotes,
              proposed_timeline: proposedTimeline,
            },
          ]);

        if (proposalError) throw proposalError;
      }

      // 3. If accepting, task system will create todo via trigger
      // Just notify the user

      toast({
        title: "Success",
        description:
          selectedAction === "accept"
            ? "Task accepted! You'll see it in your Todo List."
            : selectedAction === "decline"
              ? "Task declined. The manager has been notified."
              : "Proposal submitted! The manager will review your quote.",
      });

      // Reset and close
      setSelectedAction(null);
      setDeclineReason("");
      setQuotedPrice("");
      setProposalNotes("");
      setProposedTimeline("");
      onClose();
      onResponseSubmitted?.();
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit response",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-sheraton-navy">
                Respond to Task
              </h2>
            </div>
          </DialogTitle>
          <DialogDescription className="pt-2">
            You have been assigned a task. Review the details below and choose
            your action.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Details Card */}
          <Card className="bg-sheraton-cream border-sheraton-gold/30">
            <CardHeader>
              <CardTitle className="text-base text-sheraton-navy">
                {task.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">{task.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Priority
                  </p>
                  <Badge className={`${getPriorityColor(task.priority)} mt-1`}>
                    {task.priority}
                  </Badge>
                </div>

                {task.due_date && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Due Date
                    </p>
                    <p className="font-semibold text-sheraton-navy mt-1">
                      {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {task.estimated_time && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Est. Time
                    </p>
                    <p className="font-semibold text-sheraton-navy mt-1">
                      {task.estimated_time}
                    </p>
                  </div>
                )}

                {task.budget && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Budget
                    </p>
                    <p className="font-semibold text-green-700 mt-1">
                      ${parseFloat(task.budget.toString()).toFixed(2)}
                    </p>
                  </div>
                )}

                {task.category && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Category
                    </p>
                    <p className="font-semibold text-sheraton-navy mt-1 capitalize">
                      {task.category}
                    </p>
                  </div>
                )}

                {task.payment_terms && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Payment Terms
                    </p>
                    <p className="font-semibold text-sheraton-navy mt-1 text-xs">
                      {task.payment_terms}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Selection */}
          <div className="space-y-3">
            <p className="font-semibold text-sheraton-navy">What would you like to do?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedAction("accept")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedAction === "accept"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300 bg-white"
                }`}
              >
                <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-600" />
                <p className="font-semibold text-sm text-gray-900">Accept</p>
                <p className="text-xs text-gray-500 mt-1">
                  Take this task now
                </p>
              </button>

              <button
                onClick={() => setSelectedAction("decline")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedAction === "decline"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300 bg-white"
                }`}
              >
                <XCircle className="h-5 w-5 mx-auto mb-2 text-red-600" />
                <p className="font-semibold text-sm text-gray-900">Decline</p>
                <p className="text-xs text-gray-500 mt-1">
                  Can't do this task
                </p>
              </button>

              <button
                onClick={() => setSelectedAction("propose")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedAction === "propose"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 bg-white"
                }`}
              >
                <MessageSquare className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                <p className="font-semibold text-sm text-gray-900">Propose</p>
                <p className="text-xs text-gray-500 mt-1">
                  Suggest different terms
                </p>
              </button>
            </div>
          </div>

          {/* Conditional Forms */}
          {selectedAction === "decline" && (
            <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <Label htmlFor="decline-reason" className="font-semibold">
                Why are you declining? (optional)
              </Label>
              <Textarea
                id="decline-reason"
                placeholder="Please explain why you cannot take this task..."
                rows={4}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
            </div>
          )}

          {selectedAction === "propose" && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <Label htmlFor="quoted-price" className="font-semibold">
                  Quoted Price
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-600">$</span>
                  <Input
                    id="quoted-price"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="proposed-timeline" className="font-semibold">
                  Proposed Timeline
                </Label>
                <Input
                  id="proposed-timeline"
                  placeholder="e.g., 2-3 days, 1 week, etc."
                  value={proposedTimeline}
                  onChange={(e) => setProposedTimeline(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="proposal-notes" className="font-semibold">
                  Additional Notes
                </Label>
                <Textarea
                  id="proposal-notes"
                  placeholder="Explain your proposal, any special requirements, or questions..."
                  rows={4}
                  value={proposalNotes}
                  onChange={(e) => setProposalNotes(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {selectedAction === "accept" && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✓ By accepting this task, it will immediately appear in your
                Todo List with all the details above. You can then mark it as
                in progress and track completion.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitResponse}
            disabled={!selectedAction || isSubmitting}
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
                Submitting...
              </>
            ) : (
              <>
                {selectedAction === "accept"
                  ? "Accept Task"
                  : selectedAction === "decline"
                    ? "Decline Task"
                    : "Submit Proposal"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskResponseModal;
