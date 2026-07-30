import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Home, Package, Folders, HelpCircle,
  Share2, DollarSign, LogOut, ShoppingCart, CreditCard, Bell,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNewOrdersCount } from "@/hooks/useNewOrdersCount";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  onLogout: () => void;
}

const navGroups = [
  {
    label: "Principal",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Productos", path: "/productos", icon: Package },
      { name: "Pedidos", path: "/pedidos", icon: ShoppingCart },
      { name: "Categorías", path: "/categorias", icon: Folders },
    ],
  },
  {
    label: "Contenido",
    items: [
      { name: "Preguntas frecuentes", path: "/faqs", icon: HelpCircle },
      { name: "Redes sociales", path: "/social", icon: Share2 },
      { name: "Actualizar precios", path: "/precios", icon: DollarSign },
    ],
  },
  {
    label: "Configuración",
    items: [
      { name: "Mercado Pago", path: "/pagos", icon: CreditCard },
      { name: "Notificaciones", path: "/notificaciones", icon: Bell },
    ],
  },
];

const isLocalBackend = /localhost|127\.0\.0\.1/.test(import.meta.env.VITE_API_URL || "");
const backendLabel = isLocalBackend ? "Local" : "QA";
const dbProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "desconocida";
const isQaDb = dbProjectId === "hpv-desarrollo";
const dbLabel = isQaDb ? "QA" : dbProjectId;

const AdminLayout = ({ onLogout }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { newOrdersCount, markAllSeen } = useNewOrdersCount();

  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  useEffect(() => {
    if (location.pathname.startsWith("/pedidos")) markAllSeen();
  }, [location.pathname, markAllSeen]);

  // En desktop lo queremos abierto por defecto
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => setIsSidebarOpen((s) => !s);

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      onLogout();
      navigate("/login");
    }
  };

  const mobileSidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30, when: "afterChildren" }
    },
  };

  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.3 }
  };

  // Sidebar content (reutilizado por mobile y desktop)
  const SidebarInner = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
            H
          </div>
          <h2 className="truncate text-sm font-semibold text-foreground">Home Pisos · Admin</h2>
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X size={20} className="text-muted-foreground" />
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-4 px-2">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </p>
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={18}
                        className={cn(
                          "mr-3",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span className="flex-1">{item.name}</span>
                      {item.path === "/pedidos" && newOrdersCount > 0 ? (
                        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground">
                          {newOrdersCount > 99 ? "99+" : newOrdersCount}
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );

  return (
    <div
      className={cn(
        "min-h-screen bg-background w-full",
        // En desktop, cuando el sidebar está visible, reservamos 16rem
        !isMobile && isSidebarOpen && "md:pl-64"
      )}
    >
      {/* Sidebar DESKTOP estático, colapsable */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-40 md:bg-card md:shadow-lg md:border-r md:transition-[width] md:duration-200 md:overflow-hidden",
          isSidebarOpen ? "md:w-64" : "md:w-0 md:border-r-0"
        )}
        aria-label="Sidebar de escritorio"
      >
        <div className="w-64 h-full">
          <SidebarInner />
        </div>
      </aside>

      {/* Backdrop + Sidebar MOBILE animado */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.aside
            key="mobile-aside"
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileSidebarVariants}
            className="fixed top-0 left-0 z-50 h-full w-64 bg-card shadow-lg border-r md:hidden"
            aria-label="Sidebar móvil"
          >
            <SidebarInner />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Contenido */}
      <main className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b">
          <div className="flex items-center justify-between gap-2 px-4 h-full sm:px-6">
            <div className="flex items-center gap-1">
              {/* Hamburguesa solo en mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleSidebar}
                aria-label="Abrir menú"
              >
                <Menu size={20} />
              </Button>
              {/* Colapsar sidebar solo en desktop */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex text-muted-foreground"
                onClick={toggleSidebar}
                aria-label={isSidebarOpen ? "Contraer menú lateral" : "Expandir menú lateral"}
                title={isSidebarOpen ? "Contraer menú lateral" : "Expandir menú lateral"}
              >
                {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </Button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {!import.meta.env.PROD && (
                <div className="hidden items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {backendLabel} · BD {dbLabel}
                </div>
              )}

              <Button variant="ghost" size="icon" className="relative" asChild>
                <NavLink to="/pedidos" aria-label="Ver pedidos">
                  <Bell size={18} />
                  {newOrdersCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                      {newOrdersCount > 99 ? "99+" : newOrdersCount}
                    </span>
                  )}
                </NavLink>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </header>

        <motion.div
          initial="initial"
          animate="animate"
          variants={pageTransition}
          className="flex-1 p-4 md:p-6 overflow-auto"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default AdminLayout;
