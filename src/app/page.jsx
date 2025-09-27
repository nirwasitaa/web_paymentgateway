"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { addToCart, readCart } from "@/lib/cart";

export default function SelectItemsPage() {
  const [items, setItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetch('/api/items').then(r => r.json()).then(j => setItems(j.data || []));
    setCartCount(readCart().reduce((a,b)=>a+b.qty,0));
  }, []);

  const onAdd = (id) => {
    addToCart(id);
    setCartCount(readCart().reduce((a,b)=>a+b.qty,0));
  };

  return (
    <>
      <NavBar />
      <div className="bg-white rounded-xl p-6 shadow">
        <h1 className="text-xl font-semibold mb-4">Select Items</h1>
        <div className="mb-3 text-sm text-gray-600">Cart: {cartCount} item(s)</div>
        <ul className="space-y-3">
          {items.map(it => (
            <li key={it.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-gray-600">Rp {it.price.toLocaleString('id-ID')}</div>
              </div>
              <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => onAdd(it.id)}>
                + Add
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
