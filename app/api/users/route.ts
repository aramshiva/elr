import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    
    const { email, key, url } = body || {};

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!key || !url) {
      return NextResponse.json({ error: "Key and URL are required" }, { status: 400 });
    }

    const existingLinks = await redis.get<string>(email) || "";
    
    const newLinks = existingLinks 
      ? `${existingLinks},${key}:${url}`
      : `${key}:${url}`;
    
    await redis.set(email, newLinks);

    const linksArray = newLinks.split(',');

    return NextResponse.json({ 
      email, 
      linksCount: linksArray.length,
      links: linksArray
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const links = await redis.get<string>(email) || "";
    const linksArray = links ? links.split(',') : [];

    return NextResponse.json({
      email,
      linksCount: linksArray.length,
      // links: linksArray
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
