import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { push, ref, update } from "firebase/database";
import { toast } from "sonner";
import ProductForm from "@/components/products/ProductForm";
import PageHeader from "@/components/layouts/PageHeader";
import { database } from "@/firebase";

const NewProduct = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSaveProduct = async (productData: any) => {
    try {
      setSaving(true);
      const newProductRef = push(ref(database, "Product"));
      const newProduct = {
        ...productData,
        IdProduct: newProductRef.key,
      };
      await update(newProductRef, newProduct);
      toast.success("Producto creado correctamente.");
      navigate("/productos");
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      toast.error("Error al guardar el producto. Por favor, inténtelo de nuevo más tarde.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agregar producto"
        description="Complete los datos para crear un nuevo producto."
        backTo="/productos"
        backLabel="Volver a productos"
      />
      <ProductForm
        onSave={handleSaveProduct}
        onCancel={() => navigate("/productos")}
        title="Agregar nuevo producto"
        submitLabel={saving ? "Guardando..." : "Guardar producto"}
      />
    </div>
  );
};

export default NewProduct;
