"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, MailWarning } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getFriendlyAuthErrorMessage,
  readAuthErrorFromLocation,
} from "@/lib/auth-errors";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type CallbackState =
  | {
      tone: "loading" | "error";
      message: string;
    }
  | {
      tone: "success";
      message: string;
    };

export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>({
    tone: "loading",
    message: "Estamos cerrando tu acceso...",
  });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setState({
          tone: "success",
          message: "Acceso listo. Abriendo tu panel...",
        });
        router.replace("/");
      }
    });

    async function finishLogin() {
      const authError = readAuthErrorFromLocation(
        window.location.search,
        window.location.hash,
      );

      if (authError) {
        setState({
          tone: "error",
          message: getFriendlyAuthErrorMessage(
            authError.code,
            authError.description,
          ),
        });
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setState({
          tone: "error",
          message: getFriendlyAuthErrorMessage(error.name, error.message),
        });
        return;
      }

      if (data.session) {
        router.replace("/");
        return;
      }

      window.setTimeout(async () => {
        const { data: delayedData, error: delayedError } =
          await supabase.auth.getSession();

        if (delayedError) {
          setState({
            tone: "error",
            message: getFriendlyAuthErrorMessage(
              delayedError.name,
              delayedError.message,
            ),
          });
          return;
        }

        if (delayedData.session) {
          router.replace("/");
          return;
        }

        setState({
          tone: "error",
          message:
            "No pude completar el acceso con ese link. Pide uno nuevo desde la pantalla principal.",
        });
      }, 1200);
    }

    void finishLogin();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const toneClasses =
    state.tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  const title =
    state.tone === "loading"
      ? "Entrando a FLUJO BYL"
      : state.tone === "success"
        ? "Acceso listo"
        : "No pude cerrar el acceso";

  const subtitle =
    state.tone === "loading"
      ? "Espera unos segundos mientras Supabase termina de abrir tu sesion."
      : state.tone === "success"
        ? "Tu sesion ya se esta abriendo y te llevaremos al panel principal."
        : "El enlace magico no termino bien y te traje de vuelta a una pantalla segura.";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
      <section className="glass-panel w-full max-w-xl rounded-[34px] p-6 sm:p-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--surface-strong)] text-[color:var(--accent-strong)]">
          {state.tone === "loading" ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <MailWarning className="h-5 w-5" />
          )}
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[color:var(--ink)]">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          {subtitle}
        </p>

        <div className={`mt-6 rounded-[24px] border px-4 py-4 text-sm ${toneClasses}`}>
          {state.message}
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[color:var(--line)] px-5 py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)]"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
