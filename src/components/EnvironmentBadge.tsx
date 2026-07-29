/**
 * Indicador visual de entorno (solo local/QA, nunca en producción).
 * Ayuda a saber a qué backend y a qué base de datos de Firebase está conectado el panel.
 */
const EnvironmentBadge = () => {
  if (import.meta.env.PROD) return null;

  const apiUrl = import.meta.env.VITE_API_URL || "";
  const isLocalBackend = /localhost|127\.0\.0\.1/.test(apiUrl);
  const backendLabel = isLocalBackend ? "Local" : "QA (Render)";

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "desconocida";
  const isQaDb = projectId === "hpv-desarrollo";
  const dbLabel = isQaDb ? `QA (${projectId})` : projectId;

  return (
    <div
      className="fixed top-2 right-2 z-[9999] flex flex-col items-end gap-1 pointer-events-none select-none"
      aria-hidden="true"
    >
      <span className="rounded-full border border-amber-400/60 bg-amber-500 px-2.5 py-1 text-[11px] font-semibold leading-none text-white shadow-lg">
        Backend: {backendLabel}
      </span>
      <span className="rounded-full border border-purple-400/60 bg-purple-600 px-2.5 py-1 text-[11px] font-semibold leading-none text-white shadow-lg">
        BD: {dbLabel}
      </span>
    </div>
  );
};

export default EnvironmentBadge;
