import { Header } from "@/components/Header";
import { ListCouponForm } from "@/components/ListCouponForm";

export default function ListCouponPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            List a Coupon
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your coupon and set your price. Get paid in USDC when someone buys it.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 md:p-8">
          <ListCouponForm />
        </div>
      </main>
    </div>
  );
}
