import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import Loader from "@/components/ui/loader";
import { toast } from "sonner";

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // default to remote backend if env var missing
        const apiUrl = import.meta.env.VITE_API_URL || "https://home-pisos-backend.onrender.com";
        if (!import.meta.env.VITE_API_URL) {
          console.warn("VITE_API_URL not defined, defaulting to remote backend");
        }
        const url = `${apiUrl}/api/orders`;
        console.log("Fetching orders from", url);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Error al cargar los pedidos:", err);
        setError("No se pudieron cargar los pedidos. Inténtelo de nuevo más tarde.");
        toast.error("Error al cargar los pedidos.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">Listado de pedidos recibidos desde la tienda.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p>No hay pedidos registrados aún.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleString('es-ES')}</TableCell>
                <TableCell>
                  {order.customer?.firstName} {order.customer?.lastName}
                </TableCell>
                <TableCell>${order.total?.toLocaleString('es-ES')}</TableCell>
                <TableCell>{order.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Orders;
