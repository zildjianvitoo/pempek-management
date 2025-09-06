import LoginForm from "@/src/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2">
            <span className="inline-block size-8 rounded-md bg-primary/10" />
            <span className="text-lg font-semibold tracking-tight">Pempek</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Masuk ke akun</h1>
          <p className="mt-1 text-sm text-neutral-600">Silakan gunakan kredensial yang tersedia.</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-xs text-neutral-500">
          Akses dibatasi. Hubungi admin untuk pembuatan akun.
        </p>
      </div>
    </div>
  );
}
