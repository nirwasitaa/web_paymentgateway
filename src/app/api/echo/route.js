import { NextResponse } from 'next/server';

export async function POST(req) {
  console.log('HIT /api/echo');
  const raw = await req.text().catch(() => null);
  return NextResponse.json({ ok: true, raw }, { status: 200 });
}
