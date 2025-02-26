"use client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

export default function Page() {
  const { data: session } = useSession();
  const [randomString, setRandomString] = useState(() =>
    Math.random().toString(36).substring(2, 7)
  );
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [shortened, setShortened] = useState(false);
  const [url, setUrl] = useState("");

  const generateRandomString = () => Math.random().toString(36).substring(2, 7);

  const handleRandomize = () => {
    setIsAnimating(true);
    const finalString = generateRandomString();
    const stringLength = 5;

    for (let i = 0; i < stringLength; i++) {
      setTimeout(() => {
        setRandomString((prev) => {
          const chars = prev.split("");
          chars[i] = finalString[i];
          return chars.join("");
        });

        if (i === stringLength - 1) {
          setIsAnimating(false);
        }
      }, i * 50);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const key = session?.user ? inputValue : randomString;
    const email = session?.user?.email;

    if (!url.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    fetch("/api/form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        key: key,
        email: email || "anonymous",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          toast.error(
            "You have been rate limited. Please try again at a later time."
          );
        }
        return response.json();
      })
      .then((data) => {
        if (session?.user) {
          return fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
            }),
          }).then((response) => {
            if (!response.ok) {
              toast.error(
                "An error occured with our telemetry system. Please try again later."
              );
            }
            return response.json();
          });
        }
        return Promise.resolve();
      })
      .then(() => {
        return fetch(`/api/link?key=${key}&link=${url}`, {
          method: "POST",
        });
      })
      .then((response) => {
        if (!response.ok) {
          toast.error(
            "An error occured in the link shortening process. Please try again later."
          );
        }
        return response.json();
      })
      .then(() => {
        setUrl("");
        setInputValue("");
        setShortened(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Failed to create short URL: " + error.message);
      });
  };

  return (
    <>
      <div className="text-center min-h-screen flex items-center justify-center font-mono">
        <Card className="w-96">
          <CardContent>
            {!shortened && (
              <>
                <p className="text-xl pt-5 pb-1 font-semibold">elr</p>
                <p className="text-xs text-gray-500 mb-4 pb-3">
                  A minimal URL shortener service. Enter your destination URL
                  and get a shortened link.
                </p>
                <form onSubmit={handleSubmit}>
                  <div>
                    <div className="flex items-center justify-center gap-2 pb-4">
                      <p>Link: </p>
                      <Input
                        key="link"
                        type="url"
                        className="w-[14rem]"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <p>elr.sh/</p>
                      {!session?.user ? (
                        <Input
                          className="w-[10rem]"
                          key="backend"
                          disabled
                          value={randomString}
                        />
                      ) : (
                        <Input
                          className="w-[10rem]"
                          key="backend"
                          placeholder="rickroll"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-5">
                    {!session?.user ? (
                      <>
                        <Button
                          className="w-full bg-gray-800"
                          onClick={handleRandomize}
                          disabled={isAnimating}
                          type="button"
                        >
                          Randomize
                        </Button>
                        <Button
                          onClick={() => signIn("github", { redirectTo: "/" })}
                          type="button"
                        >
                          Sign In
                        </Button>
                      </>
                    ) : null}
                    <Button type="submit" className="w-full">
                      Shorten
                    </Button>
                  </div>
                </form>
              </>
            )}
            {shortened && (
              <>
                <div className="pb-3">
                  <p className="text-green-700 text-sm pt-3">
                    Shortened link created!
                  </p>
                  <p>yay!</p>
                </div>
              </>
            )}
            <div className="pt-4">
              <Link className="underline text-green-700 text-xs" href="/policy">
                Data Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
