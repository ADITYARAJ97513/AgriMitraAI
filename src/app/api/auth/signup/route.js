
import { NextResponse } from 'next/server';
import { createUser, findUserByUsername } from '@/lib/user-store';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password || password.length < 6) {
      return NextResponse.json({ message: 'Username and a password of at least 6 characters are required' }, { status: 400 });
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }

    await createUser({ username, password });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Check for MongoDB duplicate key error, which can happen in a race condition.
    if (error.code === 11000 && error.keyPattern?.username) {
        return NextResponse.json({ message: 'This username is already taken. Please choose another.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
}
