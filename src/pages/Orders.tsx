import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Loader from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Package,
  MapPin,
  Mail,
  Phone,
  Clock,
  X,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://home-pisos-backend.onrender.com";

type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "rejected"
  | "cancelled";

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  priceType?: string | null;
  purchaseUnit?: string | null;
}

interface StatusHistoryEntry {
  status: OrderStatus;
  at: string;
}

interface Order {
  id: string;
  createdAt: string;
  updatedAt?: string;
  status: OrderStatus;
  statusHistory?: StatusHistoryEntry[];
  customer?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  shipping?: {
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    method?: { id?: string; name?: string; price?: number; estimatedDays?: string };
  };
  items?: OrderItem[];
  subtotal?: number;
  shippingCost?: number;
  total?: number;
}

interface StatusMeta {
  label: string;
  badgeClass: string;
  /** Estado al que avanza + texto del botón (null = terminal / sin avance) */
  next?: { status: OrderStatus; action: string };
}

const STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending: {
    label: "Pendiente de pago",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    next: { status: "paid", action: "Marcar pago aprobado" },
  },
  paid: {
    label: "Pago aprobado",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    next: { status: "confirmed", action: "Marcar en preparación" },
  },
  confirmed: {
    label: "En preparación",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    next: { status: "shipping", action: "Marcar en camino" },
  },
  shipping: {
    label: "En camino",
    badgeClass: "bg-violet-100 text-violet-800 border-violet-200",
    next: { status: "delivered", action: "Marcar como entregado" },
  },
  delivered: {
    label: "Entregado",
    badgeClass: "bg-green-600 text-white border-transparent",
  },
  rejected: {
    label: "Pago rechazado",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
  },
  cancelled: {
    label: "Cancelado",
    badgeClass: "bg-gray-200 text-gray-700 border-gray-300",
  },
};

/** Estados en los que todavía se puede cancelar el pedido. */
const CANCELLABLE: OrderStatus[] = ["pending", "paid", "confirmed", "shipping"];

const formatMoney = (n?: number) =>
  `$${Number(n ?? 0).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const getStatusMeta = (status: string): StatusMeta =>
  STATUS_META[status as OrderStatus] ?? {
    label: status,
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
  };

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const meta = getStatusMeta(status);
  return (
    <Badge className={`border ${meta.badgeClass}`} variant="outline">
      {meta.label}
    </Badge>
  );
};

/** Devuelve el historial mostrable, sintetizando uno para órdenes legadas. */
const getHistory = (order: Order): StatusHistoryEntry[] => {
  if (Array.isArray(order.statusHistory) && order.statusHistory.length > 0) {
    return order.statusHistory;
  }
  const base: StatusHistoryEntry[] = [
    { status: "pending", at: order.createdAt },
  ];
  if (order.status && order.status !== "pending") {
    base.push({ status: order.status, at: order.updatedAt || order.createdAt });
  }
  return base;
};

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Todos los estados" },
  { value: "pending", label: STATUS_META.pending.label },
  { value: "paid", label: STATUS_META.paid.label },
  { value: "confirmed", label: STATUS_META.confirmed.label },
  { value: "shipping", label: STATUS_META.shipping.label },
  { value: "delivered", label: STATUS_META.delivered.label },
  { value: "rejected", label: STATUS_META.rejected.label },
  { value: "cancelled", label: STATUS_META.cancelled.label },
];

interface OrderActionsProps {
  order: Order;
  isUpdating: boolean;
  onAdvance: (order: Order, status: OrderStatus) => void;
  onCancel: (order: Order) => void;
  className?: string;
}

const OrderActions: React.FC<OrderActionsProps> = ({
  order,
  isUpdating,
  onAdvance,
  onCancel,
  className,
}) => {
  const meta = getStatusMeta(order.status);
  const canCancel = CANCELLABLE.includes(order.status);
  if (!meta.next && !canCancel) return null;
  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      {meta.next ? (
        <Button
          size="sm"
          disabled={isUpdating}
          onClick={() => onAdvance(order, meta.next!.status)}
        >
          {meta.next.action}
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : null}
      {canCancel ? (
        <Button
          size="sm"
          variant="outline"
          disabled={isUpdating}
          onClick={() => onCancel(order)}
        >
          Cancelar
        </Button>
      ) : null}
    </div>
  );
};

const OrderDetail: React.FC<{ order: Order; actions?: React.ReactNode }> = ({
  order,
  actions,
}) => {
  const history = getHistory(order);
  return (
    <div className="grid gap-6 p-4 md:grid-cols-2">
      {actions ? (
        <div className="md:col-span-2">
          <h4 className="mb-2 text-sm font-semibold text-foreground">Acciones</h4>
          {actions}
        </div>
      ) : null}
      {/* Productos */}
      <div className="md:col-span-2">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Package className="h-4 w-4" /> Productos
        </h4>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Producto</th>
                <th className="px-3 py-2 text-right font-medium">Cant.</th>
                <th className="px-3 py-2 text-right font-medium">P. unit.</th>
                <th className="px-3 py-2 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.items ?? []).map((item, i) => (
                <tr key={`${item.productId}-${i}`} className="border-t">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-9 w-9 rounded object-cover"
                        />
                      ) : null}
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        {item.purchaseUnit ? (
                          <div className="text-xs text-muted-foreground">
                            {item.purchaseUnit}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">{formatMoney(item.price)}</td>
                  <td className="px-3 py-2 text-right font-medium">
                    {formatMoney(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Envío */}
      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin className="h-4 w-4" /> Dirección de envío
        </h4>
        <div className="space-y-0.5 text-sm text-muted-foreground">
          <p className="text-foreground">
            {order.customer?.firstName} {order.customer?.lastName}
          </p>
          <p>{order.shipping?.address}</p>
          <p>
            {order.shipping?.city}
            {order.shipping?.province ? `, ${order.shipping.province}` : ""}
          </p>
          <p>CP {order.shipping?.postalCode}</p>
          {order.shipping?.method?.name ? (
            <p className="pt-1">
              Método: {order.shipping.method.name}
              {order.shipping.method.estimatedDays
                ? ` (${order.shipping.method.estimatedDays})`
                : ""}
            </p>
          ) : null}
        </div>
      </div>

      {/* Contacto + resumen */}
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">Contacto</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {order.customer?.email || "—"}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {order.customer?.phone || "—"}
            </p>
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">Resumen</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Envío</span>
              <span>{formatMoney(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between border-t pt-1 font-semibold text-foreground">
              <span>Total</span>
              <span>{formatMoney(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="md:col-span-2">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Clock className="h-4 w-4" /> Historial de estados
        </h4>
        <ol className="relative space-y-3 border-l pl-4">
          {history.map((h, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={h.status} />
                <span className="text-xs text-muted-foreground">
                  {formatDate(h.at)}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/orders`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar los pedidos:", err);
      setError("No se pudieron cargar los pedidos. Inténtelo de nuevo más tarde.");
      toast.error("Error al cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const patchStatus = async (order: Order, newStatus: OrderStatus) => {
    setUpdatingId(order.id);
    try {
      const res = await fetch(`${API_URL}/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated: Order = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, ...updated } : o))
      );
      const msg =
        newStatus === "cancelled"
          ? "Pedido cancelado"
          : `Pedido actualizado: ${STATUS_META[newStatus].label}`;
      toast.success(msg, {
        className: newStatus === "cancelled" ? undefined : "!bg-emerald-600 !text-white",
      });
    } catch (err) {
      console.error("Error al actualizar el estado:", err);
      toast.error("No se pudo actualizar el estado del pedido.");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    const target = cancelTarget;
    setCancelTarget(null);
    await patchStatus(target, "cancelled");
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;

      if (fromTime || toTime) {
        const created = new Date(o.createdAt).getTime();
        if (fromTime && created < fromTime) return false;
        if (toTime && created > toTime) return false;
      }

      if (q) {
        const name = `${o.customer?.firstName ?? ""} ${o.customer?.lastName ?? ""}`.toLowerCase();
        const haystack = `${o.id} ${name} ${o.customer?.email ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [orders, statusFilter, search, dateFrom, dateTo]);

  const hasActiveFilters =
    statusFilter !== "all" || search.trim() !== "" || dateFrom !== "" || dateTo !== "";

  const clearFilters = () => {
    setStatusFilter("all");
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Listado de pedidos recibidos desde la tienda.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, ID o email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <label className="whitespace-nowrap text-sm text-muted-foreground">Desde</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="whitespace-nowrap text-sm text-muted-foreground">Hasta</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        {hasActiveFilters ? (
          <div className="sm:col-span-2 lg:col-span-4">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" /> Limpiar filtros
            </Button>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 py-8 text-center text-destructive">
          <p>{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-lg border py-12 text-center text-muted-foreground">
          <p>
            {orders.length === 0
              ? "No hay pedidos registrados aún."
              : "No hay pedidos que coincidan con los filtros."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const isExpanded = expandedId === order.id;
                const isUpdating = updatingId === order.id;
                return [
                    <TableRow
                      key={order.id}
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : order.id)
                      }
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{order.id}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        {order.customer?.firstName} {order.customer?.lastName}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatMoney(order.total)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <OrderActions
                          order={order}
                          isUpdating={isUpdating}
                          onAdvance={patchStatus}
                          onCancel={setCancelTarget}
                          className="hidden flex-wrap justify-end gap-2 md:flex"
                        />
                      </TableCell>
                    </TableRow>,
                    isExpanded ? (
                      <TableRow
                        key={`${order.id}-detail`}
                        className="hover:bg-transparent"
                      >
                        <TableCell colSpan={7} className="bg-muted/30 p-0">
                          <OrderDetail
                            order={order}
                            actions={
                              <OrderActions
                                order={order}
                                isUpdating={isUpdating}
                                onAdvance={patchStatus}
                                onCancel={setCancelTarget}
                                className="flex flex-wrap gap-2 md:hidden"
                              />
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ) : null,
                  ];
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar pedido</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget ? (
                <>
                  ¿Seguro que querés cancelar el pedido{" "}
                  <span className="font-mono font-medium text-foreground">
                    {cancelTarget.id}
                  </span>
                  {cancelTarget.customer?.firstName ? (
                    <> de {cancelTarget.customer.firstName} {cancelTarget.customer.lastName}</>
                  ) : null}
                  ? El pedido quedará marcado como{" "}
                  <span className="font-medium text-foreground">cancelado</span> y
                  esta acción no se puede deshacer.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, cancelar pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Orders;
