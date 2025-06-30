
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_TOKEN_SECRET);

export async function GET(request) {
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(accessToken, JWT_ACCESS_TOKEN_SECRET);
    return NextResponse.json({ user: { id: payload.id, username: payload.username } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
  }
}
