import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAction, magicLinkAction } from "./actions";

interface Props {
  searchParams: { error?: string; magic?: string };
}

export default function LoginPage({ searchParams }: Props) {
  const error = searchParams.error
    ? decodeURIComponent(searchParams.error).replace("Invalid login credentials", "Email o contraseña incorrectos")
    : null;
  const magicSent = searchParams.magic === "1";

  return (
    <Card className="w-full max-w-sm mx-4">
        <CardHeader className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">Zecamo</div>
          <CardTitle className="text-lg">Ingresar al dashboard</CardTitle>
          <CardDescription>Acceso interno para el equipo de Zecamo Studios</CardDescription>
        </CardHeader>
        <CardContent>
          {magicSent ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Revisá tu email y hacé clic en el link de acceso.
              </p>
              <a href="/login" className="text-xs text-primary underline">
                Volver al login
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <p className="text-sm text-destructive text-center bg-destructive/10 rounded-md py-2 px-3">
                  {error}
                </p>
              )}

              <form action={loginAction} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="vos@zecamo.com"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Ingresar
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">o</span>
                </div>
              </div>

              <form action={magicLinkAction}>
                <input name="email" type="email" placeholder="tu@email.com" required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-2"
                />
                <button
                  type="submit"
                  className="w-full h-10 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors"
                >
                  Enviar magic link
                </button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
  );
}
