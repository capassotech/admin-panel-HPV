
import { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, Search, Edit, Trash2, Star, Image, Package,
  FileText, Check, X 
} from "lucide-react";
import { motion } from "framer-motion";

const ProductCard = ({ product, onEdit, onDelete, onToggleFeatured }) => {
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
            {product.IdCategory}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-sm">
            <div className="font-medium">${product.Price}</div>
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
  const [formData, setFormData] = useState(product || {
    Name: "",
    Description: "",
    Price: 0,
    PriceType: "Precio por metro cuadrado (m²)",
    IdCategory: "",
    IsFeatured: false,
    Size: "",
    ImageUrls: []
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
          {product ? "Editar producto" : "Agregar nuevo producto"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="Name">Nombre</Label>
              <Input
                id="Name"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="IdCategory">Category ID</Label>
              <Input
                id="IdCategory"
                name="IdCategory"
                value={formData.IdCategory}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="Description">Descripción</Label>
            <Input
              id="Description"
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="Price">Precio</Label>
              <Input
                id="Price"
                name="Price"
                type="number"
                value={formData.Price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="PriceType">Tipo</Label>
              <Input
                id="PriceType"
                name="PriceType"
                value={formData.PriceType}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="Size">Tamaño</Label>
            <Input
              id="Size"
              name="Size"
              value={formData.Size}
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
                onChange={(e) => setFormData(prev => ({ ...prev, IsFeatured: e.target.checked }))}
              />
              <span>Producto destacado</span>
            </Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar producto
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  
  // Mock data
  const mockProducts = [
    {
      IdProduct: "PF194",
      Name: "Piso LVT autoadhesivo",
      Description: "1.5 ML de espesor\nModelo: Roble Canadá\nCaja por: 5 mt2",
      IdCategory: "-OF2eKq0Ppqc4DG1lyYm",
      Price: 13500,
      PriceType: "Precio por metro cuadrado (m²)",
      Size: "1.5 ML de espesor",
      IsFeatured: true,
      Category: {
        IdCategory: "-OF2eKq0Ppqc4DG1lyYm",
        Name: "Pisos LVT",
        IsFeatured: false
      },
      ImageUrls: [
        "https://firebasestorage.googleapis.com/v0/b/home-pisos-vinilicos.appspot.com/o/products%2FPF194%2FPF194-1.jpg?alt=media&token=fc23843d-ff9e-46c9-a2d4-8da4f5fe419a"
      ]
    },
    {
      IdProduct: "PF195",
      Name: "Piso Flotante Melamina",
      Description: "8 mm de espesor\nModelo: Nogal Clásico\nCaja por: 2.4 mt2",
      IdCategory: "-O9tTaqfGlJY97JVwQaa",
      Price: 10800,
      PriceType: "Precio por metro cuadrado (m²)",
      Size: "8 mm de espesor",
      IsFeatured: false,
      Category: {
        IdCategory: "-O9tTaqfGlJY97JVwQaa",
        Name: "Pisos Flotantes Melamina",
        IsFeatured: false
      },
      ImageUrls: []
    }
  ];
  
  const [products, setProducts] = useState(mockProducts);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.Description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "featured") return matchesSearch && product.IsFeatured;
    
    return false;
  });
  
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsAddingProduct(true);
  };
  
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsAddingProduct(true);
  };
  
  const handleDeleteProduct = (product) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${product.Name}?`)) {
      setProducts(prevProducts => 
        prevProducts.filter(p => p.IdProduct !== product.IdProduct)
      );
    }
  };
  
  const handleToggleFeatured = (product) => {
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.IdProduct === product.IdProduct 
          ? { ...p, IsFeatured: !p.IsFeatured } 
          : p
      )
    );
  };
  
  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      // Update existing product
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.IdProduct === editingProduct.IdProduct 
            ? { ...productData, IdProduct: editingProduct.IdProduct } 
            : p
        )
      );
    } else {
      // Add new product
      const newProduct = {
        ...productData,
        IdProduct: `P${Date.now()}`
      };
      setProducts(prevProducts => [...prevProducts, newProduct]);
    }
    
    setIsAddingProduct(false);
    setEditingProduct(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
          Gestione la información de sus productos.
          </p>
        </div>
        <Button className="sm:self-start" onClick={handleAddProduct}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.IdProduct} 
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleFeatured={handleToggleFeatured}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No se encontraron productos</h3>
              <p className="mt-1 text-muted-foreground">
                {searchTerm 
                  ? "Try adjusting your search term." 
                  : "Get started by adding a new product."}
              </p>
              <Button className="mt-4" onClick={handleAddProduct}>
                <Plus size={16} className="mr-2" /> Agregar producto
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;