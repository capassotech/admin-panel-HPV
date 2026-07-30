import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { auth } from "@/firebase"; // Importa la instancia de autenticación
import { signInWithEmailAndPassword } from "firebase/auth"; // Método de inicio de sesión

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Intenta iniciar sesión con Firebase
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
      onLogin(); // Llama al callback de inicio de sesión exitoso
    } catch (err: any) {
      setIsLoading(false);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Correo electrónico o contraseña incorrectos.");
      } else {
        setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white p-4">
      {/* Decoración de fondo */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <motion.img
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            src="/og-image.png"
            alt="Home Pisos Vinílicos"
            className="h-16 w-auto drop-shadow-sm sm:h-20"
          />
          <p className="text-sm text-muted-foreground">Panel de administración</p>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/70">
          <CardHeader className="space-y-1.5 pb-4 text-center">
            <CardTitle className="text-2xl font-semibold">Iniciar sesión</CardTitle>
            <CardDescription>
              Ingresá tus credenciales para acceder al panel
            </CardDescription>
            {error && (
              <p className="!mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail size={18} />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Introduce tu correo electrónico"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock size={18} />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese su contraseña"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full shadow-md shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-xs text-muted-foreground">
            Desarrollado por{" "}
            <a
              href="https://capasso.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-medium text-primary hover:underline"
            >
              Capasso Tech
            </a>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;