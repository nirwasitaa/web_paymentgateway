import { NextResponse } from 'next/server';
import { users, nextId } from '@/lib/store';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'name, email, and password are required' },
        { status: 400 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { message: 'Server misconfigured: JWT_SECRET is missing' },
        { status: 500 }
      );
    }

    const exists = users.find(u => u.email === email);
    if (exists) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password); // pakai helper
    const user = {
      id: nextId(),
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    users.push(user);

    const token = signToken({ userId: user.id, email: user.email, name: user.name }); // pakai helper

    return NextResponse.json(
      {
        message: 'Registered',
        user: { id: user.id, name: user.name, email: user.email },
        token,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }
}
