export default function Loading() {
  // Hier könnte auch ein animierter Spinner sein. Fürs Erste reicht Text.
  return (
    <div className="flex h-screen items-center justify-center bg-brand-light">
      <p className="text-brand-dark">Wird geladen...</p>
    </div>
  );
}
