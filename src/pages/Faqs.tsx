import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  HelpCircle,
  FileText,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { database } from "@/firebase";
import { ref as dbRef, onValue, push, update, remove } from "firebase/database";

const FaqCard = ({ faq, index, onEdit, onDelete, onMove }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card-transition"
    >
      <Card className="h-full border overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex items-start gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <HelpCircle size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{faq.Question}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="mt-2 text-sm text-muted-foreground">{faq.Answer}</div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(faq)}
          >
            <Edit size={14} className="mr-1" /> Editar
          </Button>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="flex-none"
              onClick={() => onMove(index, "up")}
              disabled={index === 0}
            >
              <ArrowUp size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-none"
              onClick={() => onMove(index, "down")}
            >
              <ArrowDown size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-none text-destructive"
              onClick={() => onDelete(faq)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const FaqForm = ({ faq, onSave, onCancel }) => {
  const [formData, setFormData] = useState(faq || {
    IdFAQ: null,
    Question: "",
    Answer: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-lg shadow-lg border overflow-hidden"
    >
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">
          {faq ? "Editar FAQ" : "Agregar nueva FAQ"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="Question">Pregunta</Label>
            <Input
              id="Question"
              name="Question"
              value={formData.Question}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="Answer">Respuesta</Label>
            <Textarea
              id="Answer"
              name="Answer"
              rows={5}
              value={formData.Answer}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const Faqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  // Cargar FAQs desde Firebase
  useEffect(() => {
    const faqsRef = dbRef(database, "FAQ");
    onValue(faqsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const faqList = Object.keys(data).map((key) => ({
          IdFAQ: key,
          ...data[key],
        }));
        setFaqs(faqList);
      } else {
        setFaqs([]);
      }
    });
  }, []);

  // Guardar FAQ (agregar o editar)
  const handleSaveFaq = async (faqData) => {
    if (editingFaq) {
      // Editar FAQ existente
      const faqRef = dbRef(database, `FAQ/${editingFaq.IdFAQ}`);
      await update(faqRef, faqData);
    } else {
      // Agregar nueva FAQ
      const newFaqRef = push(dbRef(database, "FAQ"));
      const newFaq = {
        ...faqData,
        IdFAQ: newFaqRef.key,
      };
      await update(newFaqRef, newFaq);
    }
    setIsAddingFaq(false);
    setEditingFaq(null);
  };

  // Eliminar FAQ
  const handleDeleteFaq = (faq) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
      const faqRef = dbRef(database, `FAQ/${faq.IdFAQ}`);
      remove(faqRef);
    }
  };

  // Reordenar FAQs
  const handleMoveFaq = (index, direction) => {
    const newFaqs = [...faqs];
    if (direction === "up" && index > 0) {
      [newFaqs[index], newFaqs[index - 1]] = [newFaqs[index - 1], newFaqs[index]];
    } else if (direction === "down" && index < faqs.length - 1) {
      [newFaqs[index], newFaqs[index + 1]] = [newFaqs[index + 1], newFaqs[index]];
    }
    setFaqs(newFaqs);
  };

  // Filtrar FAQs
  const filteredFaqs = faqs.filter((faq) =>
    faq.Question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.Answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Preguntas frecuentes
          </h1>
          <p className="text-muted-foreground">Gestiona tus preguntas frecuentes.</p>
        </div>
        <Button className="sm:self-start" onClick={() => setIsAddingFaq(true)}>
          <Plus size={16} className="mr-2" /> Agregar
        </Button>
      </div>

      {isAddingFaq ? (
        <FaqForm
          faq={editingFaq}
          onSave={handleSaveFaq}
          onCancel={() => {
            setIsAddingFaq(false);
            setEditingFaq(null);
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 w-full"
              />
            </div>
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFaqs.map((faq, index) => (
                <FaqCard
                  key={faq.IdFAQ}
                  faq={faq}
                  index={index}
                  onEdit={(f) => {
                    setEditingFaq(f);
                    setIsAddingFaq(true);
                  }}
                  onDelete={handleDeleteFaq}
                  onMove={handleMoveFaq}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">
                No se encontraron preguntas frecuentes
              </h3>
              <p className="mt-1 text-muted-foreground">
                {searchTerm
                  ? "Intenta ajustar tu término de búsqueda."
                  : "Comienza agregando una nueva FAQ."}
              </p>
              <Button className="mt-4" onClick={() => setIsAddingFaq(true)}>
                <Plus size={16} className="mr-2" /> Agregar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Faqs;