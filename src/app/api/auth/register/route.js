import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let users = []; // in-memory

export async function POST(req) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ message: 'Incomplete data' }, { status: 400 });
  }

  if (users.find(u => u.email === email)) {
    return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), name, email, passwordHash };
  users.push(user);

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return NextResponse.json({ message: 'Registered', user: { id: user.id, name, email }, token });
}
