
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
import { 
  Plus, Search, Edit, Trash2, Star, Folder,
  FileText, Check, X 
} from "lucide-react";
import { motion } from "framer-motion";

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
                Featured
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            ID: {category.IdCategory}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {category.Description || "No description available"}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(category)}>
            <Edit size={14} className="mr-1" /> Edit
          </Button>
          <Button 
            size="sm" 
            variant={category.IsFeatured ? "default" : "outline"} 
            className={`flex-1 ${category.IsFeatured ? "bg-amber-500 hover:bg-amber-600" : ""}`}
            onClick={() => onToggleFeatured(category)}
          >
            <Star size={14} className="mr-1" /> {category.IsFeatured ? "Featured" : "Feature"}
          </Button>
          <Button size="sm" variant="outline" className="flex-none text-destructive" onClick={() => onDelete(category)}>
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
    IsFeatured: false
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
          {category ? "Edit Category" : "Add New Category"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="Name">Name</Label>
            <Input
              id="Name"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="Description">Description</Label>
            <Input
              id="Description"
              name="Description"
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
                onChange={(e) => setFormData(prev => ({ ...prev, IsFeatured: e.target.checked }))}
              />
              <span>Featured category</span>
            </Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Save Category
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  
  // Mock data
  const mockCategories = [
    {
      IdCategory: "-OF2eKq0Ppqc4DG1lyYm",
      Name: "Pisos LVT",
      Description: "Pisos vinílicos de lujo con aspecto de madera",
      IsFeatured: false
    },
    {
      IdCategory: "-O9tTaqfGlJY97JVwQaa",
      Name: "Pisos Flotantes Melamina",
      Description: " ",
      IsFeatured: false
    }
  ];
  
  const [categories, setCategories] = useState(mockCategories);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (category.Description && category.Description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "featured") return matchesSearch && category.IsFeatured;
    
    return false;
  });
  
  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsAddingCategory(true);
  };
  
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsAddingCategory(true);
  };
  
  const handleDeleteCategory = (category) => {
    if (window.confirm(`Are you sure you want to delete ${category.Name}?`)) {
      setCategories(prevCategories => 
        prevCategories.filter(c => c.IdCategory !== category.IdCategory)
      );
    }
  };
  
  const handleToggleFeatured = (category) => {
    setCategories(prevCategories => 
      prevCategories.map(c => 
        c.IdCategory === category.IdCategory 
          ? { ...c, IsFeatured: !c.IsFeatured } 
          : c
      )
    );
  };
  
  const handleSaveCategory = (categoryData) => {
    if (editingCategory) {
      // Update existing category
      setCategories(prevCategories => 
        prevCategories.map(c => 
          c.IdCategory === editingCategory.IdCategory 
            ? { ...categoryData, IdCategory: editingCategory.IdCategory } 
            : c
        )
      );
    } else {
      // Add new category
      const newCategory = {
        ...categoryData,
        IdCategory: `-C${Date.now()}`
      };
      setCategories(prevCategories => [...prevCategories, newCategory]);
    }
    
    setIsAddingCategory(false);
    setEditingCategory(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories.
          </p>
        </div>
        <Button className="sm:self-start" onClick={handleAddCategory}>
          <Plus size={16} className="mr-2" /> Add Category
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
                <TabsTrigger value="all">All Categories</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9 pr-4 w-full"
              />
            </div>
          </div>
          
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map(category => (
                <CategoryCard 
                  key={category.IdCategory} 
                  category={category}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  onToggleFeatured={handleToggleFeatured}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No categories found</h3>
              <p className="mt-1 text-muted-foreground">
                {searchTerm 
                  ? "Try adjusting your search term." 
                  : "Get started by adding a new category."}
              </p>
              <Button className="mt-4" onClick={handleAddCategory}>
                <Plus size={16} className="mr-2" /> Add Category
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Categories;
