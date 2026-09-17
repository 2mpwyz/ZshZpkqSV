import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader, Send, AlertCircle } from "lucide-react";
import { supabase, TaskMessage } from "../lib/supabase";
import { toast } from "../hooks/use-toast";

interface TaskChatProps {
  taskId: string;
  currentUserId: string;
  currentUserRole: "manager" | "service_provider";
  taskStatus: string; // Determines if chat is available
  otherPartyName: string;
}

export const TaskChat: React.FC<TaskChatProps> = ({
  taskId,
  currentUserId,
  currentUserRole,
  taskStatus,
  otherPartyName,
}) => {
  const [messages, setMessages] = useState<TaskMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatDisabled = taskStatus !== "todo"; // Chat only available during negotiation

  useEffect(() => {
    loadMessages();
    subscribeToMessages();

    return () => {
      supabase.channel(`task-chat:${taskId}`).unsubscribe();
    };
  }, [taskId]);

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
        description: "Failed to load chat messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    supabase
      .channel(`task-chat:${taskId}`)
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

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("task_messages")
        .insert([
          {
            task_id: taskId,
            sender_id: currentUserId,
            sender_role: currentUserRole,
            message_text: messageText,
          },
        ]);

      if (error) throw error;

      setMessageText("");
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="border-b bg-gradient-to-r from-sheraton-cream to-white">
        <CardTitle className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-sheraton-gold uppercase tracking-wide mb-1">
              Live Negotiation Chat
            </p>
            <p className="text-base text-sheraton-navy">
              With {otherPartyName}
            </p>
          </div>
          {chatDisabled && (
            <div className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Chat Closed
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-6 gap-4">
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
                  No messages yet. Start the conversation!
                </p>
                <p className="text-xs text-gray-400">
                  Use this space to negotiate task details before accepting.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentUserId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender_id === currentUserId
                      ? "bg-sheraton-gold text-white rounded-br-none"
                      : "bg-white border border-gray-300 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1 opacity-75">
                    {message.sender_role === "manager" ? "Manager" : "Provider"}
                  </p>
                  <p className="text-sm break-words">{message.message_text}</p>
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

        {/* Message Input */}
        {chatDisabled ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-sm text-red-800">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Chat is closed after task is concluded. Thanks for using live chat!
            </p>
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <Input
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isSubmitting || !messageText.trim()}
              className="sheraton-gradient text-white gap-2"
              size="icon"
            >
              {isSubmitting ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskChat;
