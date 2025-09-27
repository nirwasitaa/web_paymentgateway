"use client";
import { useRouter } from "next/navigation";
export default function NavBar() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="font-semibold">💳 Mini Payment</div>
      <div className="space-x-2">
        <button className="px-3 py-1 rounded bg-gray-200" onClick={() => router.push('/')}>Select</button>
        <button className="px-3 py-1 rounded bg-gray-200" onClick={() => router.push('/checkout')}>Checkout</button>
        <button className="px-3 py-1 rounded bg-gray-200" onClick={() => router.push('/payment')}>Payment</button>
      </div>
    </div>
  );
}
