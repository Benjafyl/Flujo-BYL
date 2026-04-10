"use client";

import {
  AudioLines,
  CheckCircle2,
  LoaderCircle,
  Mic,
  Send,
  Square,
} from "lucide-react";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { formatCurrencyCLP } from "@/lib/dashboard-data";
import type {
  CapturedTransactionResult,
  ParsedTransactionCandidate,
} from "@/lib/finance-types";
import { getCategoryAppearance } from "@/lib/merchant-rules";

type CaptureMode = "type" | "voice";

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: {
      transcript: string;
    };
  }>;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

export function CaptureStudio({
  captureExamples,
  defaultAccountLabel,
}: {
  captureExamples: string[];
  defaultAccountLabel: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<CaptureMode>("type");
  const [input, setInput] = useState(captureExamples[0] ?? "");
  const [saved, setSaved] = useState<CapturedTransactionResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const latestInputRef = useRef(input);

  async function registerMovement(
    text: string,
    source: "manual" | "voice",
  ) {
    if (!text.trim()) {
      setError("Escribe o dicta algo antes de registrarlo.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/capture-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, source }),
      });

      const payload = (await response.json().catch(() => null)) as
        | CapturedTransactionResult
        | { error?: string };

      if (!response.ok) {
        throw new Error(payload && "error" in payload ? payload.error : "No pude guardar el movimiento.");
      }

      setSaved(payload as CapturedTransactionResult);
      router.refresh();
    } catch (caughtError) {
      setSaved(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Hubo un problema guardando el movimiento.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const saveLatestTranscript = useEffectEvent(() => {
    const transcript = latestInputRef.current.trim();
    if (transcript) {
      startTransition(() => {
        void registerMovement(transcript, "voice");
      });
    }
  });

  useEffect(() => {
    latestInputRef.current = input;
  }, [input]);

  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setVoiceSupported(false);
      return;
    }

    setVoiceSupported(true);

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "es-CL";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }

      setInput(transcript.trim());
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setError(
        event.error
          ? `El reconocimiento de voz fallo: ${event.error}.`
          : "No pude escuchar correctamente.",
      );
    };
    recognition.onend = () => {
      setIsListening(false);
      saveLatestTranscript();
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const parsed: ParsedTransactionCandidate | null = saved?.parsedTransaction ?? null;
  const parsedCategory = getCategoryAppearance(
    parsed?.category,
    parsed?.category ?? null,
  );

  return (
    <section className="glass-panel rounded-[32px] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Captura
          </p>
          <h2 className="section-title mt-2 text-3xl font-semibold">
            Nuevo movimiento
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Escribe o habla. Se registra directo en tu cuenta principal.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-[color:var(--line)] bg-white/80 p-1">
          <ModeButton
            active={mode === "type"}
            label="Escribe"
            onClick={() => setMode("type")}
          />
          <ModeButton
            active={mode === "voice"}
            label="Habla"
            onClick={() => setMode("voice")}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-4 sm:p-5">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Entrada natural
          </label>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={5}
            className="mt-3 w-full resize-none rounded-[24px] border border-[color:var(--line)] bg-white px-4 py-4 text-base outline-none transition focus:border-[color:var(--accent)]"
            placeholder="Ejemplo: pague 4.500 por un cafe en la universidad"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {captureExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setInput(example)}
                className="rounded-full border border-[color:var(--line)] bg-white px-3 py-2 text-xs font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink)]"
              >
                {example}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                startTransition(() => {
                  void registerMovement(input, "manual");
                });
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent-strong)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent)]"
            >
              {isSaving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Registrar
            </button>

            <button
              type="button"
              onClick={() => {
                if (!voiceSupported || !recognitionRef.current) {
                  setError("Tu navegador no expone reconocimiento de voz.");
                  return;
                }

                setMode("voice");
                setError(null);

                if (isListening) {
                  recognitionRef.current.stop();
                  setIsListening(false);
                  return;
                }

                setInput("");
                setIsListening(true);
                recognitionRef.current.start();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--line-strong)]"
            >
              {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isListening ? "Detener" : "Registrar por voz"}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[color:var(--muted)]">
            <AudioLines className="h-4 w-4 text-[color:var(--accent)]" />
            {mode === "voice"
              ? voiceSupported
                ? "Dicta normal. Cuando termines, se guarda automaticamente."
                : "Tu navegador no expone voz. Usa texto y seguimos igual de rapido."
              : `Cuenta por defecto: ${defaultAccountLabel ?? "la principal que definas"}.`}
          </div>

          {error ? (
            <div className="mt-4 rounded-[20px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-[color:var(--line)] bg-white/75 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Ultimo registro
            </p>
          </div>

          {saved && parsed ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-[22px] bg-[color:var(--surface-strong)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-[color:var(--muted)]">Guardado</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    registrado
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {parsed.amount ? formatCurrencyCLP(parsed.amount) : "Sin monto"}
                </p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{parsed.input}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ParsedValue label="Tipo" value={parsed.type} />
                <ParsedValue label="Merchant" value={parsed.merchant ?? "Sin merchant"} />
                <ParsedValue label="Categoria" value={parsedCategory.label} />
                <ParsedValue label="Cuenta" value={saved.accountLabel} />
                <ParsedValue
                  label="Fecha"
                  value={parsed.detectedDateLabel ?? "Hoy"}
                />
                <ParsedValue
                  label="Confianza"
                  value={`${Math.round(parsed.confidence * 100)}%`}
                />
              </div>

              <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">
                {saved.summary}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--surface-strong)] px-4 py-10 text-center text-sm leading-6 text-[color:var(--muted)]">
              Tu ultimo registro aparecerá aqui con monto, categoría y cuenta.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[color:var(--accent-strong)] text-white"
          : "text-[color:var(--muted)]"
      }`}
    >
      {label}
    </button>
  );
}

function ParsedValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[color:var(--ink)]">{value}</p>
    </div>
  );
}
