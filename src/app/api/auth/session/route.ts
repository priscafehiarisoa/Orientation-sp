import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        (await cookies()).set('firebase-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600, // 1 heure
            path: '/',
        });

        console.log('Session cookie created successfully');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating session cookie:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        (await cookies()).delete('firebase-token');
        console.log('Session cookie deleted successfully');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting session cookie:', error);
        return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }
}
