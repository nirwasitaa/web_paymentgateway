// src/app/api/items/[id]/route.js
import { NextResponse } from 'next/server';
import { items } from '@/lib/store';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET(_req, { params }) {
  const item = items.find(i => i.id === params.id);
  if (!item) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function PUT(req, { params }) {
  const me = getAuthUserFromRequest(req);
  if (!me) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const idx = items.findIndex(i => i.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }
  if (items[idx].ownerId !== me.userId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const { name, description } = await req.json();
    if (name != null) items[idx].name = name;
    if (description != null) items[idx].description = description;
    items[idx].updatedAt = new Date().toISOString();

    return NextResponse.json({ message: 'Updated', item: items[idx] });
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const me = getAuthUserFromRequest(req);
  if (!me) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const idx = items.findIndex(i => i.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }
  if (items[idx].ownerId !== me.userId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const deleted = items.splice(idx, 1)[0];
  return NextResponse.json({ message: 'Deleted', item: deleted });
}
