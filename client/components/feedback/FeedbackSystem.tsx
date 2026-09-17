import React, { useState } from "react";
import {
  Star,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  X,
  Heart,
} from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

interface FeedbackProps {
  section: string;
  onClose?: () => void;
  isOpen?: boolean;
}

const FeedbackSystem: React.FC<FeedbackProps> = ({
  section,
  onClose,
  isOpen = false,
}) => {
  const [step, setStep] = useState<"rating" | "feedback" | "complete">(
    "rating",
  );
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState<
    "positive" | "negative" | "suggestion" | null
  >(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleRatingSubmit = () => {
    if (rating > 0) {
      if (rating >= 4) {
        setFeedbackType("positive");
      } else if (rating <= 2) {
        setFeedbackType("negative");
      } else {
        setFeedbackType("suggestion");
      }
      setStep("feedback");
    }
  };

  const handleFeedbackSubmit = () => {
    // Here you would submit the feedback to your backend
    setStep("complete");
  };

  const resetForm = () => {
    setStep("rating");
    setRating(0);
    setHoveredRating(0);
    setFeedbackType(null);
    setFeedbackText("");
    setName("");
    setEmail("");
    setIsAnonymous(false);
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Very Poor";
      case 2:
        return "Poor";
      case 3:
        return "Fair";
      case 4:
        return "Good";
      case 5:
        return "Excellent";
      default:
        return "";
    }
  };

  const getFeedbackPrompt = () => {
    switch (feedbackType) {
      case "positive":
        return "We're delighted you had a great experience! What made it special?";
      case "negative":
        return "We're sorry to hear about your experience. How can we improve?";
      case "suggestion":
        return "Thank you for your feedback. What suggestions do you have for us?";
      default:
        return "Please share your thoughts with us:";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold text-sheraton-navy">
              Share Your Feedback
            </h3>
            <p className="text-sm text-gray-600">{section}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "rating" && (
            <div className="text-center">
              <div className="mb-6">
                <h4 className="text-lg font-medium text-sheraton-navy mb-2">
                  How was your experience?
                </h4>
                <p className="text-sm text-gray-600">
                  Your feedback helps us improve our service
                </p>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Rating Text */}
              {(rating > 0 || hoveredRating > 0) && (
                <p className="text-lg font-medium text-sheraton-navy mb-6">
                  {getRatingText(hoveredRating || rating)}
                </p>
              )}

              <Button
                onClick={handleRatingSubmit}
                disabled={rating === 0}
                className="w-full bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
              >
                Continue
              </Button>
            </div>
          )}

          {step === "feedback" && (
            <div>
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= rating
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {getRatingText(rating)}
                  </span>
                </div>
                <h4 className="font-medium text-sheraton-navy mb-2">
                  {getFeedbackPrompt()}
                </h4>
              </div>

              {/* Feedback Text */}
              <div className="mb-4">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Contact Information */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-600">
                    Submit anonymously
                  </label>
                </div>

                {!isAnonymous && (
                  <div className="space-y-3">
                    <Input
                      placeholder="Your name (optional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="Your email (optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("rating")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleFeedbackSubmit}
                  className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-sheraton-navy mb-2">
                Thank You!
              </h4>
              <p className="text-gray-600 mb-6">
                Your feedback has been submitted successfully. We appreciate you
                taking the time to help us improve.
              </p>

              {rating >= 4 && (
                <div className="bg-sheraton-cream rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Heart className="h-5 w-5 text-red-500 fill-current" />
                    <span className="font-medium text-sheraton-navy">
                      Love Sheraton Special?
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Share your experience with others!
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-sheraton-gold text-sheraton-navy hover:bg-sheraton-gold/10"
                  >
                    Write a Review
                  </Button>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Submit Another
                </Button>
                {onClose && (
                  <Button
                    onClick={onClose}
                    className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackSystem;
