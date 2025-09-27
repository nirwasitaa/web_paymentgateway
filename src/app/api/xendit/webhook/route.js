import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Checkout, Payment } from '@/lib/models';

export async function POST(req) {
  // 1) Verifikasi callback token
  const token = req.headers.get('x-callback-token');
  if (!token || token !== process.env.XENDIT_CALLBACK_TOKEN) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const bodyText = await req.text();
  let body;
  try { body = JSON.parse(bodyText || '{}'); }
  catch { return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 }); }

  // Contoh payload invoice Xendit: { id, status, external_id, ... }
  const { id: invoiceId, status, external_id } = body || {};
  if (!invoiceId || !external_id) {
    return NextResponse.json({ message: 'Missing invoice data' }, { status: 400 });
  }

  // external_id = 'chk_<checkoutId>'
  const checkoutId = external_id.replace(/^chk_/, '');

  try {
    await dbConnect();

    const payment = await Payment.findOne({ invoiceId });
    if (!payment) {
      // Jika tidak ketemu, buat baru sebagai fallback (idempotensi longgar)
      await Payment.create({
        checkoutId,
        provider: 'xendit',
        invoiceId,
        amount: body.amount,
        status: (status || '').toUpperCase(),
        raw: body
      });
    } else {
      payment.status = (status || '').toUpperCase();
      payment.raw = body;
      await payment.save();
    }

    // Jika paid → update checkout jadi PAID (LUNAS)
    if ((status || '').toUpperCase() === 'PAID') {
      await Checkout.findByIdAndUpdate(checkoutId, { status: 'PAID' });
    }

    // Xendit butuh 2xx cepat
    return NextResponse.json({ ok: true });
  } catch (e) {
    // tetap 200 agar Xendit tak spam retry berlebihan, tapi log error di server kamu
    console.error('Webhook error', e);
    return NextResponse.json({ ok: false });
  }
}
