import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { Instagram, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

type IgConnection = {
  ig_user_id: string;
  username: string | null;
  token_expires_at: string;
  cliente_id: string | null;
  permissions: string[] | null;
};

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function diasRestantes(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export default async function RedesSocialesPage({
  searchParams,
}: {
  searchParams: Promise<{ ig?: string; reason?: string; user?: string }>;
}) {
  const sp = await searchParams;

  // Lectura server-side (service role). No se selecciona el access_token.
  let cuenta: IgConnection | null = null;
  let dbError: string | null = null;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("instagram_connections")
      .select("ig_user_id, username, token_expires_at, cliente_id, permissions")
      .is("cliente_id", null) // cuenta propia de Zecamo
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) dbError = error.message;
    else cuenta = data as IgConnection | null;
  } catch (e) {
    dbError = (e as Error).message;
  }

  const conectado = !!cuenta;
  const dias = cuenta ? diasRestantes(cuenta.token_expires_at) : 0;
  const expirado = conectado && dias <= 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Redes Sociales</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Conectá las cuentas de Instagram Business para publicar y gestionar desde el dashboard.
        </p>
      </div>

      {/* Feedback del callback OAuth */}
      {sp.ig === "connected" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          Instagram conectado correctamente{sp.user ? ` (ID ${sp.user})` : ""}.
        </div>
      )}
      {sp.ig === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-800 flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />
          No se pudo conectar Instagram{sp.reason ? `: ${sp.reason}` : "."}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Instagram className="size-4 text-primary" />
            </div>
            Instagram Business
            {conectado ? (
              expirado ? (
                <Badge variant="destructive" className="ml-auto">Token vencido</Badge>
              ) : (
                <Badge className="ml-auto bg-emerald-500 text-white">Conectado</Badge>
              )
            ) : (
              <Badge variant="outline" className="ml-auto">No conectado</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dbError && (
            <p className="text-sm text-amber-700">
              No se pudo leer el estado: {dbError}
            </p>
          )}

          {conectado ? (
            <>
              <dl className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Usuario conectado</dt>
                  <dd className="font-medium mt-0.5">
                    {cuenta!.username ? `@${cuenta!.username}` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Instagram user ID</dt>
                  <dd className="font-mono text-xs mt-1">{cuenta!.ig_user_id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Token expira</dt>
                  <dd className="font-medium mt-0.5">
                    {fmtFecha(cuenta!.token_expires_at)}{" "}
                    <span className={expirado ? "text-red-600" : dias <= 7 ? "text-amber-600" : "text-muted-foreground"}>
                      ({expirado ? "vencido" : `en ${dias} días`})
                    </span>
                  </dd>
                </div>
              </dl>
              <a
                href="/api/auth/instagram"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <RefreshCw className="size-3.5" />
                Reconectar / renovar token
              </a>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Todavía no hay ninguna cuenta de Instagram conectada. Conectá la cuenta de
                Zecamo para habilitar la publicación.
              </p>
              <a
                href="/api/auth/instagram"
                className={buttonVariants({ size: "default" })}
              >
                <Instagram className="size-4" />
                Conectar Instagram
              </a>
            </>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Para conectar la cuenta de un cliente usá{" "}
        <code className="font-mono">/api/auth/instagram?clienteId=&lt;uuid&gt;</code>.
        LinkedIn y otras redes se agregarán acá mismo.
      </p>
    </div>
  );
}
