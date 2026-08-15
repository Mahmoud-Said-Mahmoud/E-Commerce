import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen overflow-y-auto bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}