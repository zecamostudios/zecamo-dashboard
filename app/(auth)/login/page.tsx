import { loginAction, magicLinkAction } from "./actions";

interface Props {
  searchParams: { error?: string; magic?: string };
}

const INPUT = "w-full rounded-xl bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-[13.5px] px-3.5 py-3 text-[#F4F6FB] placeholder:text-[#5B6588] outline-none focus:border-[rgba(43,91,255,0.5)] focus:shadow-[0_0_0_3px_rgba(43,91,255,0.12)] transition-all";

export default function LoginPage({ searchParams }: Props) {
  const error = searchParams.error ? decodeURIComponent(searchParams.error) : null;
  const magicSent = searchParams.magic === "1";

  return (
    <div className="w-full max-w-[400px] mx-auto px-4">
      <div className="bg-[#0F1730] border border-[rgba(255,255,255,0.07)] rounded-2xl p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-[14px] grid place-items-center bg-gradient-to-br from-[#2B5BFF] to-[#1A3FCC] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_24px_rgba(43,91,255,0.45)] mb-4">
            <span className="font-bold text-white text-[20px]">Z</span>
          </div>
          <h1 className="text-[20px] font-semibold text-[#F4F6FB] tracking-tight">Zecamo Studios</h1>
          <p className="text-[12.5px] text-[#8B95B0] mt-1">Acceso interno al dashboard</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[12.5px] text-red-400 text-center">
            {error}
          </div>
        )}

        {magicSent ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[rgba(34,197,139,0.12)] border border-[rgba(34,197,139,0.2)] grid place-items-center mx-auto mb-4">
              <span className="text-[#22C58B] text-xl">✓</span>
            </div>
            <p className="text-[13.5px] text-[#F4F6FB] font-medium">Revisá tu email</p>
            <p className="text-[12.5px] text-[#8B95B0]">Te mandamos un link de acceso. Hacé clic en él para entrar.</p>
            <a href="/login" className="inline-block mt-3 text-[12px] text-[#3F6FFF] hover:underline">← Volver al login</a>
          </div>
        ) : (
          <>
            <form action={loginAction} className="space-y-3.5">
              <div>
                <label className="text-[11px] uppercase tracking-[0.07em] text-[#8B95B0] font-medium mb-1.5 block">Email</label>
                <input name="email" type="email" placeholder="vos@zecamo.com" required autoComplete="email" className={INPUT} />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.07em] text-[#8B95B0] font-medium mb-1.5 block">Contraseña</label>
                <input name="password" type="password" placeholder="••••••••" required autoComplete="current-password" className={INPUT} />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-[13.5px] font-semibold bg-gradient-to-r from-[#2B5BFF] to-[#3F6FFF] text-white border-0 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(43,91,255,0.35)] mt-1"
              >
                Ingresar
              </button>
            </form>

            <div className="relative my-6">
              <div className="border-t border-[rgba(255,255,255,0.06)]" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] text-[#5B6588] px-3 bg-[#0F1730]">o usá magic link</span>
              </span>
            </div>

            <form action={magicLinkAction} className="space-y-2.5">
              <input name="email" type="email" placeholder="tu@email.com" required autoComplete="email" className={INPUT} />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-[13px] font-medium bg-transparent border border-[rgba(255,255,255,0.08)] text-[#8B95B0] cursor-pointer hover:border-[rgba(43,91,255,0.4)] hover:text-[#F4F6FB] transition-all"
              >
                Enviar magic link
              </button>
            </form>
          </>
        )}
      </div>
      <p className="text-center text-[11.5px] text-[#5B6588] mt-6">Solo para el equipo de Zecamo Studios</p>
    </div>
  );
}
