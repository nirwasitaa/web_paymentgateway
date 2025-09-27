import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Checkout, Payment } from '@/lib/models';

export async function GET(_req, { params }) {
  await dbConnect();
  const checkout = await Checkout.findById(params.id).lean();
  if (!checkout) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const payment = await Payment.findOne({ checkoutId: params.id }).lean();
  return NextResponse.json({
    checkout: {
      id: String(checkout._id),
      status: checkout.status,
      total: checkout.total
    },
    payment: payment ? {
      invoiceId: payment.invoiceId,
      status: payment.status,
      amount: payment.amount
    } : null
  });
}
