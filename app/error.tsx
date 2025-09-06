"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Terjadi kesalahan</h1>
          <p className="text-sm text-neutral-600">
            {error.message || "Maaf, sesuatu tidak berjalan semestinya."}
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
