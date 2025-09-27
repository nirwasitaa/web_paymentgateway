// src/app/api/items/route.js
import { NextResponse } from 'next/server';
import { items, nextId } from '@/lib/store';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET() {
  // Public list
  return NextResponse.json({ data: items });
}

export async function POST(req) {
  const me = getAuthUserFromRequest(req);
  if (!me) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ message: 'name is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const item = {
      id: nextId(),
      name,
      description: description || '',
      ownerId: me.userId,
      createdAt: now,
      updatedAt: now
    };
    items.push(item);
    return NextResponse.json({ message: 'Created', item }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }
}
