
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Folders, HelpCircle, Share2, DollarSign, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Dashboard = () => {
  const cardVariants = {
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 }
    }
  };

  const cards = [
    {
      title: "Productos",
      description: "Gestione la información de sus productos",
      icon: Package,
      link: "/productos",
      color: "bg-blue-500",
    },
    {
      title: "Categorías",
      description: "Organiza tus categorías de productos",
      icon: Folders,
      link: "/categorias",
      color: "bg-emerald-500",
    },
    {
      title: "Preguntas frecuentes",
      description: "Gestionar preguntas frecuentes",
      icon: HelpCircle,
      link: "/faqs",
      color: "bg-amber-500",
    },
    {
      title: "Redes sociales",
      description: "Actualiza tus enlaces de redes sociales y información de contacto",
      icon: Share2,
      link: "/social",
      color: "bg-purple-500",
    },
    {
      title: "Actualizar precios",
      description: "Actualizar los precios de tus productos",
      icon: DollarSign,
      link: "/precios",
      color: "bg-pink-500",
    },
    {
      title: "Mercado Pago",
      description: "Conectá tu cuenta para recibir pagos en la tienda",
      icon: CreditCard,
      link: "/pagos",
      color: "bg-sky-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hola Ramiro</h1>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de administración.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <Link
            to={card.link}
            key={card.title}
            className="block"
          >
            <motion.div
              whileHover="hover"
              variants={cardVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden h-full border">
                <div className={`${card.color} h-2`} />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <card.icon className="mr-2 h-5 w-5" />
                    {card.title}
                  </CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Toque para acceder
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
