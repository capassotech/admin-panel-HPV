import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://home-pisos-backend.onrender.com";

const NotificationSettings: React.FC = () => {
  const [adminEmail, setAdminEmail] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings/notifications`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAdminEmail(data.adminEmail || "");
      setIsDefault(Boolean(data.isDefault));
    } catch {
      toast.error("No se pudo cargar la configuración de notificaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/settings/notifications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      setAdminEmail(data.adminEmail);
      setIsDefault(false);
      toast.success("Email de notificaciones actualizado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notificaciones</h1>
        <p className="text-muted-foreground">
          Configurá a qué email llegan los avisos de nuevos pedidos.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Mail className="h-5 w-5 text-muted-foreground" /> Email de nuevos pedidos
          </CardTitle>
          <CardDescription>
            Cada vez que se confirma el pago de un pedido, se envía un aviso a esta
            dirección.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="tu-email@ejemplo.com"
                  required
                />
                {isDefault ? (
                  <p className="text-xs text-muted-foreground">
                    Este es el email por defecto configurado en el servidor. Guardá
                    para personalizarlo.
                  </p>
                ) : null}
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
