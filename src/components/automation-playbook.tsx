import { AudioLines, Link2, MessagesSquare, ShieldCheck, WalletCards } from "lucide-react";

import { automationMethods } from "@/lib/dashboard-data";

export function AutomationPlaybook() {
  const icons = [WalletCards, AudioLines, MessagesSquare];

  return (
    <section className="glass-panel rounded-[32px] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Automatizacion
          </p>
          <h2 className="section-title mt-2 text-3xl font-semibold">
            Entradas automaticas
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Shortcut, voz y mensajes comparten la misma entrada.
          </p>
        </div>

        <span className="rounded-full bg-[color:var(--accent-soft)] p-3 text-[color:var(--accent-strong)]">
          <Link2 className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          {automationMethods.map((method, index) => {
            const Icon = icons[index] ?? MessagesSquare;

            return (
              <article
                key={method.id}
                className="rounded-[28px] border border-[color:var(--line)] bg-white/80 p-5"
              >
                <div className="flex items-start gap-4">
                  <span className="rounded-full bg-[color:var(--surface-strong)] p-3 text-[color:var(--accent-strong)]">
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold">{method.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                      {method.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {method.bullets.map((bullet) => (
                        <span
                          key={bullet}
                          className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-3 py-2 text-xs font-medium text-[color:var(--muted)]"
                        >
                          {bullet}
                        </span>
                      ))}
                    </div>

                    <p className="mt-4 text-xs leading-5 text-[color:var(--muted)]">
                      {method.footnote}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid gap-4">
          <article className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white p-2 text-[color:var(--accent-strong)]">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">Webhook para iPhone Shortcuts</p>
                <p className="text-xs text-[color:var(--muted)]">Ruta lista para atajos.</p>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Endpoint
              </p>
              <p className="mt-2 break-all font-mono text-sm text-[color:var(--ink)]">
                /api/automations/shortcut-intake
              </p>
            </div>

            <div className="mt-4 rounded-[24px] bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Payload minimo
              </p>
              <pre className="mt-3 overflow-x-auto rounded-[18px] bg-[color:var(--surface-strong)] px-4 py-4 font-mono text-xs leading-6 text-[color:var(--ink)]">
{`{
  "merchant": "iMark",
  "amount": 24800,
  "source": "apple_pay",
  "note": "compra semanal",
  "webhookSecret": "tu-secreto"
}`}
              </pre>
            </div>
          </article>

          <article className="rounded-[28px] border border-[color:var(--line)] bg-white/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Flujo
            </p>
            <div className="mt-4 space-y-3">
              <StepLine
                number="1"
                text="El atajo o boton manda merchant, monto y origen al webhook."
              />
              <StepLine
                number="2"
                text="FLUJO normaliza el texto y devuelve categoria, confianza y fecha."
              />
              <StepLine
                number="3"
                text="Si la confianza es alta, solo revisas rapido. Si es media, confirmas."
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function StepLine({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-strong)] text-xs font-semibold text-white">
        {number}
      </span>
      <p className="text-sm leading-6 text-[color:var(--muted)]">{text}</p>
    </div>
  );
}
