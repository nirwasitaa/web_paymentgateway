import { NextResponse } from 'next/server';
import { users } from '@/lib/store';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'email and password are required' },
        { status: 400 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { message: 'Server misconfigured: JWT_SECRET is missing' },
        { status: 500 }
      );
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name });

    return NextResponse.json({
      message: 'Logged in',
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }
}
