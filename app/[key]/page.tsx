"use client"
import { useEffect } from 'react';
import { redirect, useParams } from 'next/navigation';

export default function Shortner() {
    const params = useParams<{ key: string }>();

    useEffect(() => {
        const fetchUrl = async () => {
            const url = await fetch(`/api/link?key=${params.key}`)
                .then((res) => res.json());
            console.log(url);
            redirect(url.url);
        };

        fetchUrl();
    }, []);

    return null;
}
