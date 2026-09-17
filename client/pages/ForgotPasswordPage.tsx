import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Crown, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "sent">("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateEmail = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Add API call to send password reset email
      // For now, just show the sent screen after a brief delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStep("sent");
    } catch (error) {
      setErrors({
        submit: "Failed to send reset email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-sheraton-gold" />
          </div>
          <h1 className="text-3xl font-bold text-sheraton-navy mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            {step === "email"
              ? "Enter your email to receive password reset instructions"
              : "Check your email for further instructions"}
          </p>
        </div>

        {step === "email" ? (
          <>
            {/* Error Messages */}
            {errors.submit && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sheraton-gold hover:bg-sheraton-gold/90 text-white font-semibold py-3 rounded-md transition"
              >
                {isLoading ? "Sending..." : "Send Reset Email"}
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6">
              <Link
                to="/login"
                className="flex items-center justify-center text-sheraton-navy hover:text-sheraton-gold transition"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Success Message */}
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>

              <div className="space-y-2">
                <p className="text-gray-700">
                  We've sent password reset instructions to:
                </p>
                <p className="font-semibold text-sheraton-navy">{email}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-900">
                  Please check your email (including spam folder) for a link to
                  reset your password. The link will expire in 24 hours.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full bg-sheraton-gold hover:bg-sheraton-gold/90 text-white font-semibold py-3 rounded-md transition"
                >
                  Back to Login
                </Button>

                <button
                  onClick={() => {
                    setStep("email");
                    setEmail("");
                  }}
                  className="w-full text-sheraton-navy hover:text-sheraton-gold font-medium transition"
                >
                  Try a different email
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
