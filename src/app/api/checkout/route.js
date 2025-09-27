import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Product, Checkout, Payment } from '@/lib/models';

export async function POST(req) {
  try {
    const { cart, customer } = await req.json(); // cart: [{id(_id), qty}], customer: {name,email}
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }
    if (!customer?.name || !customer?.email) {
      return NextResponse.json({ message: 'Customer info required' }, { status: 400 });
    }

    await dbConnect();

    // Validasi & hitung total berdasarkan DB (bukan dari client)
    const ids = cart.map(c => c.id);
    const products = await Product.find({ _id: { $in: ids } }).lean();

    const lines = [];
    let total = 0;

    for (const row of cart) {
      const prod = products.find(p => String(p._id) === row.id);
      const qty = Number(row.qty) || 0;
      if (!prod || qty <= 0) {
        return NextResponse.json({ message: 'Invalid cart line' }, { status: 400 });
      }
      const lineTotal = prod.price * qty;
      lines.push({
        productId: prod._id,
        name: prod.name,
        price: prod.price,
        qty,
        lineTotal
      });
      total += lineTotal;
    }

    // Buat Checkout (PENDING)
    const checkout = await Checkout.create({
      items: lines, total,
      customer: { name: customer.name, email: customer.email },
      status: 'PENDING'
    });

    // Panggil Xendit Create Invoice
    const secret = process.env.XENDIT_SECRET_KEY;
    const baseURL = process.env.BASE_URL;
    if (!secret || !baseURL) {
      return NextResponse.json({ message: 'Server misconfigured: Xendit env missing' }, { status: 500 });
    }

    const payload = {
      external_id: `chk_${checkout._id}`,
      amount: total,
      payer_email: customer.email,
      description: `Checkout ${checkout._id}`,
      success_redirect_url: `${baseURL}/payment?checkout=${checkout._id}`,
      failure_redirect_url: `${baseURL}/payment?checkout=${checkout._id}`,
      currency: 'IDR'
    };

    const invRes = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${secret}:`).toString('base64')
      },
      body: JSON.stringify(payload)
    });
    const invoice = await invRes.json();
    if (!invRes.ok) {
      return NextResponse.json({ message: invoice?.message || 'Xendit error' }, { status: 502 });
    }

    // Simpan Payment (PENDING)
    await Payment.create({
      checkoutId: checkout._id,
      provider: 'xendit',
      invoiceId: invoice.id,
      amount: invoice.amount,
      status: invoice.status?.toUpperCase() === 'PAID' ? 'PAID' : 'PENDING',
      raw: invoice
    });

    return NextResponse.json({
      checkoutId: String(checkout._id),
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url
    }, { status: 201 });

  } catch (e) {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }
}
