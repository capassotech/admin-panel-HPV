import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, onValue, update } from "firebase/database";
import { toast } from "sonner";
import { database } from "@/firebase";
import Loader from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import CategoryForm from "@/components/categories/CategoryForm";

type CategoryRow = {
  IdCategory: string;
  Name?: string;
  ParentCategoryId?: string;
  IsSuperCategory?: boolean;
};

const EditCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Record<string, unknown> | null>(null);
  const [allCategories, setAllCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const categoriesRef = ref(database, "Category");
    const unsubAll = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === "object") {
        setAllCategories(
          Object.keys(data).map((key) => ({
            IdCategory: key,
            ...data[key],
          }))
        );
      } else {
        setAllCategories([]);
      }
    });
    return () => {
      if (typeof unsubAll === "function") unsubAll();
    };
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    const categoryRef = ref(database, `Category/${categoryId}`);
    const unsubscribe = onValue(
      categoryRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === "object") {
          setCategory({
            IdCategory: categoryId,
            ...data,
          });
        } else {
          setCategory(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar la categoría:", error);
        toast.error("Error al cargar la categoría.");
        setCategory(null);
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [categoryId]);

  const hierarchyRelations = useMemo(() => {
    if (!categoryId || !category?.IdCategory) return null;
    const byId = new Map(allCategories.map((c) => [c.IdCategory, c]));

    const ancestors: { id: string; name: string; isSuperCategory: boolean }[] = [];
    const seen = new Set<string>();
    let parentId = category.ParentCategoryId as string | undefined;
    while (parentId) {
      if (seen.has(parentId)) break;
      seen.add(parentId);
      const p = byId.get(parentId);
      if (!p) break;
      ancestors.unshift({
        id: p.IdCategory,
        name: p.Name || "(sin nombre)",
        isSuperCategory: !!p.IsSuperCategory,
      });
      parentId = p.ParentCategoryId;
    }

    const children = allCategories
      .filter((c) => c.ParentCategoryId === categoryId)
      .map((c) => ({ id: c.IdCategory, name: c.Name || "(sin nombre)" }))
      .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));

    return { ancestors, children };
  }, [allCategories, category, categoryId]);

  const handleSave = async (categoryData: {
    Name: string;
    Description: string;
    IsFeatured: boolean;
  }) => {
    if (!categoryId) return;

    try {
      setLoading(true);
      const categoryRef = ref(database, `Category/${categoryId}`);
      await update(categoryRef, categoryData);
      toast.success("Categoría actualizada correctamente.");
      navigate("/categorias");
    } catch (error) {
      console.error("Error al guardar la categoría:", error);
      toast.error("Error al guardar la categoría. Por favor, inténtelo de nuevo más tarde.");
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (!category) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Editar categoría</h1>
        <p className="text-muted-foreground">No se encontró la categoría solicitada.</p>
        <Button variant="outline" onClick={() => navigate("/categorias")}>
          Volver a categorías
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar categoría</h1>
        <p className="text-muted-foreground">Actualiza la información de la categoría seleccionada.</p>
      </div>
      <CategoryForm
        category={category}
        hierarchyRelations={hierarchyRelations}
        onSave={handleSave}
        onCancel={() => navigate("/categorias")}
        submitLabel="Guardar cambios"
      />
    </div>
  );
};

export default EditCategory;
