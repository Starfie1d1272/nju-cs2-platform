"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { sendMagicLink } from "@/actions/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await sendMagicLink(email);
      if (result.success) {
        setSent(true);
      } else {
        toast.error(result.error.message);
      }
    });
  }

  if (sent) {
    return (
      <Card className="p-6 text-center space-y-3">
        <p className="text-2xl">📬</p>
        <p className="font-semibold text-[var(--text-primary)]">登录链接已发送</p>
        <p className="text-sm text-[var(--text-secondary)]">
          请查收 <span className="font-medium text-[var(--text-primary)]">{email}</span> 的邮件，
          点击链接即可登录。
        </p>
        <button
          onClick={() => { setSent(false); setEmail(""); }}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
        >
          重新发送
        </button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">邮箱地址</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "发送中…" : "发送登录链接"}
      </Button>
      <p className="text-xs text-center text-[var(--text-secondary)]">
        首次参赛？请前往赛季报名页完成报名
      </p>
    </form>
  );
}
