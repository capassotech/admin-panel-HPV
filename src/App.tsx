
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import NewProduct from "./pages/NewProduct";
import EditProduct from "./pages/EditProduct";
import Categories from "./pages/Categories";
import NewCategory from "./pages/NewCategory";
import EditCategory from "./pages/EditCategory";
import Faqs from "./pages/Faqs";
import SocialNetworks from "./pages/SocialNetworks";
import PriceUpdates from "./pages/PriceUpdates";
import Orders from "./pages/Orders";
import MercadoPago from "./pages/MercadoPago";
import NotFound from "./pages/NotFound";

// Layout
import AdminLayout from "./components/layouts/AdminLayout";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  // Mock auth functions - would be replaced with real auth in a complete implementation
  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? (
                  <Login onLogin={handleLogin} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />
            
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <AdminLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="productos" element={<Products />} />
              <Route path="productos/nuevo" element={<NewProduct />} />
              <Route path="productos/:productId/editar" element={<EditProduct />} />
              <Route path="categorias/nuevo" element={<NewCategory />} />
              <Route path="categorias/:categoryId/editar" element={<EditCategory />} />
              <Route path="categorias" element={<Categories />} />
              <Route path="faqs" element={<Faqs />} />
              <Route path="social" element={<SocialNetworks />} />
              <Route path="precios" element={<PriceUpdates />} />
              <Route path="pedidos" element={<Orders />} />
              <Route path="pagos" element={<MercadoPago />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;