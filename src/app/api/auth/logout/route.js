
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const accessTokenCookie = serialize('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1,
    path: '/',
  });

  const refreshTokenCookie = serialize('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1,
    path: '/',
  });

  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  response.headers.append('Set-Cookie', accessTokenCookie);
  response.headers.append('Set-Cookie', refreshTokenCookie);

  return response;
}
