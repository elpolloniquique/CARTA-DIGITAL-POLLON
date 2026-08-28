"use client";

import type { FormEvent } from "react";

type AdminLoginProps = {
  email: string;
  password: string;
  loading: boolean;
  statusMessage: string;
  isConfigured: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AdminLogin({
  email,
  password,
  loading,
  statusMessage,
  isConfigured,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AdminLoginProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#141414] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#ef2b2d] text-2xl font-black">
            EP
          </div>
          <h1 className="text-3xl font-black">El Pollon Admin</h1>
          <p className="mt-2 text-sm text-white/65">Accede para administrar tu carta digital</p>
        </div>

        {!isConfigured ? (
          <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm leading-7 text-amber-100">
            {typeof window !== "undefined" && window.location.hostname.includes("vercel.app") ? (
              <>
                Faltan las variables de Supabase en <strong>Vercel</strong>. Ve a tu proyecto →{" "}
                <strong>Settings → Environment Variables</strong> y agrega{" "}
                <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
                Luego haz <strong>Redeploy</strong> del ultimo deployment.
              </>
            ) : (
              <>
                Configura <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en tu archivo <code>.env</code> local.
              </>
            )}
          </div>
        ) : null}

        <form
          onSubmit={onSubmit}
          className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-white backdrop-blur"
        >
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/75">Correo</span>
              <input
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                type="email"
                required
                disabled={!isConfigured}
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-[#ef2b2d]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/75">Contrasena</span>
              <input
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                type="password"
                required
                disabled={!isConfigured}
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-[#ef2b2d]"
              />
            </label>
            <button
              disabled={loading || !isConfigured}
              className="w-full rounded-xl bg-[#ef2b2d] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Entrar al panel"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-white/55">{statusMessage}</p>
      </div>
    </div>
  );
}
