import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Studio sign in — EpicAura Studio" },
      { name: "description", content: "Private sign in for the EpicAura Studio content editor." },
      { property: "og:title", content: "Studio sign in — EpicAura Studio" },
      { property: "og:description", content: "Private sign in for the EpicAura Studio content editor." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ t: "err" | "ok"; m: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    setLoading(true);
    setMsg(null);
    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      setLoading(false);
      setMsg(error ? { t: "err", m: error.message } : { t: "ok", m: "If that account exists, a reset link is on its way." });
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: String(fd.get("password")) });
    setLoading(false);
    if (error) return void setMsg({ t: "err", m: "Those details didn't match an account." });
    navigate({ to: "/admin" });
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-ink p-12 text-ink-foreground md:flex md:flex-col md:justify-between">
        <span className="font-display text-2xl font-semibold">EpicAura<span className="text-signal">.</span></span>
        <p className="display-lg">Studio editor.</p>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <h1 className="text-3xl font-semibold">{mode === "signin" ? "Sign in" : "Reset password"}</h1>
          <p className="text-sm text-muted-foreground">Access is limited to studio administrators.</p>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          {mode === "signin" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
          )}
          {msg && <p role="alert" className={msg.t === "err" ? "text-sm text-destructive" : "text-sm"}>{msg.m}</p>}
          <Button type="submit" variant="ink" className="w-full h-11" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} {mode === "signin" ? "Sign in" : "Send reset link"}
          </Button>
          <button type="button" className="text-sm text-muted-foreground underline" onClick={() => { setMode(mode === "signin" ? "reset" : "signin"); setMsg(null); }}>
            {mode === "signin" ? "Forgot password?" : "Back to sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
