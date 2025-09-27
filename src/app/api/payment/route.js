import { NextResponse } from 'next/server';
import { getItemById } from '../items/route';

// Simulasi gateway: validasi payload, kembalikan paymentId + status
export async function POST(req) {
  try {
    const { cart, customer } = await req.json();
    if (!customer || !customer.name || !customer.email) {
      return NextResponse.json({ message: 'Customer info required' }, { status: 400 });
    }
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    // hitung ulang total server-side
    let total = 0;
    for (const row of cart) {
      const item = getItemById(row.id);
      const qty = Number(row.qty) || 0;
      if (!item || qty <= 0) {
        return NextResponse.json({ message: 'Invalid cart line' }, { status: 400 });
      }
      total += item.price * qty;
    }

    // simulasi proses pembayaran (selalu sukses)
    const paymentId = 'pay_' + Math.random().toString(36).slice(2, 10);
    const now = new Date().toISOString();

    return NextResponse.json({
      status: 'success',
      paymentId,
      paidAt: now,
      amount: total,
      customer: { name: customer.name, email: customer.email }
    }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }
}
