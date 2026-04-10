"use client";

import { LoaderCircle, Mail, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AuthPanel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.refresh();
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  async function sendMagicLink() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Necesito tu correo para enviarte el acceso.");
      return;
    }

    setStatus("sending");
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (signInError) {
        throw signInError;
      }

      setStatus("sent");
    } catch (caughtError) {
      setStatus("idle");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No pude enviar el correo de acceso.",
      );
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid max-w-[1280px] gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="sidebar-shell noise-overlay rounded-[34px] p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-sky-300" />
            FLUJO BYL
          </div>

          <div className="mt-8 max-w-xl">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Tu dinero, limpio y sincronizado.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Entra con tu correo y la app te deja lista la base personal:
              Bice, CuentaRUT, Tenpo y tus focos reales de gasto.
            </p>
          </div>

          <div className="mt-8 grid gap-3">
            <SetupLine
              title="Cuentas base"
              detail="Banco Bice, tarjeta de credito Bice, CuentaRUT y deuda Tenpo."
            />
            <SetupLine
              title="Focos del mes"
              detail="Gasto comun, servicios basicos, internet y supermercado."
            />
            <SetupLine
              title="Ingreso principal"
              detail="Seguimiento del finiquito de Interchileclima sin meter datos ficticios."
            />
          </div>
        </section>

        <section className="glass-panel rounded-[34px] p-6 sm:p-8">
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Acceso personal
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--ink)]">
              Enviarte un link de entrada
            </h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              Usaremos un correo magico de Supabase para entrar desde celular y
              computador con la misma cuenta.
            </p>
          </div>

          <div className="mt-8 rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-5">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Tu correo
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <label className="relative block min-w-0 flex-1">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  className="min-h-[48px] w-full rounded-full border border-[color:var(--line)] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[color:var(--accent)]"
                  placeholder="tu@correo.com"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  void sendMagicLink();
                }}
                disabled={status === "sending"}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[color:var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "sending" ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Enviar link
              </button>
            </div>

            {status === "sent" ? (
              <div className="mt-4 rounded-[20px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Revisa tu correo y abre el link desde el dispositivo donde quieras
                entrar.
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-[20px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function SetupLine({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
    </div>
  );
}
