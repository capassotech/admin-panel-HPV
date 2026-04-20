import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { push, ref, update } from "firebase/database";
import { toast } from "sonner";
import CategoryForm from "@/components/categories/CategoryForm";
import { database } from "@/firebase";

const NewCategory = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSave = async (categoryData: {
    Name: string;
    Description: string;
    IsFeatured: boolean;
  }) => {
    try {
      setSaving(true);
      const newCategoryRef = push(ref(database, "Category"));
      const newCategory = {
        ...categoryData,
        IdCategory: newCategoryRef.key,
      };
      await update(newCategoryRef, newCategory);
      toast.success("Categoría creada correctamente.");
      navigate("/categorias");
    } catch (error) {
      console.error("Error al guardar la categoría:", error);
      toast.error("Error al guardar la categoría. Por favor, inténtelo de nuevo más tarde.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agregar categoría</h1>
        <p className="text-muted-foreground">Complete los datos para crear una nueva categoría.</p>
      </div>
      <CategoryForm
        onSave={handleSave}
        onCancel={() => navigate("/categorias")}
        title="Nueva categoría"
        submitLabel={saving ? "Guardando..." : "Guardar categoría"}
      />
    </div>
  );
};

export default NewCategory;
