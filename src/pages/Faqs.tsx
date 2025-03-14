
import { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, Search, Edit, Trash2, HelpCircle,
  FileText, ArrowUp, ArrowDown
} from "lucide-react";
import { motion } from "framer-motion";

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
              <CardTitle className="text-base">{faq.question}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="mt-2 text-sm text-muted-foreground">
            {faq.answer}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(faq)}>
            <Edit size={14} className="mr-1" /> Edit
          </Button>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-none"
              onClick={() => onMove(index, 'up')}
              disabled={index === 0}
            >
              <ArrowUp size={14} />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-none"
              onClick={() => onMove(index, 'down')}
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
    id: null,
    question: "",
    answer: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          {faq ? "Edit FAQ" : "Add New FAQ"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              name="question"
              value={formData.question}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              name="answer"
              rows={5}
              value={formData.answer}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Save FAQ
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const Faqs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  
  // Mock data
  const mockFaqs = [
    {
      id: 1,
      question: "¿Cuál es la diferencia entre pisos LVT y pisos de melamina?",
      answer: "Los pisos LVT (Luxury Vinyl Tile) son impermeables y más resistentes a la humedad, mientras que los pisos de melamina tienen un aspecto más natural pero son más sensibles al agua."
    },
    {
      id: 2,
      question: "¿Ofrecen servicio de instalación?",
      answer: "Sí, ofrecemos servicio de instalación profesional para todos nuestros productos. Puede contratar este servicio al momento de la compra."
    },
    {
      id: 3,
      question: "¿Cuánto tiempo dura la garantía de los productos?",
      answer: "La garantía varía según el tipo de producto, pero generalmente ofrecemos entre 5 y 15 años de garantía en nuestros pisos."
    }
  ];
  
  const [faqs, setFaqs] = useState(mockFaqs);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddFaq = () => {
    setEditingFaq(null);
    setIsAddingFaq(true);
  };
  
  const handleEditFaq = (faq) => {
    setEditingFaq(faq);
    setIsAddingFaq(true);
  };
  
  const handleDeleteFaq = (faq) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      setFaqs(prevFaqs => prevFaqs.filter(f => f.id !== faq.id));
    }
  };
  
  const handleMoveFaq = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newFaqs = [...faqs];
      [newFaqs[index], newFaqs[index - 1]] = [newFaqs[index - 1], newFaqs[index]];
      setFaqs(newFaqs);
    } else if (direction === 'down' && index < faqs.length - 1) {
      const newFaqs = [...faqs];
      [newFaqs[index], newFaqs[index + 1]] = [newFaqs[index + 1], newFaqs[index]];
      setFaqs(newFaqs);
    }
  };
  
  const handleSaveFaq = (faqData) => {
    if (editingFaq) {
      // Update existing faq
      setFaqs(prevFaqs => 
        prevFaqs.map(f => f.id === editingFaq.id ? { ...faqData, id: editingFaq.id } : f)
      );
    } else {
      // Add new faq
      const newFaq = {
        ...faqData,
        id: Date.now()
      };
      setFaqs(prevFaqs => [...prevFaqs, newFaq]);
    }
    
    setIsAddingFaq(false);
    setEditingFaq(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">FAQs</h1>
          <p className="text-muted-foreground">
            Manage frequently asked questions.
          </p>
        </div>
        <Button className="sm:self-start" onClick={handleAddFaq}>
          <Plus size={16} className="mr-2" /> Add FAQ
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9 pr-4 w-full"
              />
            </div>
          </div>
          
          {filteredFaqs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFaqs.map((faq, index) => (
                <FaqCard 
                  key={faq.id} 
                  faq={faq}
                  index={index}
                  onEdit={handleEditFaq}
                  onDelete={handleDeleteFaq}
                  onMove={handleMoveFaq}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No FAQs found</h3>
              <p className="mt-1 text-muted-foreground">
                {searchTerm 
                  ? "Try adjusting your search term." 
                  : "Get started by adding a new FAQ."}
              </p>
              <Button className="mt-4" onClick={handleAddFaq}>
                <Plus size={16} className="mr-2" /> Add FAQ
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Faqs;
