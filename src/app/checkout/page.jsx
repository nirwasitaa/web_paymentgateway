"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { readCart, setQty } from "@/lib/cart";

export default function CheckoutPage() {
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState("");
  const [customer, setCustomer] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Muat ringkasan (server hitung ulang total)
  const load = async () => {
    setErr("");
    const cart = readCart();
    if (cart.length === 0) { setSummary({ lines: [], total: 0 }); return; }
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // untuk ringkasan saja, kirim cart tanpa customer
        body: JSON.stringify({ cart }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Checkout failed');
      setSummary(data);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const onQty = async (id, qty) => {
    setQty(id, qty);
    await load();
  };

  // Buat checkout + redirect ke Xendit invoice
  const createCheckout = async (e) => {
    e.preventDefault();
    setErr("");
    setCreating(true);
    try {
      const cart = readCart();
      if (!customer.name || !customer.email) {
        throw new Error("Nama dan email wajib diisi");
      }
      if (!cart.length) throw new Error("Keranjang kosong");

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ini yang dipakai server untuk bikin Invoice Xendit
        body: JSON.stringify({ cart, customer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create checkout');

      // Redirect ke halaman invoice Xendit
      window.location.href = data.invoiceUrl;
    } catch (e) {
      setErr(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="bg-white rounded-xl p-6 shadow">
        <h1 className="text-xl font-semibold mb-4">Checkout</h1>

        {err && <div className="text-sm text-red-600 mb-3">{err}</div>}

        {/* Form customer (dibutuhkan Xendit) */}
        <form onSubmit={createCheckout} className="space-y-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="w-full border rounded p-2"
              placeholder="Nama Lengkap"
              value={customer.name}
              onChange={e => setCustomer({ ...customer, name: e.target.value })}
            />
            <input
              className="w-full border rounded p-2"
              placeholder="Email"
              type="email"
              value={customer.email}
              onChange={e => setCustomer({ ...customer, email: e.target.value })}
            />
          </div>

          {/* Ringkasan cart */}
          {!summary || summary.lines.length === 0 ? (
            <div className="text-gray-500 text-sm">Keranjang kosong. Tambahkan item di halaman Select.</div>
          ) : (
            <>
              <ul className="divide-y mb-4">
                {summary.lines.map(line => {
                  const key = line.productId ?? line.id; // kompatibel dua format
                  return (
                    <li key={key} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium">{line.name}</div>
                        <div className="text-sm text-gray-600">
                          Rp {Number(line.price).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          className="w-20 border rounded p-1 text-right"
                          type="number"
                          min={0}
                          defaultValue={line.qty}
                          onBlur={(e) => onQty(key, e.target.value)}
                          disabled={loading}
                        />
                        <div className="w-28 text-right font-medium">
                          Rp {Number(line.lineTotal).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">Total</div>
                <div className="text-lg font-semibold">
                  Rp {Number(summary.total).toLocaleString('id-ID')}
                </div>
              </div>

              <button
                type="submit"
                disabled={creating || summary.total <= 0}
                className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
              >
                {creating ? "Processing..." : "Proceed to Pay"}
              </button>
            </>
          )}
        </form>
      </div>
    </>
  );
}
