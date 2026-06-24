"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginForm() {
  const [noReg, setNoReg] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Phase 2: call auth API here
    console.log("Login attempt:", { noReg, password });
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
        Welcome Back
      </h1>
      <p className="mt-2 text-sm text-muted">
        Masuk ke akun Nenggala Academy Anda.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="noReg"
            className="block text-xs font-bold uppercase tracking-widest text-ink"
          >
            No. Reg
          </label>
          <input
            id="noReg"
            type="text"
            value={noReg}
            onChange={(e) => setNoReg(e.target.value)}
            required
            autoComplete="username"
            placeholder="Masukkan no. registrasi"
            className="mt-2 block w-full rounded-sm border border-ink/20 bg-paper px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-widest text-ink"
            >
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Masukkan password"
            className="mt-2 block w-full rounded-sm border border-ink/20 bg-paper px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-sm bg-brand px-4 py-3 text-sm font-bold uppercase tracking-widest text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          Login
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-muted">
        Butuh bantuan? Hubungi admin di{" "}
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand transition-colors hover:text-brand-hover"
        >
          WhatsApp
        </a>
      </p>
    </div>
  );
}
