import { Sparkles } from 'lucide-react'

export const authUi = {
  label:
    'mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400',
  input:
    'w-full rounded-[14px] border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-400/60 focus:bg-indigo-500/[0.06] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]',
  inputPlain:
    'w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-400/60 focus:bg-indigo-500/[0.06] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]',
  inputReadonly:
    'w-full rounded-[14px] border border-white/5 bg-white/[0.02] py-3.5 pl-11 pr-4 text-sm text-slate-400 cursor-not-allowed',
  errorText:
    'mt-2 flex items-center gap-1.5 text-xs text-rose-300',
  errorPanel:
    'flex items-center gap-2.5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200',
  primaryButton:
    'mt-1 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#6675f5_0%,#4f7cf7_52%,#4ab8f9_100%)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(59,130,246,0.26)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(59,130,246,0.32)] disabled:cursor-not-allowed disabled:opacity-60',
  secondaryButton:
    'w-full rounded-[14px] border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm font-semibold text-slate-100 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.06]',
  otpInput:
    'h-14 w-12 rounded-[14px] border border-white/10 bg-white/[0.04] text-center text-xl font-bold text-slate-100 outline-none transition-all duration-200 focus:border-indigo-400/60 focus:bg-indigo-500/[0.08] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] sm:h-16 sm:w-[56px]',
}

export default function AuthShell({
  badge,
  title,
  description,
  stats = [],
  pills = [],
  cardTitle,
  cardDescription,
  children,
  maxFormWidth = 'max-w-md',
}) {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#020408] text-slate-50"
      style={{
        background:
          'radial-gradient(ellipse at top, rgba(8,12,28,0.96) 0%, #04060f 54%, #03050c 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 16% 18%, rgba(59,130,246,0.12), transparent 0 34%),' +
            'radial-gradient(circle at 84% 22%, rgba(99,102,241,0.10), transparent 0 28%),' +
            'linear-gradient(180deg, rgba(2,6,23,0.04) 0%, rgba(2,6,23,0.22) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      <div
        className="pointer-events-none absolute -left-56 -top-56 h-[40rem] w-[40rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 64%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-44 -right-36 h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row items-center justify-center gap-8 px-6 py-8 lg:gap-12 lg:px-8 xl:gap-16 xl:px-10">
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="w-full max-w-[34rem]">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.24)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-semibold tracking-wide text-indigo-100">{badge}</span>
            </div>

            <h1
              className="mb-4 font-black leading-[0.98] tracking-[-0.045em] text-slate-50"
              style={{ fontSize: 'clamp(2.2rem, 3.9vw, 3.55rem)' }}
            >
              {title}
            </h1>

            <p className="mb-8 max-w-[32rem] text-[1rem] leading-relaxed text-slate-400">
              {description}
            </p>

            {stats.length > 0 && (
              <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {stats.map(({ value, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl px-4 py-3.5"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.025) 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 10px 24px rgba(2,6,23,0.18)',
                    }}
                  >
                    <div className="text-base font-extrabold leading-none text-white">{value}</div>
                    <div className="mt-1 text-[11px] font-medium text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            )}

            {pills.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {pills.map((pill) => (
                  <div
                    key={pill}
                    className="inline-flex items-center rounded-full px-3.5 py-2 text-xs font-semibold text-slate-200"
                    style={{
                      background: 'rgba(255,255,255,0.035)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {pill}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 w-full flex items-center justify-center">
          <div className={`w-full ${maxFormWidth} mx-auto`}>
            <div
              className="relative rounded-[30px] p-[1px]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(129,140,248,0.55), rgba(59,130,246,0.42), rgba(148,163,184,0.16))',
                boxShadow: '0 20px 60px rgba(2,6,23,0.34)',
              }}
            >
              <div
                className="relative overflow-hidden rounded-[29px] p-7 sm:p-8 lg:p-9"
                style={{
                  background: 'linear-gradient(180deg, rgba(9,12,24,0.96) 0%, rgba(7,9,20,0.92) 100%)',
                  backdropFilter: 'blur(28px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 60px rgba(2,6,23,0.48)',
                }}
              >
                <div
                  className="pointer-events-none absolute left-1/2 top-0 h-px w-4/5 -translate-x-1/2"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.42), transparent)',
                  }}
                />
                <div
                  className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
                  style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 72%)' }}
                />

                <div className="relative mb-8">
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-[18px]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(99,102,241,0.18))',
                      border: '1px solid rgba(99,102,241,0.34)',
                      boxShadow: '0 10px 24px rgba(59,130,246,0.14)',
                    }}
                  >
                    <Sparkles className="h-5 w-5 text-indigo-300" />
                  </div>
                  <h2 className="mb-2 text-[1.9rem] font-bold tracking-[-0.03em] text-white">{cardTitle}</h2>
                  <p className="max-w-sm text-sm leading-6 text-slate-400">{cardDescription}</p>
                </div>

                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
