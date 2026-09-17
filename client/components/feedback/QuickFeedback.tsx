import React, { useState } from "react";
import { MessageSquare, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "../ui/button";
import FeedbackSystem from "./FeedbackSystem";

interface QuickFeedbackProps {
  section: string;
  position?: "bottom-right" | "bottom-left" | "inline";
  variant?: "button" | "floating" | "minimal";
}

const QuickFeedback: React.FC<QuickFeedbackProps> = ({
  section,
  position = "bottom-right",
  variant = "floating",
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleQuickRating = (rating: number) => {
    // Handle quick rating submission
    setShowQuickActions(false);
    // You could show a brief thank you message here
  };

  if (variant === "minimal") {
    return (
      <>
        <button
          onClick={() => setShowFeedback(true)}
          className="text-sm text-gray-500 hover:text-sheraton-navy transition-colors underline"
        >
          Give feedback
        </button>
        <FeedbackSystem
          section={section}
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
        />
      </>
    );
  }

  if (variant === "button") {
    return (
      <>
        <Button
          onClick={() => setShowFeedback(true)}
          variant="outline"
          size="sm"
          className="border-sheraton-gold text-sheraton-navy hover:bg-sheraton-gold/10"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Feedback
        </Button>
        <FeedbackSystem
          section={section}
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
        />
      </>
    );
  }

  // Floating variant
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    inline: "relative",
  };

  return (
    <>
      <div
        className={`${
          position === "inline" ? "" : "fixed"
        } ${positionClasses[position]} z-40`}
      >
        {showQuickActions ? (
          <div className="bg-white rounded-lg shadow-lg border p-4 mb-2 min-w-[200px]">
            <p className="text-sm font-medium text-sheraton-navy mb-3">
              How was this section?
            </p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleQuickRating(1)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Poor"
              >
                <ThumbsDown className="h-5 w-5 text-red-500" />
              </button>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleQuickRating(rating)}
                    className="p-1 hover:bg-yellow-50 rounded transition-colors"
                    title={`${rating} stars`}
                  >
                    <Star className="h-4 w-4 text-yellow-500 hover:fill-current" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleQuickRating(5)}
                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                title="Excellent"
              >
                <ThumbsUp className="h-5 w-5 text-green-500" />
              </button>
            </div>
            <div className="flex space-x-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowQuickActions(false)}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowQuickActions(false);
                  setShowFeedback(true);
                }}
                className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy text-xs"
              >
                Detailed
              </Button>
            </div>
          </div>
        ) : null}

        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy rounded-full p-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          title="Give feedback"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      </div>

      <FeedbackSystem
        section={section}
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </>
  );
};

export default QuickFeedback;
