import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, onValue, update } from "firebase/database";
import { toast } from "sonner";
import { database } from "@/firebase";
import Loader from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import ProductForm from "@/components/products/ProductForm";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const productRef = ref(database, `Product/${productId}`);
    const unsubscribe = onValue(
      productRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === "object") {
          setProduct({
            IdProduct: productId,
            ...data,
          });
        } else {
          setProduct(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar el producto:", error);
        toast.error("Error al cargar el producto.");
        setProduct(null);
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [productId]);

  const handleSaveProduct = async (productData: any) => {
    if (!productId) return;

    try {
      setLoading(true);
      const productRef = ref(database, `Product/${productId}`);
      await update(productRef, productData);
      toast.success("Producto actualizado correctamente.");
      navigate("/productos");
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      toast.error("Error al guardar el producto. Por favor, inténtelo de nuevo más tarde.");
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Editar producto</h1>
        <p className="text-muted-foreground">No se encontró el producto solicitado.</p>
        <Button variant="outline" onClick={() => navigate("/productos")}>
          Volver a productos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar producto</h1>
        <p className="text-muted-foreground">Actualiza la información del producto seleccionado.</p>
      </div>
      <ProductForm
        key={productId}
        product={product}
        onSave={handleSaveProduct}
        onCancel={() => navigate("/productos")}
        submitLabel="Guardar cambios"
      />
    </div>
  );
};

export default EditProduct;
