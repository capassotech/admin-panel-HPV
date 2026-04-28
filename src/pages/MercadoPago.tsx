import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Link, Unlink } from "lucide-react";

interface AccountInfo {
  userId: string;
  email: string | null;
  name: string | null;
}

interface ConnectionStatus {
  connected: boolean;
  source: "oauth" | "env" | "none";
  userId?: string;
  savedAt?: string;
  accountInfo?: AccountInfo | null;
}

const API_URL = import.meta.env.VITE_API_URL || "https://home-pisos-backend.onrender.com";

const AccountDetails = ({ status }: { status: ConnectionStatus | null }) => {
  if (!status) return null;

  if (status.source === "none") {
    return <span>No hay ninguna cuenta de Mercado Pago conectada.</span>;
  }

  const info = status.accountInfo;
  const lines: string[] = [];
  if (info?.name) lines.push(info.name);
  if (info?.email) lines.push(info.email);
  if (info?.userId) lines.push(`ID: ${info.userId}`);

  if (status.connected) {
    return (
      <span>
        {lines.join(" · ")}
        {status.savedAt && ` · Vinculada el ${new Date(status.savedAt).toLocaleDateString("es-AR")}`}
      </span>
    );
  }

  return (
    <span>
      <span className="font-medium text-amber-600">Cuenta de respaldo (variable de entorno)</span>
      {lines.length > 0 && <> · {lines.join(" · ")}</>}
    </span>
  );
};

const MercadoPago = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/mercadopago/status`);
      const data = await res.json();
      setStatus(data);
    } catch {
      toast.error("No se pudo verificar el estado de Mercado Pago.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const oauthStatus = searchParams.get("status");
    const reason = searchParams.get("reason");

    if (oauthStatus === "success") {
      toast.success("Cuenta de Mercado Pago conectada correctamente.");
      setSearchParams({}, { replace: true });
    } else if (oauthStatus === "error") {
      toast.error(`Error al conectar: ${reason || "error desconocido"}`);
      setSearchParams({}, { replace: true });
    }

    fetchStatus();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch(`${API_URL}/api/mercadopago/oauth/url`);
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "No se pudo iniciar la conexión.");
        return;
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Error al conectar con Mercado Pago.");
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("¿Desconectar la cuenta de Mercado Pago? Los pagos dejarán de procesarse.")) return;
    setDisconnecting(true);
    try {
      const res = await fetch(`${API_URL}/api/mercadopago/disconnect`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Cuenta desconectada.");
      await fetchStatus();
    } catch {
      toast.error("Error al desconectar la cuenta.");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mercado Pago</h1>
        <p className="text-muted-foreground">Conectá la cuenta de Mercado Pago para recibir pagos en la tienda.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {loading ? (
              "Verificando conexión..."
            ) : status?.connected ? (
              <>
                <CheckCircle2 className="text-green-500 h-5 w-5" />
                Cuenta conectada via OAuth
              </>
            ) : status?.source === "env" ? (
              <>
                <CheckCircle2 className="text-amber-500 h-5 w-5" />
                Cuenta de respaldo activa
              </>
            ) : (
              <>
                <XCircle className="text-destructive h-5 w-5" />
                Sin cuenta conectada
              </>
            )}
          </CardTitle>
          <CardDescription>
            {loading ? "Consultando estado..." : <AccountDetails status={status} />}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {!loading && !status?.connected && (
            <Button onClick={handleConnect} disabled={connecting} className="w-full sm:w-auto">
              <Link className="mr-2 h-4 w-4" />
              {connecting ? "Redirigiendo a Mercado Pago..." : "Conectar cuenta de Mercado Pago"}
            </Button>
          )}

          {!loading && status?.connected && (
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="w-full sm:w-auto"
            >
              <Unlink className="mr-2 h-4 w-4" />
              {disconnecting ? "Desconectando..." : "Desconectar cuenta"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-base">¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Hacé clic en <strong>Conectar cuenta</strong>.</p>
          <p>2. Iniciá sesión con el usuario y contraseña de Mercado Pago.</p>
          <p>3. Aceptá los permisos. Eso es todo.</p>
          <p>Los pagos se acreditarán directamente en la cuenta conectada.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MercadoPago;
