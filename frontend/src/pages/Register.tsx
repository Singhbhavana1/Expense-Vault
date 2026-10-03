import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Smartphone,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  registerUser,
  resendPhoneOTP,
  verifyPhoneOTP,
  type RegisterData,
} from "@/services/auth";

type Step = 1 | 2 | 3;

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);

  const [form, setForm] = useState<RegisterData>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    password_confirm: "",
  });

  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  const [resendTimer, setResendTimer] = useState(0);

  const updateField = (
    field: keyof RegisterData,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendTimer((previous) => previous - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendTimer]);

  const handleNext = () => {
    setError("");

    if (!form.first_name.trim()) {
      setError("Please enter your first name.");
      return;
    }

    if (!form.last_name.trim()) {
      setError("Please enter your last name.");
      return;
    }

    if (!form.username.trim()) {
      setError("Please choose a username.");
      return;
    }

    setStep(2);
  };

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your mobile number.");
      return;
    }

    const normalizedPhone = form.phone.replace(/\D/g, "");

    if (normalizedPhone.length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        ...form,
        phone: normalizedPhone,
      });

      setForm((previous) => ({
        ...previous,
        phone: normalizedPhone,
      }));

      setOtp("");
      setResendTimer(30);
      setStep(3);
    } catch (err: any) {
      console.error(err);

      const data = err?.response?.data;

      if (data?.email?.[0]) {
        setError(data.email[0]);
      } else if (data?.phone?.[0]) {
        setError(data.phone[0]);
      } else if (data?.username?.[0]) {
        setError(data.username[0]);
      } else if (data?.password_confirm?.[0]) {
        setError(data.password_confirm[0]);
      } else if (data?.detail) {
        setError(data.detail);
      } else {
        setError(
          "Unable to create your account. Please check your details.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

 const handleVerifyOTP = async (
  event: React.FormEvent<HTMLFormElement>,
) => {
  event.preventDefault();

  setError("");

  if (!otp.trim()) {
    setError("Please enter the OTP.");
    return;
  }

  if (!/^\d{6}$/.test(otp)) {
    setError("OTP must contain 6 digits.");
    return;
  }

  try {
    setLoading(true);

    const response = await verifyPhoneOTP(
      form.phone,
      otp,
    );
    console.log("OTP VERIFY RESPONSE:", response);
    localStorage.setItem(
      "access_token",
      response.access!,
    );

    localStorage.setItem(
      "refresh_token",
      response.refresh!,
    );

    navigate("/dashboard", {
      replace: true,
    });
  } catch (err: any) {
    console.error(err);

    const data = err?.response?.data;

    if (data?.detail) {
      setError(data.detail);
    } else if (data?.otp?.[0]) {
      setError(data.otp[0]);
    } else {
      setError("Invalid or expired OTP. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  const handleResendOTP = async () => {
    if (resendTimer > 0 || resending) {
      return;
    }

    try {
      setResending(true);
      setError("");

      await resendPhoneOTP(form.phone);

      setOtp("");
      setResendTimer(30);
    } catch (err: any) {
      console.error(err);

      const data = err?.response?.data;

      if (data?.detail) {
        setError(data.detail);
      } else {
        setError("Unable to resend OTP. Please try again.");
      }
    } finally {
      setResending(false);
    }
  };

  const maskedPhone = form.phone
    ? `${form.phone.slice(0, 2)}******${form.phone.slice(-2)}`
    : "your mobile number";

  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
          <div className="w-full max-w-lg">
            {/* Brand */}
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101828] text-white dark:bg-white dark:text-[#101828]">
                <span className="text-lg font-bold">E</span>
              </div>

              <span className="text-lg font-semibold tracking-tight">
                ExpenseVault
              </span>
            </div>

            {/* Progress */}
            <div className="mb-10 flex items-center gap-3">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  step >= 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > 1 ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  "1"
                )}
              </div>

              <div
                className={`h-px w-10 ${
                  step >= 2 ? "bg-primary" : "bg-border"
                }`}
              />

              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  step >= 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > 2 ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  "2"
                )}
              </div>

              <div
                className={`h-px w-10 ${
                  step >= 3 ? "bg-primary" : "bg-border"
                }`}
              />

              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  step >= 3
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step >= 3 ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  "3"
                )}
              </div>

              <span className="ml-1 text-xs text-muted-foreground">
                {step === 1
                  ? "Personal details"
                  : step === 2
                    ? "Account security"
                    : "Mobile verification"}
              </span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="text-sm font-medium text-primary">
                {step === 3
                  ? "Verify your mobile"
                  : "Create your account"}
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {step === 3
                  ? "Secure your account."
                  : "Start understanding your money."}
              </h1>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {step === 3
                  ? `Enter the 6-digit OTP sent to ${maskedPhone}.`
                  : "A few details and you'll have your own private financial workspace."}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
                {error}
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">
                      First name
                    </Label>

                    <Input
                      id="first_name"
                      placeholder="Bhavana"
                      value={form.first_name}
                      onChange={(event) =>
                        updateField(
                          "first_name",
                          event.target.value,
                        )
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">
                      Last name
                    </Label>

                    <Input
                      id="last_name"
                      placeholder="Singh"
                      value={form.last_name}
                      onChange={(event) =>
                        updateField(
                          "last_name",
                          event.target.value,
                        )
                      }
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>

                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="username"
                      placeholder="bhavana"
                      value={form.username}
                      onChange={(event) =>
                        updateField(
                          "username",
                          event.target.value,
                        )
                      }
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  className="h-11 w-full"
                  onClick={handleNext}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <form
                onSubmit={handleRegister}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(event) =>
                        updateField(
                          "email",
                          event.target.value,
                        )
                      }
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Mobile number
                  </Label>

                  <div className="relative">
                    <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={(event) =>
                        updateField(
                          "phone",
                          event.target.value.replace(
                            /\D/g,
                            "",
                          ),
                        )
                      }
                      maxLength={10}
                      className="h-11 pl-10"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    We'll send a verification OTP to this
                    number.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={(event) =>
                        updateField(
                          "password",
                          event.target.value,
                        )
                      }
                      className="h-11 px-10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirm">
                    Confirm password
                  </Label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="password_confirm"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter password again"
                      value={form.password_confirm}
                      onChange={(event) =>
                        updateField(
                          "password_confirm",
                          event.target.value,
                        )
                      }
                      className="h-11 px-10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-1"
                    onClick={() => {
                      setError("");
                      setStep(1);
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 flex-[2]"
                  >
                    {loading
                      ? "Creating..."
                      : "Create account"}
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <form
                onSubmit={handleVerifyOTP}
                className="space-y-5"
              >
                <div className="flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Smartphone className="h-6 w-6" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">
                    Verification code
                  </Label>

                  <Input
                    id="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6),
                      )
                    }
                    maxLength={6}
                    className="h-12 text-center text-xl tracking-[0.5em]"
                  />

                  <p className="text-center text-xs text-muted-foreground">
                    Enter the 6-digit code sent to your mobile
                    number.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="h-11 w-full"
                >
                  {loading
                    ? "Verifying..."
                    : "Verify mobile"}
                  <Check className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    disabled={resendTimer > 0 || resending}
                    onClick={handleResendOTP}
                    className="text-sm font-medium text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
                  >
                    {resending
                      ? "Sending..."
                      : resendTimer > 0
                        ? `Resend OTP in ${resendTimer}s`
                        : "Resend OTP"}
                  </button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 w-full"
                  onClick={() => {
                    setError("");
                    setOtp("");
                    setStep(2);
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change details
                </Button>
              </form>
            )}

            {/* Success */}
            {step === 3 && false && null}

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>

        {/* Right panel */}
        <section className="relative hidden overflow-hidden bg-[#101828] p-12 text-white lg:flex lg:flex-col lg:justify-center xl:p-20">
          <div className="absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/3 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative max-w-md">
            <p className="text-sm font-medium text-blue-300">
              YOUR PRIVATE FINANCIAL SPACE
            </p>

            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.03em]">
              One place for your financial life.
            </h2>

            <p className="mt-6 leading-7 text-slate-400">
              Start with your personal finances. Add income,
              track expenses and gradually build a clearer
              picture of where your money is going.
            </p>

            <div className="mt-10 border-t border-white/10 pt-6">
              <p className="text-sm font-medium">
                Built around clarity
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                No financial jargon. No unnecessary complexity.
                Just the information you need.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}