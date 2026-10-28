import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — EpicAura Studio" },
      { name: "description", content: "Choose a new password for the studio editor." },
      { property: "og:title", content: "Set a new password — EpicAura Studio" },
      { property: "og:description", content: "Choose a new password for the studio editor." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    if (password.length < 8) return void setErr("Use at least 8 characters.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return void setErr(error.message);
    navigate({ to: "/admin" });
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
        <h1 className="text-3xl font-semibold">Set a new password</h1>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" required autoComplete="new-password" />
        </div>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <Button type="submit" variant="ink" className="w-full h-11">Save password</Button>
      </form>
    </div>
  );
}
