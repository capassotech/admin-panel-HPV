import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Star, Trash2, FileText, Image, Search } from "lucide-react";
import { database } from "@/firebase";
import { onValue, update, remove, ref } from "firebase/database";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/loader";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const productsRef = ref(database, "Product");
      onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const productList = Object.keys(data).map((key) => ({
            IdProduct: key,
            ...data[key],
          }));
          setProducts(productList);
        } else {
          setProducts([]);
        }
      });
    } catch (error) {
      console.error("Error al cargar los productos:", error);
      toast.error("Error al cargar los productos. Por favor, inténtelo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const categoriesRef = ref(database, "Category");
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedCategories = Object.keys(data)
          .map((key) => ({ IdCategory: key, ...data[key] }))
          .sort((a, b) => (a.Name || "").localeCompare(b.Name || "", "es", { sensitivity: "base" }));
        setCategories(sortedCategories);
      } else {
        setCategories([]);
      }
    });
  }, []);

  const getDescendantCategoryIds = (categoryId: string): string[] => {
    const children = categories
      .filter((category) => category.ParentCategoryId === categoryId)
      .map((category) => category.IdCategory);

    const descendants = children.flatMap((childId) => getDescendantCategoryIds(childId));
    return [categoryId, ...descendants];
  };

  const categoryFilterOptions = useMemo(
    () =>
      categories.filter(
        (category) =>
          !category.ParentCategoryId || category.IsSuperCategory
      ),
    [categories]
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.Description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const selectedCategoryIds =
      selectedCategory === "all" ? [] : getDescendantCategoryIds(selectedCategory);
    const matchesCategory =
      selectedCategory === "all" || selectedCategoryIds.includes(product.IdCategory);
    if (activeTab === "all") return matchesSearch && matchesCategory;
    if (activeTab === "featured") return matchesSearch && matchesCategory && product.IsFeatured;
    return false;
  });

  const handleEditProduct = (product) => {
    navigate(`/productos/${product.IdProduct}/editar`);
  };

  const handleDeleteProduct = (product) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        setLoading(true);
        const productRef = ref(database, `Product/${product.IdProduct}`);
        remove(productRef);
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        toast.error("Error al eliminar el producto. Por favor, inténtelo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleFeatured = (product) => {
    try {
      setLoading(true);
      const productRef = ref(database, `Product/${product.IdProduct}`);
      update(productRef, { IsFeatured: !product.IsFeatured });
    } catch (error) {
      console.error("Error al cambiar el estado de destacado:", error);
      toast.error("Error al cambiar el estado de destacado. Por favor, inténtelo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">Gestione la información de sus productos.</p>
        </div>
        <Button className="sm:self-start" onClick={() => navigate("/productos/nuevo")}>
          <Plus size={16} className="mr-2" /> Agregar producto
        </Button>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[auto,1fr,220px] md:items-end">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="featured">Destacado</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="space-y-1">
              <Label htmlFor="products-search" className="text-xs text-muted-foreground">
                Buscador general
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="products-search"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-9 pr-4 w-full"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="category-filter" className="text-xs text-muted-foreground">
                Categoría
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categoryFilterOptions.map((category) => (
                    <SelectItem key={category.IdCategory} value={category.IdCategory}>
                      {category.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {filteredProducts.length > 0 ? (
          <div className="border rounded-lg overflow-hidden divide-y">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.IdProduct}
                product={product}
                categories={categories}
                onToggleFeatured={handleToggleFeatured}
                onDelete={handleDeleteProduct}
                onEdit={handleEditProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No se encontraron productos</h3>
            <p className="mt-1 text-muted-foreground">Comience agregando un nuevo producto.</p>
            <Button className="mt-4" onClick={() => navigate("/productos/nuevo")}>
              <Plus size={16} className="mr-2" /> Agregar producto
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductCard = ({ product, categories, onToggleFeatured, onDelete, onEdit }) => {
  const categoryName = categories.find((c) => c.IdCategory === product.IdCategory)?.Name || "Sin categoría";
  const priceFormatted = `$${(product.Price || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 px-3 py-2.5 bg-card hover:bg-muted/40 transition-colors cursor-pointer"
      onClick={() => onEdit(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(product);
        }
      }}
    >
      {/* Imagen */}
      <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-muted border">
        {product.ImageUrls && product.ImageUrls.length > 0 ? (
          <img src={product.ImageUrls[0]} alt={product.Name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Image size={18} />
          </div>
        )}
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium truncate">{product.Name}</p>
          {product.IsFeatured && (
            <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 shrink-0">Destacado</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">{categoryName}</span>
          {product.Description && (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-xs text-muted-foreground truncate hidden sm:block">{product.Description}</span>
            </>
          )}
        </div>
      </div>

      {/* Precio */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-sm font-semibold">{priceFormatted}</p>
        {product.PriceType && (
          <p className="text-xs text-muted-foreground">{product.PriceType}</p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-3 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(product);
          }}
        >
          Editar
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className={`h-8 w-8 ${product.IsFeatured ? "text-amber-500" : "text-muted-foreground"}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFeatured(product);
          }}
          title={product.IsFeatured ? "Quitar destacado" : "Destacar"}
        >
          <Star size={14} className={product.IsFeatured ? "fill-amber-500" : ""} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(product);
          }}
          title="Eliminar"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </motion.div>
  );
};

export default Products;