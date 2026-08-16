import { Suspense } from "react";
import PaymobReturnClient from "./paymob-return-client";

export default function PaymobReturnPage() {
  return (
    <Suspense fallback={<PaymobReturnFallback />}>
      <PaymobReturnClient />
    </Suspense>
  );
}

function PaymobReturnFallback() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[#5ABBE6]" />
        <p className="mt-4 text-sm text-gray-500">Checking payment status...</p>
      </section>
    </main>
  );
}
