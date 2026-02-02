import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // Vérifier le token dans les cookies
    const token = request.cookies.get('firebase-token');

    const { pathname } = request.nextUrl;

    // Routes publiques (accessibles sans connexion)
    const routesPubliques = [
        '/',
        '/login',
        '/register',
        '/questionnaire',
        '/resultats',
        '/about',
        '/contact'
    ];

    // Vérifier si c'est une route publique
    const estRoutePublique = routesPubliques.some(route => 
        pathname === route || pathname.startsWith(route + '/')
    );

    if (estRoutePublique) {
        // Si connecté et sur /login ou /register, rediriger vers /
        if (token && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Routes protégées (nécessitent une connexion)
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
