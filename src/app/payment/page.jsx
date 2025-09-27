"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { clearCart } from "@/lib/cart";

export default function PaymentPage() {
  const params = useSearchParams();
  const router = useRouter();
  const checkoutId = params.get("checkout"); // didapat dari redirect Xendit: /payment?checkout=...
  const [status, setStatus] = useState("PENDING");
  const [amount, setAmount] = useState(0);
  const [invoiceId, setInvoiceId] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  async function loadStatus() {
    if (!checkoutId) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`/api/checkout/${checkoutId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load checkout");

      setStatus(data?.checkout?.status ?? "PENDING");
      setAmount(Number(data?.checkout?.total || 0));
      setInvoiceId(data?.payment?.invoiceId || "");

      // Jika sudah PAID → hentikan polling & kosongkan cart
      if ((data?.checkout?.status || "").toUpperCase() === "PAID") {
        if (timerRef.current) clearInterval(timerRef.current);
        clearCart();
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!checkoutId) return;
    // muat langsung sekali
    loadStatus();
    // polling tiap 3 detik sampai PAID
    timerRef.current = setInterval(loadStatus, 3000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutId]);

  return (
    <>
      <NavBar />
      <div className="bg-white rounded-xl p-6 shadow">
        <h1 className="text-xl font-semibold mb-4">Payment Status</h1>

        {!checkoutId ? (
          <div className="text-sm text-gray-700">
            Tidak ada <code>checkout</code> pada URL. Halaman ini diakses setelah redirect dari Xendit,
            contoh: <code>/payment?checkout=&lt;CHECKOUT_ID&gt;</code>.
          </div>
        ) : (
          <>
            {err && <div className="text-sm text-red-600 mb-3">{err}</div>}

            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <div className="text-gray-600 text-sm">Checkout ID</div>
                <div className="font-mono text-sm">{checkoutId}</div>
              </div>
              <div
                className={`px-3 py-1 rounded text-white text-sm ${
                  status.toUpperCase() === "PAID" ? "bg-green-600" : "bg-yellow-600"
                }`}
              >
                {status.toUpperCase() === "PAID" ? "LUNAS" : "PENDING"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-3 border rounded">
                <div className="text-xs text-gray-600">Invoice ID</div>
                <div className="font-mono text-sm break-all">{invoiceId || "-"}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-xs text-gray-600">Amount</div>
                <div className="font-semibold">Rp {amount.toLocaleString("id-ID")}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-xs text-gray-600">Status</div>
                <div className="font-semibold">{status.toUpperCase()}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={loadStatus}
                disabled={loading}
                className="px-3 py-2 rounded bg-gray-200"
              >
                {loading ? "Refreshing..." : "Refresh Now"}
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-3 py-2 rounded bg-blue-600 text-white"
              >
                Back to Select Items
              </button>
            </div>

            {status.toUpperCase() === "PAID" && (
              <div className="mt-4 text-sm text-green-700">
                Pembayaran berhasil. Status: <b>LUNAS</b>. Keranjang sudah dikosongkan.
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
