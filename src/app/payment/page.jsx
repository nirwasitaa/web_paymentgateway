"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { readCart, clearCart } from "@/lib/cart";

export default function PaymentPage() {
  const [customer, setCustomer] = useState({ name: "", email: "" });
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Ambil total dari /api/checkout biar valid server-side
  useEffect(() => {
    const load = async () => {
      const cart = readCart();
      if (cart.length === 0) return setTotal(0);
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart }),
      });
      const data = await res.json();
      if (res.ok) setTotal(data.total || 0);
    };
    load();
  }, []);

  const pay = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      const cart = readCart();
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customer })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment failed');
      setMsg(`Payment Success! ID: ${data.paymentId} | Amount: Rp ${data.amount.toLocaleString('id-ID')}`);
      clearCart();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <>
      <NavBar />
      <div className="bg-white rounded-xl p-6 shadow">
        <h1 className="text-xl font-semibold mb-4">Payment</h1>

        <div className="mb-4 text-gray-700">Amount to pay: <b>Rp {total.toLocaleString('id-ID')}</b></div>

        <form onSubmit={pay} className="space-y-3 max-w-md">
          <input className="w-full border rounded p-2" placeholder="Full Name"
            value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
          <input className="w-full border rounded p-2" placeholder="Email"
            value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})}/>
          {/* Dummy card fields (tidak dipakai server) */}
          <input className="w-full border rounded p-2" placeholder="Card Number (dummy)" />
          <div className="flex gap-2">
            <input className="w-full border rounded p-2" placeholder="MM/YY (dummy)" />
            <input className="w-full border rounded p-2" placeholder="CVC (dummy)" />
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}
          {msg && <div className="text-sm text-green-700">{msg}</div>}

          <button className="px-4 py-2 rounded bg-green-600 text-white">Pay Now</button>
        </form>
      </div>
    </>
  );
}
