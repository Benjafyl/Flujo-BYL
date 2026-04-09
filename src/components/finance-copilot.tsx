"use client";

import { BrainCircuit, LoaderCircle, Send, Sparkles } from "lucide-react";
import { startTransition, useState } from "react";

import { askFinancePrompts } from "@/lib/dashboard-data";
import type { FinanceAnswer } from "@/lib/finance-types";

export function FinanceCopilot() {
  const [question, setQuestion] = useState(askFinancePrompts[0]);
  const [answer, setAnswer] = useState<FinanceAnswer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runQuestion(nextQuestion: string) {
    if (!nextQuestion.trim()) {
      setError("Escribe una pregunta para leer tus numeros.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/finance-qa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: nextQuestion }),
      });

      if (!response.ok) {
        throw new Error("No pude responder esa pregunta.");
      }

      const result = (await response.json()) as FinanceAnswer;
      setAnswer(result);
    } catch (caughtError) {
      setAnswer(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Hubo un problema leyendo tus finanzas.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="glass-panel rounded-[32px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Analista
          </p>
          <h2 className="section-title mt-2 text-3xl font-semibold">
            Consulta rapida
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Pregunta por categorias, limites o ingresos.
          </p>
        </div>

        <span className="rounded-full bg-[color:var(--violet-soft)] p-3 text-violet-700">
          <BrainCircuit className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-6 rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-4 sm:p-5">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Haz una pregunta
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="min-w-0 flex-1 rounded-full border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
            placeholder="Ejemplo: en que categoria gaste mas?"
          />
          <button
            type="button"
            onClick={() => {
              startTransition(() => {
                void runQuestion(question);
              });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--accent-strong)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent)]"
          >
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Preguntar
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {askFinancePrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setQuestion(prompt);
                startTransition(() => {
                  void runQuestion(prompt);
                });
              }}
              className="rounded-full border border-[color:var(--line)] bg-white px-3 py-2 text-xs font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink)]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mt-4 rounded-[20px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </div>

      <div className="mt-5 rounded-[28px] border border-[color:var(--line)] bg-white/80 p-5">
        {answer ? (
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[color:var(--accent-strong)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Respuesta
              </p>
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[color:var(--ink)]">
              {answer.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              {answer.summary}
            </p>

            <div className="mt-5 space-y-3">
              {answer.bullets.map((bullet) => (
                <div
                  key={bullet}
                  className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[color:var(--muted)]"
                >
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm leading-6 text-[color:var(--muted)]">
            Escribe una pregunta y veras una lectura directa del mes.
          </div>
        )}
      </div>
    </section>
  );
}
