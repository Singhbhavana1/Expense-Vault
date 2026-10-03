import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  clearRecaptcha,
  sendFirebaseOTP,
  verifyFirebaseOTP,
} from "@/services/firebaseAuth";

import { resetPasswordWithFirebase } from "@/services/auth";

import type { ConfirmationResult } from "firebase/auth";

type Step = "phone" | "otp" | "password" | "success";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("phone");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
const [firebaseToken, setFirebaseToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const confirmationResultRef =
    useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  const handleSendOTP = async () => {
    setError("");
    setSuccess("");

    const normalizedPhone = phone.replace(/\D/g, "");

    if (!/^[0-9]{10}$/.test(normalizedPhone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);

      const result = await sendFirebaseOTP(normalizedPhone);

      confirmationResultRef.current = result;

      setPhone(normalizedPhone);
      setOtp("");
      setStep("otp");

      setSuccess("OTP sent successfully.");
    } catch (error: any) {
      console.error("Failed to send OTP:", error);

      setError(
        error?.message ||
          "Unable to send OTP. Please check your mobile number."
      );

      clearRecaptcha();
    } finally {
      setLoading(false);
    }
  };

const handleVerifyOTP = async () => {
  setError("");
  setSuccess("");

  if (!confirmationResultRef.current) {
    setError("OTP session expired. Please request a new OTP.");
    setStep("phone");
    return;
  }

  if (!/^[0-9]{6}$/.test(otp)) {
    setError("Enter the 6-digit OTP.");
    return;
  }

  try {
    setLoading(true);

    const token = await verifyFirebaseOTP(
      confirmationResultRef.current,
      otp
    );

    // Save Firebase ID token for password reset
    setFirebaseToken(token);

    setStep("password");
    setSuccess("Mobile number verified successfully.");
  } catch (error: any) {
    console.error("OTP verification failed:", error);

    setError(
      error?.message ||
        "Invalid OTP. Please check the OTP and try again."
    );
  } finally {
    setLoading(false);
  }
};

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");

    try {
      setResending(true);

      clearRecaptcha();

      const result = await sendFirebaseOTP(phone);

      confirmationResultRef.current = result;

      setOtp("");
      setSuccess("A new OTP has been sent.");
    } catch (error: any) {
      console.error("Failed to resend OTP:", error);

      setError(
        error?.message ||
          "Unable to resend OTP. Please try again."
      );

      clearRecaptcha();
    } finally {
      setResending(false);
    }
  };

const handleResetPassword = async () => {
  setError("");
  setSuccess("");

  if (!firebaseToken) {
    setError("Mobile verification expired. Please verify OTP again.");
    setStep("otp");
    return;
  }

  if (newPassword.length < 8) {
    setError("Password must be at least 8 characters long.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  try {
    setLoading(true);

    await resetPasswordWithFirebase(
      firebaseToken,
      newPassword
    );

    setStep("success");
    setSuccess("Password reset successfully.");
  } catch (error: any) {
    console.error("Password reset failed:", error);

    setError(
      error?.response?.data?.detail ||
        error?.message ||
        "Unable to reset password."
    );
  } finally {
    setLoading(false);
  }
};

  const goBack = () => {
    setError("");
    setSuccess("");

    if (step === "otp") {
      clearRecaptcha();
      confirmationResultRef.current = null;
      setOtp("");
      setStep("phone");
      return;
    }

    if (step === "password") {
      setOtp("");
      setStep("otp");
      return;
    }

    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-3 pb-4">
            <button
              type="button"
              onClick={goBack}
              className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                {step === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <KeyRound className="h-5 w-5 text-primary" />
                )}
              </div>

              <div>
                <h1 className="text-lg font-semibold">
                  {step === "phone" && "Forgot Password"}
                  {step === "otp" && "Verify Mobile"}
                  {step === "password" && "Create New Password"}
                  {step === "success" && "Password Updated"}
                </h1>

                <p className="text-xs text-muted-foreground">
                  {step === "phone" &&
                    "Verify your mobile number to reset your password."}

                  {step === "otp" &&
                    "Enter the OTP sent to your mobile number."}

                  {step === "password" &&
                    "Create a new password for your account."}

                  {step === "success" &&
                    "Your ExpenseVault password has been changed."}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {(error || success) && (
              <div
                className={`mb-4 px-3 py-2 text-xs ${
                  error
                    ? "border border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
                }`}
              >
                {error || success}
              </div>
            )}

            {/* STEP 1 */}
            {step === "phone" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    Mobile Number
                  </Label>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      className="pl-9"
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    We'll send a verification OTP to this number.
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleSendOTP}
                  disabled={loading}
                >
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  Send OTP
                </Button>
              </div>
            )}

            {/* STEP 2 */}
            {step === "otp" && (
              <div className="space-y-4">
                <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                  OTP sent to <strong>+91 {phone}</strong>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="otp">
                    Verification OTP
                  </Label>

                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    className="text-center text-lg tracking-[0.35em]"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleVerifyOTP}
                  disabled={loading}
                >
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  Verify OTP
                </Button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="w-full text-center text-xs text-primary hover:underline disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend OTP"}
                </button>

                <button
                  type="button"
                  onClick={goBack}
                  className="flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Change mobile number
                </button>
              </div>
            )}

            {/* STEP 3 */}
            {step === "password" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  Mobile number verified
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password">
                    New Password
                  </Label>

                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">
                    Confirm Password
                  </Label>

                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  Reset Password
                </Button>
              </div>
            )}

            {/* STEP 4 */}
            {step === "success" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Password reset successfully
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    You can now login with your new password.
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                >
                  Go to Login
                </Button>
              </div>
            )}

            <div id="recaptcha-container" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}