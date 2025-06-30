
import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const JWT_ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_TOKEN_SECRET);
const JWT_REFRESH_TOKEN_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_TOKEN_SECRET);
const JWT_ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';

async function verifyToken(token, secret) {
    try {
        const { payload } = await jwtVerify(token, secret, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    
    // Allow Next.js specific paths
    if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.endsWith('.ico')) {
        return NextResponse.next();
    }
    
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    const isPublicPath = ['/login', '/signup'].includes(pathname);
    const isApiAuthPath = pathname.startsWith('/api/auth');

    // If trying to access a public path
    if (isPublicPath) {
        // If user is already logged in (has a valid refresh token), redirect to home
        if (refreshToken) {
            const decodedRefreshToken = await verifyToken(refreshToken, JWT_REFRESH_TOKEN_SECRET);
            if (decodedRefreshToken) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }
        return NextResponse.next();
    }
    
    // Allow API auth routes to be accessed
    if(isApiAuthPath) {
        return NextResponse.next();
    }

    // From here, we are dealing with protected routes
    let decodedAccessToken = null;
    if (accessToken) {
        decodedAccessToken = await verifyToken(accessToken, JWT_ACCESS_TOKEN_SECRET);
    }
    
    if (decodedAccessToken) {
        // Access token is valid, proceed
        return NextResponse.next();
    }

    // Access token is missing or expired, try to refresh it
    if (refreshToken) {
        const decodedRefreshToken = await verifyToken(refreshToken, JWT_REFRESH_TOKEN_SECRET);
        if (decodedRefreshToken) {
            // Refresh token is valid, issue a new access token
            const userPayload = { id: decodedRefreshToken.id, username: decodedRefreshToken.username };
            
            const newAccessToken = await new SignJWT(userPayload)
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime(JWT_ACCESS_TOKEN_EXPIRES_IN)
                .sign(JWT_ACCESS_TOKEN_SECRET);

            const response = NextResponse.next();
            response.cookies.set({
                name: 'accessToken',
                value: newAccessToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 15, // 15 minutes
                path: '/',
            });
            return response;
        }
    }
    
    // No valid tokens, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname); // Optional: redirect back after login
    return NextResponse.redirect(loginUrl);
}

export const config = {
  // Matcher to run middleware on all paths except for static files, etc.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
