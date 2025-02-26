"use client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();
  const [randomString, setRandomString] = useState(() =>
    Math.random().toString(36).substring(2, 7)
  );
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
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
      alert("Please enter a valid URL");
      return;
    }

    if (session?.user) {
      fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Failed to create short URL");
        });
    }
    fetch(`/api/link?key=${key}&link=${url}`, {
      method: "POST",
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    });
    setUrl("");
    setInputValue("");
    setRandomString(generateRandomString());
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center font-mono">
        <Card className="w-96">
          <CardContent>
            <p className="text-xl pt-5 pb-1 text-center font-semibold">elr</p>
            <p className="text-xs text-gray-500 text-center mb-4 pb-3">
              A minimal URL shortener service. Enter your destination URL and
              get a shortened link.
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
