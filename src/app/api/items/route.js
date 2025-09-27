import { NextResponse } from 'next/server';

// Produk contoh (in-memory)
const ITEMS = [
  { id: 'p1', name: 'E-Wallet Topup 50K', price: 50000 },
  { id: 'p2', name: 'E-Wallet Topup 100K', price: 100000 },
  { id: 'p3', name: 'Pulsa 25K', price: 25000 },
  { id: 'p4', name: 'Pulsa 50K', price: 50000 },
];

export async function GET() {
  return NextResponse.json({ data: ITEMS });
}

// Helper dipakai juga di route lain
export function getItemById(id) {
  return ITEMS.find(i => i.id === id) || null;
}
