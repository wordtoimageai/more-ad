import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  BarChart3, Calendar, Hash, Image, Loader2, LogOut, PenTool,
  Settings, Sparkles, TrendingUp, User, ArrowLeft, Trash2, Shield,
} from "lucide-react";

interface AdStats {
  totalAds: number;
  thisMonth: number;
  thisWeek: number;
  topStyle: string;
  topLanguage: string;
  avgHashtags: number;
  totalImages: number;
  recentDates: string[];
}

export default function DashboardPage() {
  useDocumentMeta({
    title: "Dashboard | More.ad",
    description: "Manage your profile, view ad history stats, and account settings.",
    ogUrl: "https://more.ad/dashboard",
  });

  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<AdStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      loadProfile();
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user?.id ?? "")
        .single();
      if (data?.display_name) setDisplayName(data.display_name);
    } catch {}
  };

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() } as any)
        .eq("user_id", user?.id ?? "");
      if (error) throw error;
      toast.success("Display name updated");
    } catch {
      toast.error("Failed to update display name");
    } finally {
      setSavingName(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ad_history")
        .select("created_at, style, language, hashtags, images")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const thisMonth = data.filter((a) => new Date(a.created_at) >= startOfMonth).length;
      const thisWeek = data.filter((a) => new Date(a.created_at) >= startOfWeek).length;

      const styleCounts: Record<string, number> = {};
      const langCounts: Record<string, number> = {};
      let totalHashtags = 0;
      let totalImages = 0;

      data.forEach((a) => {
        styleCounts[a.style] = (styleCounts[a.style] || 0) + 1;
        if (a.language) langCounts[a.language] = (langCounts[a.language] || 0) + 1;
        totalHashtags += (a.hashtags || []).length;
        totalImages += (a.images || []).length;
      });

      const topStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
      const topLanguage = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

      const recentDates = data.slice(0, 7).map((a) =>
        new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );

      setStats({
        totalAds: data.length,
        thisMonth,
        thisWeek,
        topStyle,
        topLanguage,
        avgHashtags: data.length ? Math.round(totalHashtags / data.length) : 0,
        totalImages,
        recentDates,
      });
    } catch {
      toast.error("Failed to load stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.error("Please contact support@more.ad to delete your account.");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: "Total Ads", value: stats.totalAds, icon: Sparkles, color: "text-primary" },
        { label: "This Month", value: stats.thisMonth, icon: Calendar, color: "text-secondary" },
        { label: "This Week", value: stats.thisWeek, icon: TrendingUp, color: "text-green-400" },
        { label: "Images Generated", value: stats.totalImages, icon: Image, color: "text-pink-400" },
      ]
    : [];

  const isOAuthUser = user?.app_metadata?.provider && user.app_metadata.provider !== "email";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/app")}>
              <PenTool className="w-4 h-4 mr-1" />
              Create Ad
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Title */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app")} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-extrabold">Dashboard</h1>
          </div>
          <p className="text-muted-foreground ml-12">
            Your profile, stats, and account settings
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-card border-border/50">
                  <CardContent className="p-5">
                    <div className="h-16 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            : statCards.map((s, i) => (
                <Card key={i} className="bg-card border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {s.label}
                      </span>
                    </div>
                    <p className="text-3xl font-bold">{s.value}</p>
                  </CardContent>
                </Card>
              ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-primary" />
                  Profile
                </CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email</Label>
                  <p className="font-medium mt-1">{user?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Sign-in Method</Label>
                  <p className="font-medium mt-1 capitalize flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    {isOAuthUser ? user?.app_metadata?.provider : "Email & Password"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Member Since</Label>
                  <p className="font-medium mt-1">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ad Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                  Ad Insights
                </CardTitle>
                <CardDescription>Usage patterns and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : stats && stats.totalAds > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Favorite Style</span>
                      <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
                        {stats.topStyle}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Top Language</span>
                      <span className="text-sm font-medium px-3 py-1 rounded-full bg-secondary/10 text-secondary capitalize">
                        {stats.topLanguage}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Avg. Hashtags/Ad</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                        {stats.avgHashtags}
                      </span>
                    </div>
                    {stats.recentDates.length > 0 && (
                      <div>
                        <span className="text-muted-foreground text-sm block mb-2">Recent Activity</span>
                        <div className="flex flex-wrap gap-1.5">
                          {stats.recentDates.map((d, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    No ads yet. Create your first ad to see insights!
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Password */}
          {!isOAuthUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your login credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="new-pw">New Password</Label>
                    <Input
                      id="new-pw"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-pw">Confirm Password</Label>
                    <Input
                      id="confirm-pw"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPassword || !newPassword}
                    className="w-full"
                  >
                    {changingPassword && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="bg-card border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your account and all associated data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount}>
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button variant="outline" className="w-full" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
