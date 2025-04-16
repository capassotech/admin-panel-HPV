import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Star, Trash2, FileText, Edit, Search } from "lucide-react";
import { database } from "@/firebase";
import { ref as dbRef, onValue, push, update, remove } from "firebase/database";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar categorías desde Firebase
  useEffect(() => {
    const categoriesRef = dbRef(database, "Category");
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoryList = Object.keys(data).map((key) => ({
          IdCategory: key,
          ...data[key],
        }));
        setCategories(categoryList);
      } else {
        setCategories([]);
      }
    });
  }, []);

  // Guardar categoría (agregar o editar)
  const handleSaveCategory = async (categoryData) => {
    if (editingCategory) {
      // Editar categoría existente
      const categoryRef = dbRef(database, `Category/${editingCategory.IdCategory}`);
      await update(categoryRef, categoryData);
    } else {
      // Agregar nueva categoría
      const newCategoryRef = push(dbRef(database, "Category"));
      const newCategory = {
        ...categoryData,
        IdCategory: newCategoryRef.key,
      };
      await update(newCategoryRef, newCategory);
    }
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  // Eliminar categoría
  const handleDeleteCategory = (category) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${category.Name}?`)) {
      const categoryRef = dbRef(database, `Category/${category.IdCategory}`);
      remove(categoryRef);
    }
  };

  // Alternar estado destacado
  const handleToggleFeatured = (category) => {
    const categoryRef = dbRef(database, `Category/${category.IdCategory}`);
    update(categoryRef, { IsFeatured: !category.IsFeatured });
  };

  // Filtrar categorías
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.Description && category.Description.toLowerCase().includes(searchTerm.toLowerCase()));
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "featured") return matchesSearch && category.IsFeatured;
    return false;
  });

  const handleEditCategory = (category) => {
    setEditingCategory(category); // Establece la categoría que se está editando
    setIsAddingCategory(true);    // Activa el formulario de edición/agregado
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground">Gestione sus categorías de productos.</p>
        </div>
        <Button className="sm:self-start" onClick={() => setIsAddingCategory(true)}>
          <Plus size={16} className="mr-2" /> Agregar categoría
        </Button>
      </div>
      {isAddingCategory ? (
        <CategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={() => {
            setIsAddingCategory(false);
            setEditingCategory(null);
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full sm:w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="featured">Destacadas</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 w-full"
              />
            </div>
          </div>
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.IdCategory}
                  category={category}
                  onEdit={() => handleEditCategory(category)}
                  onDelete={handleDeleteCategory}
                  onToggleFeatured={handleToggleFeatured}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No se encontraron categorías</h3>
              <p className="mt-1 text-muted-foreground">
                {searchTerm
                  ? "Intenta ajustar tu término de búsqueda."
                  : "Comienza agregando una nueva categoría."}
              </p>
              <Button className="mt-4" onClick={() => setIsAddingCategory(true)}>
                <Plus size={16} className="mr-2" /> Agregar categoría
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CategoryCard = ({ category, onEdit, onDelete, onToggleFeatured }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-transition"
    >
      <Card className="h-full border overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base line-clamp-1">{category.Name}</CardTitle>
            {category.IsFeatured && (
              <Badge variant="secondary" className="bg-amber-500 text-white">
                Destacada
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            {category.Description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="p-4 pt-0 flex justify-between gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(category)}>
            <Edit size={14} className="mr-1" /> Editar
          </Button>
          <Button
            size="sm"
            variant={category.IsFeatured ? "default" : "outline"}
            className={`flex-1 ${category.IsFeatured ? "bg-amber-500 hover:bg-amber-600" : ""}`}
            onClick={() => onToggleFeatured(category)}
          >
            <Star size={14} className="mr-1" /> {category.IsFeatured ? "Destacada" : "Destacar"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-none text-destructive"
            onClick={() => onDelete(category)}
          >
            <Trash2 size={14} />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const CategoryForm = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState(category || {
    Name: "",
    Description: "",
    IsFeatured: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({ ...prev, IsFeatured: e.target.checked }));
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
          {category ? "Editar categoría" : "Agregar nueva categoría"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="Name">Nombre</Label>
            <Input
              id="Name"
              name="Name"
              type="text"
              placeholder="Nombre de la categoría"
              value={formData.Name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="Description">Descripción</Label>
            <Input
              id="Description"
              name="Description"
              type="text"
              placeholder="Descripción de la categoría"
              value={formData.Description}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="IsFeatured" className="flex items-center space-x-2 cursor-pointer">
              <input
                id="IsFeatured"
                name="IsFeatured"
                type="checkbox"
                className="rounded border-gray-300 text-primary"
                checked={formData.IsFeatured}
                onChange={handleCheckboxChange}
              />
              <span>Categoría destacada</span>
            </Label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">Guardar categoría</Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default Categories;