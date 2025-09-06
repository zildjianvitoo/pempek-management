"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/src/components/ui/input";
import Button from "@/src/components/ui/button";

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: next,
      });
      if (res?.error) {
        setError("Email atau password salah");
      } else {
        router.push(res?.url || next);
      }
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full space-y-4" aria-describedby={error ? "login-error" : undefined}>
      <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
        Gunakan akun seed: <code className="font-mono">owner@example.com / admin123</code> atau <code className="font-mono">kasir@pusat.example.com / kasir123</code>
      </div>
      <div>
        <label className="block text-sm text-neutral-700 mb-1" htmlFor="email">Email</label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          placeholder="you@example.com"
          autoFocus
          required
        />
      </div>
      <div>
        <label className="block text-sm text-neutral-700 mb-1" htmlFor="password">Password</label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            aria-invalid={!!error}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-2 my-auto h-7 rounded px-2 text-xs text-neutral-700 hover:bg-neutral-100"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>
      </div>
      {error && (
        <div id="login-error" className="text-sm text-red-600" role="alert">{error}</div>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Masuk..." : "Masuk"}
      </Button>
    </form>
  );
}
