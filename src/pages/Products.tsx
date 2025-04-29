import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Star, Trash2, FileText, Edit, Package, Image, Search } from "lucide-react";
// Importaciones de Firebase
import { database } from "@/firebase"; // Importa la instancia de Realtime Database
import { storage } from "@/firebase"; // Importa la instancia de Firebase Storage

// Métodos de Firebase Realtime Database
import { ref as dbRef, onValue, push, update, remove, ref } from "firebase/database";

// Métodos de Firebase Storage
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/loader";
import { toast } from "sonner";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

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
    }
    catch (error) {
      console.error("Error al cargar los productos:", error);
      toast.error("Error al cargar los productos. Por favor, inténtelo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardar producto (agregar o editar)
  const handleSaveProduct = async (productData) => {
    try {
      setLoading(true);
      if (editingProduct) {
        // Editar producto existente
        const productRef = ref(database, `Product/${editingProduct.IdProduct}`);
        await update(productRef, productData);
      } else {
        // Agregar nuevo producto
        const newProductRef = push(ref(database, "Product"));
        const newProduct = {
          ...productData,
          IdProduct: newProductRef.key,
        };
        await update(newProductRef, newProduct);
      }
      setIsAddingProduct(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      toast.error("Error al guardar el producto. Por favor, inténtelo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Description.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "featured") return matchesSearch && product.IsFeatured;
    return false;
  });

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsAddingProduct(true);
  };

  // Eliminar producto
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
        <Button className="sm:self-start" onClick={() => setIsAddingProduct(true)}>
          <Plus size={16} className="mr-2" /> Agregar producto
        </Button>
      </div>
      {isAddingProduct ? (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setIsAddingProduct(false);
            setEditingProduct(null);
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
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="featured">Destacado</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9 pr-4 w-full"
              />
            </div>
          </div>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.IdProduct}
                product={product}
                onToggleFeatured={handleToggleFeatured}
                onDelete={handleDeleteProduct}
                onEdit={handleEditProduct}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No se encontraron productos</h3>
              <p className="mt-1 text-muted-foreground">
                {" "}
                Comience agregando un nuevo producto.{" "}
              </p>
              <Button className="mt-4" onClick={() => setIsAddingProduct(true)}>
                <Plus size={16} className="mr-2" /> Agregar producto
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ product, onToggleFeatured, onDelete, onEdit }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const categoriesRef = ref(database, "Category");
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-transition"
    >
      <Card className="h-full border overflow-hidden">
        <div className="aspect-video relative bg-muted">
          {product.ImageUrls && product.ImageUrls.length > 0 ? (
            <img
              src={product.ImageUrls[0]}
              alt={product.Name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Image size={40} />
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            {product.IsFeatured && (
              <Badge variant="secondary" className="bg-amber-500 text-white">
                Destacado
              </Badge>
            )}
          </div>
        </div>
        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base line-clamp-1">{product.Name}</CardTitle>
          </div>
          <CardDescription className="flex items-center text-xs">
            <Package size={12} className="mr-1" />
            {categories.find((cat) => cat.IdCategory === product.IdCategory)?.Name || "Sin categoría"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-sm">
            <div className="font-medium">${product.Price.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-muted-foreground">{product.PriceType}</div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {product.Description}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(product)}>
            <Edit size={14} className="mr-1" /> Editar
          </Button>
          <Button
            size="sm"
            variant={product.IsFeatured ? "default" : "outline"}
            className={`flex-1 ${product.IsFeatured ? "bg-amber-500 hover:bg-amber-600" : ""}`}
            onClick={() => onToggleFeatured(product)}
          >
            <Star size={14} className="mr-1" /> {product.IsFeatured ? "Destacado" : "Destacar"}
          </Button>
          <Button size="sm" variant="outline" className="flex-none text-destructive" onClick={() => onDelete(product)}>
            <Trash2 size={14} />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const ProductForm = ({ product, onSave, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const [formData, setFormData] = useState(
    product || {
      Name: "",
      Description: "",
      Price: 0,
      PriceType: "",
      IdCategory: "",
      IsFeatured: false,
      Size: "",
      ImageUrls: [],
    }
  );
  const [imageFiles, setImageFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files: any = Array.from(e.target.files).filter(
      (file: any) => file.type.startsWith("image/")
    );
    const uploadedUrls = [];

    for (const file of files) {
      const uniqueFileName = `${Date.now()}-${product?.Name || "producto"}`;
      const storageReference = storageRef(storage, `products/${uniqueFileName}`);
      await uploadBytes(storageReference, file);
      const downloadUrl = await getDownloadURL(storageReference);
      uploadedUrls.push(downloadUrl);
    }

    // Actualizar estado local con las URLs descargadas
    setFormData((prev) => ({
      ...prev,
      ImageUrls: [...(prev.ImageUrls || []), ...uploadedUrls],
    }));

    return uploadedUrls; // ✅ Devolver las URLs
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fileInput: any = document.getElementById("images");

    setIsUploading(true);

    let finalData = { ...formData };

    if (fileInput && fileInput.files.length > 0) {
      const uploadedUrls = await handleImageUpload({ target: fileInput });
      finalData = {
        ...finalData,
        ImageUrls: [...(finalData.ImageUrls || []), ...uploadedUrls],
      };
    }

    onSave(finalData); // ✅ Ahora sí tiene las URLs actualizadas
    setIsUploading(false);

    if (fileInput) fileInput.value = "";
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
        <h3 className="text-lg font-medium mb-4">{product ? "Editar producto" : "Agregar nuevo producto"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="IdCategory">Categoría</Label>
            {categories && categories.length > 0 ? (
              <select
                id="IdCategory"
                name="IdCategory"
                value={formData.IdCategory}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.IdCategory} value={category.IdCategory}>
                    {category.Name}
                  </option>
                ))}
              </select>
            ) : (
              <p>No hay categorías disponibles.</p>
            )}
          </div>
          <div>
            <Label htmlFor="Name">Nombre</Label>
            <Input
              id="Name"
              name="Name"
              type="text"
              placeholder="Nombre del producto"
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
              placeholder="Descripción del producto"
              value={formData.Description}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="Price">Precio</Label>
            <Input
              id="Price"
              name="Price"
              type="number"
              placeholder="Precio del producto"
              value={formData.Price}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="Size">Tamaño</Label>
            <Input
              id="Size"
              name="Size"
              type="text"
              placeholder="Tamaño del producto"
              value={formData.Size}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="PriceType">Tipo de precio</Label>
            <select
              id="PriceType"
              name="PriceType"
              value={formData.PriceType}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              <option value="">Selecciona un tipo de precio</option>
              <option value="Precio por metro cuadrado (m²)">Precio por metro cuadrado (m²)</option>
              <option value="Precio por unidad">Precio por unidad</option>
              <option value="Precio por rollo">Precio por rollo</option>
              <option value="Precio por lote">Precio por lote</option>
              <option value="Precio por instalación incluida">Precio por instalación incluida</option>
              <option value="Precio por metro lineal">Precio por metro lineal</option>
              <option value="Precio por proyecto">Precio por proyecto</option>
              <option value="Precio al mayor">Precio al mayor</option>
              <option value="Precio promocional">Precio promocional</option>
              <option value="Precio por zona">Precio por zona</option>
              <option value="Precio con transporte incluido">Precio con transporte incluido</option>
              <option value="Precio por acabado">Precio por acabado</option>
              <option value="Precio por resistencia">Precio por resistencia</option>
            </select>
          </div>
          <div>
            <Label htmlFor="images">Imágenes</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  handleImageUpload(e);
                }
              }}
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Guardando..." : "Guardar producto"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default Products;