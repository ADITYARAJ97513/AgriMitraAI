
import { NextResponse } from 'next/server';
import { findUserByUsername, verifyPassword } from '@/lib/user-store';
import { SignJWT } from 'jose';
import { serialize } from 'cookie';

const JWT_ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_TOKEN_SECRET);
const JWT_REFRESH_TOKEN_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_TOKEN_SECRET);
const JWT_ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
const JWT_REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const userPayload = { id: user.id, username: user.username };

    const accessToken = await new SignJWT(userPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_ACCESS_TOKEN_EXPIRES_IN)
        .sign(JWT_ACCESS_TOKEN_SECRET);
        
    const refreshToken = await new SignJWT(userPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_REFRESH_TOKEN_EXPIRES_IN)
        .sign(JWT_REFRESH_TOKEN_SECRET);


    const accessTokenCookie = serialize('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    const refreshTokenCookie = serialize('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    const response = NextResponse.json({ user: userPayload }, { status: 200 });
    response.headers.append('Set-Cookie', accessTokenCookie);
    response.headers.append('Set-Cookie', refreshTokenCookie);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
