import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Loader,
  Send,
  AlertCircle,
  DollarSign,
  Clock,
  FileText,
  X,
  CheckCircle,
  Paperclip,
} from "lucide-react";
import { supabase, TaskMessage, Task, TaskProposal } from "../lib/supabase";
import { toast } from "../hooks/use-toast";
import FileUploadZone, { FileAttachment } from "./FileUploadZone";
import VoiceRecorder from "./VoiceRecorder";
import { useFileUpload } from "../hooks/useFileUpload";

interface KeyTerms {
  price?: number;
  timeline?: string;
  notes?: string;
  category?: string;
  estimatedTime?: string;
  paymentTerms?: string;
  [key: string]: string | number | undefined;
}

interface NegotiationChatProps {
  proposalId: string;
  taskId: string;
  currentUserId: string; // auth.users.id
  currentUserProfileId: string; // user_profiles.id (required for todo_list.provider_id)
  currentUserRole: "manager" | "service_provider";
  otherPartyName: string;
  initialProposal: TaskProposal;
  task: Task;
  onNegotiationFinalized?: () => void;
}

const NegotiationChat: React.FC<NegotiationChatProps> = ({
  proposalId,
  taskId,
  currentUserId,
  currentUserProfileId,
  currentUserRole,
  otherPartyName,
  initialProposal,
  task,
  onNegotiationFinalized,
}) => {
  const [messages, setMessages] = useState<TaskMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [keyTerms, setKeyTerms] = useState<KeyTerms>({
    price: initialProposal.quoted_price || undefined,
    timeline: initialProposal.proposed_timeline || undefined,
    notes: initialProposal.proposal_notes || undefined,
    category: initialProposal.proposed_category || task.category || undefined,
    estimatedTime: initialProposal.proposed_estimated_time || task.estimated_time || undefined,
    paymentTerms: initialProposal.proposed_payment_terms || task.payment_terms || undefined,
  });
  const [editingTerms, setEditingTerms] = useState<KeyTerms>({
    price: initialProposal.quoted_price || undefined,
    timeline: initialProposal.proposed_timeline || undefined,
    notes: initialProposal.proposal_notes || undefined,
    category: initialProposal.proposed_category || task.category || undefined,
    estimatedTime: initialProposal.proposed_estimated_time || task.estimated_time || undefined,
    paymentTerms: initialProposal.proposed_payment_terms || task.payment_terms || undefined,
  });
  const [showFinalizationDialog, setShowFinalizationDialog] = useState(false);
  const [isFinalizingTodo, setIsFinalizingTodo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { uploadMultipleFiles } = useFileUpload();

  useEffect(() => {
    loadMessages();
    subscribeToMessages();

    return () => {
      supabase.channel(`negotiation:${proposalId}`).unsubscribe();
    };
  }, [proposalId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("task_messages")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load negotiation messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    supabase
      .channel(`negotiation:${proposalId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "task_messages",
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as TaskMessage]);
        }
      )
      .subscribe();
  };

  const handleAddAttachments = (newAttachments: FileAttachment[]) => {
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.attachmentId !== id));
  };

  const handleSaveTermsEdits = () => {
    setKeyTerms(editingTerms);
    setIsEditingTerms(false);
    toast({
      title: "Key terms updated",
      description: "Changes will be saved when you finalize the negotiation.",
    });
  };

  const handleCancelTermsEdits = () => {
    setEditingTerms(keyTerms);
    setIsEditingTerms(false);
  };

  const handleVoiceRecording = async (file: File) => {
    try {
      const uploadedFiles = await uploadMultipleFiles([file], "negotiations");
      if (uploadedFiles.length > 0) {
        handleAddAttachments(uploadedFiles as FileAttachment[]);
        toast({
          title: "Voice note uploaded",
          description: "Your voice note is ready to send",
        });
        setShowVoiceRecorder(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload voice note",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && attachments.length === 0) return;

    setIsSubmitting(true);
    try {
      // Insert message without attachments JSONB (will use junction table instead)
      const { data: messageData, error: messageError } = await supabase
        .from("task_messages")
        .insert([
          {
            task_id: taskId,
            sender_id: currentUserId,
            sender_role: currentUserRole,
            message_text: messageText,
            attachments: null, // Not using JSONB anymore - using junction table
          },
        ])
        .select("id")
        .single();

      if (messageError) throw messageError;
      if (!messageData) throw new Error("Failed to create message");

      // Link attachments to message using junction table (task_message_attachments)
      if (attachments.length > 0) {
        const attachmentLinks = attachments.map((a) => ({
          message_id: messageData.id,
          attachment_id: a.attachmentId,
        }));

        const { error: linkError } = await supabase
          .from("task_message_attachments")
          .insert(attachmentLinks);

        // Don't throw if linking fails - message was created successfully
      }

      setMessageText("");
      setAttachments([]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizeNegotiation = async () => {
    setIsFinalizingTodo(true);
    try {
      // Validate required parameters
      if (!currentUserProfileId) {
        throw new Error("User profile not found. Please refresh and try again.");
      }

      // Update proposal status to accepted with ALL negotiated terms
      const { error: proposalError } = await supabase
        .from("task_proposals")
        .update({
          status: "accepted",
          quoted_price: keyTerms.price,
          proposed_timeline: keyTerms.timeline,
          proposal_notes: keyTerms.notes,
          proposed_category: keyTerms.category,
          proposed_estimated_time: keyTerms.estimatedTime,
          proposed_payment_terms: keyTerms.paymentTerms,
        })
        .eq("id", proposalId);

      if (proposalError) throw proposalError;

      // Determine provider_id based on role
      // For service_provider: use currentUserProfileId
      // For manager: use initialProposal.provider_id (the service provider's profile ID)
      const providerId = currentUserRole === "service_provider"
        ? currentUserProfileId
        : initialProposal.provider_id;

      if (!providerId) {
        throw new Error("Provider ID is missing. Cannot create task.");
      }

      // Check if a todo already exists for this task to prevent duplicates
      // (could exist from old task_responses flow)
      const { data: existingTodos } = await supabase
        .from("todo_list")
        .select("id")
        .eq("task_id", taskId)
        .eq("provider_id", providerId);

      let todoData;
      let todoError;

      if (existingTodos && existingTodos.length > 0) {
        // Update existing todo with ALL negotiated terms
        const { data: updatedTodo, error: updateError } = await supabase
          .from("todo_list")
          .update({
            details: {
              // Original task fields (for audit trail)
              category_original: task.category,
              estimated_time_original: task.estimated_time,
              payment_terms_original: task.payment_terms,
              budget_original: task.budget,

              // FINAL AGREED TERMS ✅
              category: keyTerms.category || task.category,              // Negotiated or original
              estimated_time: keyTerms.estimatedTime || task.estimated_time,  // Negotiated or original
              payment_terms: keyTerms.paymentTerms || task.payment_terms,     // Negotiated or original
              budget: keyTerms.price,                                    // AGREED PRICE ✅
              timeline: keyTerms.timeline,                               // AGREED TIMELINE ✅
              negotiation_notes: keyTerms.notes,                         // AGREED NOTES ✅
            },
          })
          .eq("id", existingTodos[0].id)
          .select("id")
          .single();

        todoData = updatedTodo;
        todoError = updateError;
      } else {
        // Create new todo with ALL agreed terms
        // CRITICAL: provider_id MUST be from user_profiles.id, NOT auth.users.id
        const { data: newTodo, error: createError } = await supabase
          .from("todo_list")
          .insert([
            {
              task_id: taskId,
              provider_id: providerId, // This MUST be user_profiles.id
              status: "pending",
              title: task.title,
              description: task.description,
              priority: task.priority || "medium",
              due_date: task.due_date,
              estimated_hours: keyTerms.estimatedTime
                ? parseInt(keyTerms.estimatedTime)
                : null,
              details: {
                // Original task fields (for audit trail)
                category_original: task.category,
                estimated_time_original: task.estimated_time,
                payment_terms_original: task.payment_terms,
                budget_original: task.budget,

                // FINAL AGREED TERMS ✅
                category: keyTerms.category || task.category,              // Negotiated or original
                estimated_time: keyTerms.estimatedTime || task.estimated_time,  // Negotiated or original
                payment_terms: keyTerms.paymentTerms || task.payment_terms,     // Negotiated or original
                budget: keyTerms.price,                                    // AGREED PRICE ✅
                timeline: keyTerms.timeline,                               // AGREED TIMELINE ✅
                negotiation_notes: keyTerms.notes,                         // AGREED NOTES ✅
              },
              attachments: attachments.length > 0 ? attachments.map((a) => ({
                id: a.attachmentId,
                name: a.originalName,
                size: a.fileSize,
              })) : null,
            },
          ])
          .select("id")
          .single();

        todoData = newTodo;
        todoError = createError;
      }

      if (todoError) throw todoError;
      if (!todoData) throw new Error("Failed to create or update todo");

      toast({
        title: "Negotiation Finalized",
        description: "Agreement accepted! Task has been added to Your Accepted Tasks.",
      });

      setShowFinalizationDialog(false);
      onNegotiationFinalized?.();
    } catch (error) {
      console.error("Error finalizing negotiation:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to finalize negotiation",
        variant: "destructive",
      });
    } finally {
      setIsFinalizingTodo(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-4">
      {/* Key Terms Summary */}
      <Card className="border-sheraton-gold/30 bg-gradient-to-r from-sheraton-cream to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-sheraton-navy flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Current Key Terms
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingTerms(keyTerms);
                setIsEditingTerms(!isEditingTerms);
              }}
              className="text-xs"
            >
              {isEditingTerms ? "Cancel" : "Edit Terms"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditingTerms ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Price ($)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={editingTerms.price || ""}
                    onChange={(e) =>
                      setEditingTerms((prev) => ({
                        ...prev,
                        price: e.target.value ? parseFloat(e.target.value) : undefined,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Timeline</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 5 days, 2 weeks"
                    value={editingTerms.timeline || ""}
                    onChange={(e) =>
                      setEditingTerms((prev) => ({
                        ...prev,
                        timeline: e.target.value || undefined,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Category</Label>
                <select
                  value={editingTerms.category || ""}
                  onChange={(e) =>
                    setEditingTerms((prev) => ({
                      ...prev,
                      category: e.target.value || undefined,
                    }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select a category</option>
                  <option value="operations">Operations</option>
                  <option value="service">Service</option>
                  <option value="training">Training</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Estimated Time</Label>
                <Input
                  type="text"
                  placeholder="e.g., 8 hours, 2 days"
                  value={editingTerms.estimatedTime || ""}
                  onChange={(e) =>
                    setEditingTerms((prev) => ({
                      ...prev,
                      estimatedTime: e.target.value || undefined,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Payment Terms</Label>
                <Textarea
                  placeholder="e.g., 50% upfront, 50% on completion"
                  value={editingTerms.paymentTerms || ""}
                  onChange={(e) =>
                    setEditingTerms((prev) => ({
                      ...prev,
                      paymentTerms: e.target.value || undefined,
                    }))
                  }
                  rows={2}
                  className="mt-1 resize-none"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Additional Notes</Label>
                <Textarea
                  placeholder="Any other important terms or conditions..."
                  value={editingTerms.notes || ""}
                  onChange={(e) =>
                    setEditingTerms((prev) => ({
                      ...prev,
                      notes: e.target.value || undefined,
                    }))
                  }
                  rows={2}
                  className="mt-1 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleSaveTermsEdits}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Save Changes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelTermsEdits}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {keyTerms.price !== undefined && (
                <div className="p-3 bg-white rounded-lg border border-sheraton-gold/20">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Agreed Price
                    </p>
                  </div>
                  <p className="text-lg font-bold text-green-700">
                    ${keyTerms.price.toFixed(2)}
                  </p>
                </div>
              )}

              {keyTerms.timeline && (
                <div className="p-3 bg-white rounded-lg border border-sheraton-gold/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Timeline
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-sheraton-navy">
                    {keyTerms.timeline}
                  </p>
                </div>
              )}

              {keyTerms.category && (
                <div className="p-3 bg-white rounded-lg border border-sheraton-gold/20">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Category
                  </p>
                  <p className="text-sm font-semibold text-sheraton-navy capitalize">
                    {keyTerms.category}
                  </p>
                </div>
              )}

              {keyTerms.estimatedTime && (
                <div className="p-3 bg-white rounded-lg border border-sheraton-gold/20">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Est. Time
                  </p>
                  <p className="text-sm font-semibold text-sheraton-navy">
                    {keyTerms.estimatedTime}
                  </p>
                </div>
              )}

              {keyTerms.paymentTerms && (
                <div className="p-3 bg-white rounded-lg border border-sheraton-gold/20 md:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Payment Terms
                  </p>
                  <p className="text-sm text-gray-700">{keyTerms.paymentTerms}</p>
                </div>
              )}

              {keyTerms.notes && (
                <div className="p-3 bg-white rounded-lg border border-sheraton-gold/20 md:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Notes
                  </p>
                  <p className="text-sm text-gray-700">{keyTerms.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Card */}
      <Card className="flex flex-col h-96">
        <CardHeader className="border-b bg-gradient-to-r from-sheraton-cream to-white">
          <CardTitle className="flex items-center justify-between text-base">
            <div>
              <p className="text-xs font-semibold text-sheraton-gold uppercase tracking-wide mb-1">
                Negotiation Chat
              </p>
              <p className="text-base text-sheraton-navy">
                With {otherPartyName}
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="h-5 w-5 animate-spin text-sheraton-gold" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    No messages yet. Start negotiating!
                  </p>
                  <p className="text-xs text-gray-400">
                    Discuss and finalize key terms like price, timeline, and more.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === currentUserId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      message.sender_id === currentUserId
                        ? "bg-sheraton-gold text-white rounded-br-none"
                        : "bg-white border border-gray-300 text-gray-900 rounded-bl-none"
                    } px-4 py-3 rounded-lg`}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {message.sender_role === "manager"
                        ? "Manager"
                        : "Service Provider"}
                    </p>
                    <p className="text-sm break-words">{message.message_text}</p>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1 border-t border-current border-opacity-20 pt-2">
                        {message.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={`/attachments/${att.id}`}
                            className={`text-xs underline block truncate opacity-75 hover:opacity-100`}
                            title={att.name}
                          >
                            📎 {att.name}
                          </a>
                        ))}
                      </div>
                    )}

                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Attached Files ({attachments.length})
              </p>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {attachments.map((att) => (
                  <div
                    key={att.attachmentId}
                    className="flex items-center justify-between text-xs text-gray-600 bg-white p-2 rounded"
                  >
                    <span className="truncate">{att.originalName}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleRemoveAttachment(att.attachmentId)
                      }
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Input Area */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-sm font-semibold mb-2">Your Message</Label>
            <Textarea
              placeholder="Discuss the terms, ask questions, or make adjustments..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Press Ctrl+Enter to send
            </p>
          </div>

          {/* File Upload */}
          <div>
            <Label className="text-sm font-semibold mb-2">
              Attachments (Optional)
            </Label>
            <FileUploadZone
              attachments={attachments}
              onAddAttachments={handleAddAttachments}
              onRemoveAttachment={handleRemoveAttachment}
              maxFiles={5}
              maxSizeMB={25}
              folderPath="negotiations"
            />
          </div>

          {/* Voice Recording */}
          <div>
            <Label className="text-sm font-semibold mb-2">
              Voice Note (Optional)
            </Label>
            {showVoiceRecorder && (
              <VoiceRecorder
                onRecordingComplete={handleVoiceRecording}
                disabled={isSubmitting}
              />
            )}
            {!showVoiceRecorder && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowVoiceRecorder(true)}
                disabled={isSubmitting}
                className="w-full"
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Record Voice Note
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSendMessage}
              disabled={
                isSubmitting ||
                (!messageText.trim() && attachments.length === 0)
              }
              className="sheraton-gradient text-white gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowFinalizationDialog(true)}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white gap-2 ml-auto"
            >
              <CheckCircle className="h-4 w-4" />
              Finalize & Accept
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Finalization Dialog */}
      {showFinalizationDialog && (
        <Card className="border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Finalize Negotiation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-700 mb-3">
                You're about to finalize this negotiation and create a task in
                your "Your Accepted Tasks" with these agreed terms:
              </p>

              <div className="space-y-2 mb-4">
                {keyTerms.price !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-600">Price:</span>
                    <span className="text-green-700 font-bold">
                      ${keyTerms.price.toFixed(2)}
                    </span>
                  </div>
                )}
                {keyTerms.timeline && (
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-600">Timeline:</span>
                    <span className="text-gray-900">{keyTerms.timeline}</span>
                  </div>
                )}
                {keyTerms.category && (
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-600">Category:</span>
                    <span className="text-gray-900 capitalize">{keyTerms.category}</span>
                  </div>
                )}
                {keyTerms.estimatedTime && (
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-600">Est. Time:</span>
                    <span className="text-gray-900">{keyTerms.estimatedTime}</span>
                  </div>
                )}
                {keyTerms.paymentTerms && (
                  <div className="text-sm">
                    <span className="font-semibold text-gray-600">Payment Terms:</span>
                    <p className="text-gray-700 mt-1">{keyTerms.paymentTerms}</p>
                  </div>
                )}
                {keyTerms.notes && (
                  <div className="text-sm">
                    <span className="font-semibold text-gray-600">Notes:</span>
                    <p className="text-gray-700 mt-1">{keyTerms.notes}</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-green-700 bg-green-100 p-2 rounded">
                Once finalized, this will create a formal task in your "Your Accepted Tasks" list.
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowFinalizationDialog(false)}
                disabled={isFinalizingTodo}
              >
                Continue Negotiating
              </Button>
              <Button
                onClick={handleFinalizeNegotiation}
                disabled={isFinalizingTodo}
                className="bg-green-600 hover:bg-green-700 text-white ml-auto gap-2"
              >
                {isFinalizingTodo ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Finalizing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Confirm & Finalize
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NegotiationChat;
