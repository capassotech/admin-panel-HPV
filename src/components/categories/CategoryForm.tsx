import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export interface CategoryFormValues {
  Name: string;
  Description: string;
  IsFeatured: boolean;
}

export interface CategoryHierarchyRelations {
  ancestors: { id: string; name: string; isSuperCategory: boolean }[];
  children: { id: string; name: string }[];
}

interface CategoryFormProps {
  category?: {
    IdCategory?: string;
    Name?: string;
    Description?: string;
    IsFeatured?: boolean;
    IsSuperCategory?: boolean;
  } | null;
  /** Solo edición: posición en el árbol y subcategorías (solo lectura) */
  hierarchyRelations?: CategoryHierarchyRelations | null;
  onSave: (data: CategoryFormValues) => void | Promise<void>;
  onCancel: () => void;
  title?: string;
  submitLabel?: string;
}

const defaultValues: CategoryFormValues = {
  Name: "",
  Description: "",
  IsFeatured: false,
};

const CategoryForm = ({
  category,
  hierarchyRelations,
  onSave,
  onCancel,
  title,
  submitLabel = "Guardar categoría",
}: CategoryFormProps) => {
  const [formData, setFormData] = useState<CategoryFormValues>(defaultValues);

  useEffect(() => {
    if (!category?.IdCategory) {
      setFormData(defaultValues);
      return;
    }
    setFormData({
      Name: category.Name ?? "",
      Description: category.Description ?? "",
      IsFeatured: !!category.IsFeatured,
    });
    // Solo al elegir categoría (edición); evita pisar el formulario si Firebase reenvía el mismo nodo
  }, [category?.IdCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, IsFeatured: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const heading =
    title ?? (category ? "Editar categoría" : "Agregar nueva categoría");

  const showHierarchy =
    Boolean(category?.IdCategory) &&
    hierarchyRelations != null &&
    (hierarchyRelations.ancestors.length > 0 || hierarchyRelations.children.length > 0);

  const subHeading =
    category?.IsSuperCategory && (hierarchyRelations?.children.length ?? 0) > 0
      ? "Subcategorías de esta supercategoría"
      : "Subcategorías directas";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.995 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-lg border overflow-hidden shadow-sm"
    >
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">{heading}</h3>

        {showHierarchy && hierarchyRelations ? (
          <div className="mb-6 space-y-4 rounded-lg border bg-muted/30 p-4 text-sm">
            {hierarchyRelations.ancestors.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Categorías superiores (de la raíz hasta el padre directo)
                </p>
                <nav aria-label="Jerarquía hacia arriba" className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-muted-foreground">Raíz</span>
                  {hierarchyRelations.ancestors.map((a) => (
                    <span key={a.id} className="flex flex-wrap items-center gap-2">
                      <span className="text-muted-foreground" aria-hidden>
                        /
                      </span>
                      <Link
                        to={`/categorias/${a.id}/editar`}
                        className="font-medium text-primary hover:underline"
                      >
                        {a.name}
                      </Link>
                      {a.isSuperCategory ? (
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          Supercategoría
                        </Badge>
                      ) : null}
                    </span>
                  ))}
                </nav>
              </div>
            ) : hierarchyRelations.children.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Sin categoría superior: esta categoría está en el nivel raíz del catálogo.
              </p>
            ) : null}

            {hierarchyRelations.children.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {subHeading}
                </p>
                <ul className="list-none space-y-1.5 pl-0">
                  {hierarchyRelations.children.map((ch) => (
                    <li key={ch.id}>
                      <Link
                        to={`/categorias/${ch.id}/editar`}
                        className="text-primary hover:underline"
                      >
                        {ch.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {category?.IdCategory &&
        hierarchyRelations &&
        hierarchyRelations.ancestors.length === 0 &&
        hierarchyRelations.children.length === 0 ? (
          <p className="mb-6 rounded-lg border border-dashed bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Esta categoría está en la raíz del catálogo y no tiene subcategorías vinculadas.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category-Name">Nombre</Label>
            <Input
              id="category-Name"
              name="Name"
              type="text"
              placeholder="Nombre de la categoría"
              value={formData.Name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="category-Description">Descripción</Label>
            <Input
              id="category-Description"
              name="Description"
              type="text"
              placeholder="Descripción de la categoría"
              value={formData.Description}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label
              htmlFor="category-IsFeatured"
              className="flex items-center space-x-2 cursor-pointer font-normal"
            >
              <input
                id="category-IsFeatured"
                name="IsFeatured"
                type="checkbox"
                className="rounded border-gray-300 text-primary"
                checked={formData.IsFeatured}
                onChange={handleCheckboxChange}
              />
              <span>Categoría destacada</span>
            </Label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CategoryForm;
