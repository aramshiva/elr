import arcjet, { protectSignup } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    rules: [
        protectSignup({
            email: {
                mode: "LIVE",
                block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
            },
            bots: {
                mode: "LIVE",
                allow: [],
            },
            rateLimit: {
                mode: "LIVE",
                interval: "10m",
                max: 5,
            },
        }),
    ],
});

export async function POST(req: Request) {
    const data = await req.json();
    const email = data.email;

    const decision = await aj.protect(req, {
        email: email,
    });

    console.log("Arcjet decision: ", decision);

    if (decision.isDenied()) {
        if (decision.reason.isEmail()) {
            return NextResponse.json(
                {
                    message: "Invalid email",
                    reason: decision.reason,
                },
                { status: 400 },
            );
        } else {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
    } else {
        return NextResponse.json(
            {
                success: true,
            },
            { status: 200 }
        );
    }
}
