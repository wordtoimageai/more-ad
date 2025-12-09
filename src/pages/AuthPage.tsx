import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Eye, EyeOff, Lock } from "lucide-react";
import { z } from "zod";
import PasswordStrengthIndicator, { isPasswordStrong } from "@/components/PasswordStrengthIndicator";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

type AuthMode = "login" | "signup" | "forgot";

interface LockoutState {
  isLocked: boolean;
  lockedUntil: Date | null;
  attemptsRemaining: number;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [lockout, setLockout] = useState<LockoutState>({ isLocked: false, lockedUntil: null, attemptsRemaining: 5 });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/app");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/app");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockout.isLocked || !lockout.lockedUntil) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      if (lockout.lockedUntil && now >= lockout.lockedUntil) {
        setLockout({ isLocked: false, lockedUntil: null, attemptsRemaining: 5 });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lockout.isLocked, lockout.lockedUntil]);

  const checkAccountLocked = async (emailToCheck: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_account_locked', { p_email: emailToCheck });
      if (error) {
        console.error('Error checking account lock:', error);
        return false; // Fail open to avoid blocking legitimate users
      }
      if (data && data.length > 0) {
        const result = data[0];
        if (result.is_locked) {
          setLockout({
            isLocked: true,
            lockedUntil: new Date(result.locked_until),
            attemptsRemaining: 0
          });
          return true;
        }
        setLockout(prev => ({ ...prev, attemptsRemaining: result.attempts_remaining }));
      }
      return false;
    } catch {
      return false;
    }
  };

  const recordFailedAttempt = async (emailToRecord: string) => {
    try {
      const { data, error } = await supabase.rpc('record_failed_login', { p_email: emailToRecord });
      if (error) {
        console.error('Error recording failed attempt:', error);
        return;
      }
      if (data && data.length > 0) {
        const result = data[0];
        if (result.is_now_locked) {
          setLockout({
            isLocked: true,
            lockedUntil: new Date(result.locked_until),
            attemptsRemaining: 0
          });
        } else {
          setLockout(prev => ({ ...prev, attemptsRemaining: result.attempts_remaining }));
        }
      }
    } catch {
      // Silently fail - don't block login flow
    }
  };

  const resetAttempts = async (emailToReset: string) => {
    try {
      await supabase.rpc('reset_login_attempts', { p_email: emailToReset });
    } catch {
      // Silently fail
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    // Only validate password for login and signup modes
    if (mode !== "forgot") {
      try {
        passwordSchema.parse(password);
        // For signup, also check password strength
        if (mode === "signup" && !isPasswordStrong(password)) {
          newErrors.password = "Please choose a stronger password";
        }
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.password = e.errors[0].message;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatTimeRemaining = (): string => {
    if (!lockout.lockedUntil) return "";
    const now = new Date();
    const diff = lockout.lockedUntil.getTime() - now.getTime();
    if (diff <= 0) return "";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (mode === "forgot") {
        const redirectUrl = `${window.location.origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Check your email for a password reset link!");
        setMode("login");
      } else if (mode === "login") {
        // Check if account is locked before attempting login
        const isLocked = await checkAccountLocked(email);
        if (isLocked) {
          toast.error("Account temporarily locked. Please try again later.");
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          // Record failed attempt
          await recordFailedAttempt(email);
          
          if (error.message.includes("Invalid login credentials")) {
            const remaining = lockout.attemptsRemaining - 1;
            if (remaining > 0) {
              toast.error(`Invalid email or password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
            } else {
              toast.error("Account locked due to too many failed attempts. Try again in 15 minutes.");
            }
          } else {
            toast.error(error.message);
          }
          return;
        }
        
        // Reset attempts on successful login
        await resetAttempts(email);
        toast.success("Welcome back!");
      } else {
        const redirectUrl = `${window.location.origin}/app`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Try logging in instead.");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Account created! Welcome to More.ad");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "login": return "Welcome back";
      case "signup": return "Create your account";
      case "forgot": return "Reset your password";
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      switch (mode) {
        case "login": return "Signing in...";
        case "signup": return "Creating account...";
        case "forgot": return "Sending link...";
      }
    }
    switch (mode) {
      case "login": return "Sign In";
      case "signup": return "Create Account";
      case "forgot": return "Send Reset Link";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <Logo size="lg" />
            <p className="text-muted-foreground mt-2">{getTitle()}</p>
          </div>

          <div className="glass-effect rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className="bg-background/50"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      className="bg-background/50 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === "signup" && <PasswordStrengthIndicator password={password} />}
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
              )}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setErrors({});
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              )}

              {lockout.isLocked && mode === "login" && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Account locked. Try again in {formatTimeRemaining()}
                  </span>
                </div>
              )}

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={isLoading || (lockout.isLocked && mode === "login")}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {getButtonText()}
                  </>
                ) : (
                  getButtonText()
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              {mode === "forgot" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrors({});
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  Back to login
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setErrors({});
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {mode === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
