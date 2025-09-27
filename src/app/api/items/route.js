import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Product } from '@/lib/models';

export async function GET() {
  await dbConnect();
  const items = await Product.find().lean(); // ambil dari MongoDB
  return NextResponse.json({ data: items });
}
