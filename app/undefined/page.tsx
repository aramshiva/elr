"use client"
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function Shortner() {

    useEffect(() => {
        redirect("/")
    }, []);

    return null;
}
