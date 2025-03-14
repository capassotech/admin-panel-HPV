
import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus, Edit, Trash2, Share2, Facebook,
  Instagram, Twitter, Youtube, Linkedin,
  Globe, FileText
} from "lucide-react";
import { motion } from "framer-motion";

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  website: Globe,
  default: Share2
};

const SocialCard = ({ social, onEdit, onDelete }) => {
  const Icon = socialIcons[social.type] || socialIcons.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-transition"
    >
      <Card className="h-full border overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex items-start gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Icon size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{social.name}</CardTitle>
              <CardDescription className="text-xs">
                {social.url}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="p-4 pt-0 flex justify-between gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(social)}>
            <Edit size={14} className="mr-1" /> Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-none text-destructive"
            onClick={() => onDelete(social)}
          >
            <Trash2 size={14} />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const SocialForm = ({ social, onSave, onCancel }) => {
  const [formData, setFormData] = useState(social || {
    id: null,
    name: "",
    url: "",
    type: "default"
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
          {social ? "Editar red social" : "Agregar nueva red social"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej. Facebook"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="youtube">YouTube</option>
                <option value="linkedin">LinkedIn</option>
                <option value="website">Sitio web</option>
                <option value="default">Otra</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              name="url"
              placeholder="https://..."
              value={formData.url}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const SocialNetworks = () => {
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [editingSocial, setEditingSocial] = useState(null);

  // Mock data
  const mockSocials = [
    {
      id: 1,
      name: "Facebook",
      url: "https://facebook.com/company",
      type: "facebook"
    },
    {
      id: 2,
      name: "Instagram",
      url: "https://instagram.com/company",
      type: "instagram"
    },
    {
      id: 3,
      name: "Website",
      url: "https://company.com",
      type: "website"
    }
  ];

  const [socials, setSocials] = useState(mockSocials);

  const handleAddSocial = () => {
    setEditingSocial(null);
    setIsAddingSocial(true);
  };

  const handleEditSocial = (social) => {
    setEditingSocial(social);
    setIsAddingSocial(true);
  };

  const handleDeleteSocial = (social) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${social.name}?`)) {
      setSocials(prevSocials => prevSocials.filter(s => s.id !== social.id));
    }
  };

  const handleSaveSocial = (socialData) => {
    if (editingSocial) {
      // Update existing social
      setSocials(prevSocials =>
        prevSocials.map(s => s.id === editingSocial.id ? { ...socialData, id: editingSocial.id } : s)
      );
    } else {
      // Add new social
      const newSocial = {
        ...socialData,
        id: Date.now()
      };
      setSocials(prevSocials => [...prevSocials, newSocial]);
    }

    setIsAddingSocial(false);
    setEditingSocial(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Redes sociales</h1>
          <p className="text-muted-foreground">
            Administre tus enlaces de redes sociales y tu sitio web.
          </p>
        </div>
        <Button className="sm:self-start" onClick={handleAddSocial}>
          <Plus size={16} className="mr-2" /> Agregar
        </Button>
      </div>

      {isAddingSocial ? (
        <SocialForm
          social={editingSocial}
          onSave={handleSaveSocial}
          onCancel={() => {
            setIsAddingSocial(false);
            setEditingSocial(null);
          }}
        />
      ) : (
        <div className="space-y-4">
          {socials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {socials.map(social => (
                <SocialCard
                  key={social.id}
                  social={social}
                  onEdit={handleEditSocial}
                  onDelete={handleDeleteSocial}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Share2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No se encontraron enlaces sociales</h3>
              <p className="mt-1 text-muted-foreground">
              Comience agregando una nueva red social.
              </p>
              <Button className="mt-4" onClick={handleAddSocial}>
                <Plus size={16} className="mr-2" /> Agregar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialNetworks;