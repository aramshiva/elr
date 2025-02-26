import { NextRequest, NextResponse } from 'next/server';
import Redis from "ioredis"

if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is not defined');
}
const client = new Redis(process.env.REDIS_URL);

export async function GET(request: NextRequest) {
    try {
        const searchParams = new URL(request.url).searchParams;
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json(
                { error: 'No key given! Passing a key is required.' },
                { status: 400 }
            );
        }

        const url = await client.get(key);
        
        if (!url) {
            return NextResponse.json(
                { error: 'No URL was found for this key :(' },
                { status: 404 }
            );
        }

        return NextResponse.json({ url });
    } catch (error) {
        return NextResponse.json(
            { error: `Internal Server Error ${error}` },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const searchParams = new URL(request.url).searchParams;
        const key = searchParams.get('key');
        const url = searchParams.get('link');
        const expiration = searchParams.get('expiration');

        if (!key || !url) {
            return NextResponse.json(
                { error: 'Both key and URL are required!' },
                { status: 400 }
            );
        }

        if (expiration && expiration !== 'never') {
            await client.set(key, url, 'EX', parseInt(expiration));
        } else {
            await client.set(key, url);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: `Internal Server Error ${error}` },
            { status: 500 }
        );
    }
}