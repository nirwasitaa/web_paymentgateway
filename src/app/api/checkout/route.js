import { NextResponse } from 'next/server';
import { getItemById } from '../items/route';

export async function POST(req) {
  try {
    const { cart } = await req.json(); // cart: [{id, qty}]
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    const lines = [];
    let total = 0;

    for (const row of cart) {
      const item = getItemById(row.id);
      const qty = Number(row.qty) || 0;
      if (!item || qty <= 0) {
        return NextResponse.json({ message: 'Invalid cart line' }, { status: 400 });
      }
      const lineTotal = item.price * qty;
      lines.push({ id: item.id, name: item.name, price: item.price, qty, lineTotal });
      total += lineTotal;
    }

    return NextResponse.json({ lines, total });
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }
}
