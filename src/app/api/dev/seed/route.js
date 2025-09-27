import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Product } from '@/lib/models';

export async function POST() {
  await dbConnect();
  const exist = await Product.countDocuments();
  if (exist) return NextResponse.json({ message: 'Already seeded' });
  await Product.insertMany([
    { name: 'E-Wallet Topup 50K', price: 50000 },
    { name: 'E-Wallet Topup 100K', price: 100000 },
    { name: 'Pulsa 25K', price: 25000 },
    { name: 'Pulsa 50K', price: 50000 },
  ]);
  return NextResponse.json({ message: 'Seeded' });
}
