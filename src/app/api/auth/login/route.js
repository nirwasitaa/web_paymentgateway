import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let users = []; // sama dengan register

export async function POST(req) {
  const { email, password } = await req.json();
  const user = users.find(u => u.email === email);
  if (!user) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return NextResponse.json({ message: 'Logged in', user: { id: user.id, name: user.name, email }, token });
}
