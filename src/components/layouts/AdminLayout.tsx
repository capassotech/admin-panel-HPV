import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Home, Package, Folders, HelpCircle,
  Share2, DollarSign, LogOut, ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  onLogout: () => void;
}

const AdminLayout = ({ onLogout }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

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

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Productos", path: "/productos", icon: Package },
    { name: "Pedidos", path: "/pedidos", icon: ShoppingCart },
    { name: "Categorías", path: "/categorias", icon: Folders },
    { name: "Preguntas frecuentes", path: "/faqs", icon: HelpCircle },
    { name: "Redes sociales", path: "/social", icon: Share2 },
    { name: "Actualizar precios", path: "/precios", icon: DollarSign },
  ];

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

  const getPageTitle = () => {
    const currentRoute = navigation.find(item => item.path === location.pathname);
    return currentRoute ? currentRoute.name : "Admin Panel";
  };

  // Sidebar content (reutilizado por mobile y desktop)
  const SidebarInner = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold text-foreground">Panel de administración</h2>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X size={20} className="text-muted-foreground" />
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => (
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
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-3" />
          Cerrar Sesión
        </Button>
      </div>
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
      {/* Sidebar DESKTOP estático */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-40 md:w-64 md:bg-card md:shadow-lg md:border-r"
        )}
        aria-label="Sidebar de escritorio"
      >
        <SidebarInner />
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
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center gap-2">
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
              <h1 className="text-lg font-medium">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-4">Administrador</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            className="flex-1 p-4 md:p-6 overflow-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminLayout;