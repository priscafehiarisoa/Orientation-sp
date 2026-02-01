import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // Vérifier le token dans les cookies
    const token = request.cookies.get('firebase-token');

    const { pathname } = request.nextUrl;

    // Routes publiques
    if (pathname.startsWith('/login') || 
        pathname.startsWith('/register')) {
        if (token) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Routes protégées
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
