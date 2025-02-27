"use client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const { data: session } = useSession();
  const [randomString, setRandomString] = useState(() =>
    Math.random().toString(36).substring(2, 7)
  );
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [shortened, setShortened] = useState(false);
  const [url, setUrl] = useState("");
  const [lastKey, setLastKey] = useState("");
  const [expirationDate, setExpirationDate] = useState(() => {
    return session?.user ? "never" : "3600";
  });
  const [isInputValid, setIsInputValid] = useState(true);
  const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });

  const generateRandomString = () => Math.random().toString(36).substring(2, 7);

  useEffect(() => {
    if (session?.user) {
      const isValid = /^[a-zA-Z0-9]*$/.test(inputValue);
      setIsInputValid(isValid);
    }
  }, [inputValue, session?.user]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const key = session?.user ? inputValue : randomString;
    const email = session?.user?.email;

    if (!url.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    if (session?.user && !isInputValid) {
      toast.error("Custom link can only contain letters and numbers");
      return;
    }

    if (matcher.hasMatch(key)) {
      toast.error("Please use appropriate terminology for your URL");
      return;
    }

    if (session?.user && inputValue) {
      try {
        const checkResponse = await fetch(`/api/link?key=${key}`);
        if (checkResponse.ok) {
          toast.error(
            "This custom link is already taken. Please choose another one."
          );
          return;
        }
      } catch (error) {
        console.error("Error checking link availability:", error);
      }
    }

    const initialPromise = session?.user
      ? fetch("/api/form", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url,
            key: key,
            emailAddress: email,
            expiration: expirationDate,
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
          .then(() => {
            return fetch("/api/users", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: email,
                key: key,
                url: url
              }),
            }).then((response) => {
              if (!response.ok) {
                toast.error(
                  "An error occured with our telemetry system. Please try again later."
                );
              }
              return response.json();
            });
          })
      : Promise.resolve();

    initialPromise
      .then(() => {
        return fetch(
          `/api/link?key=${key}&link=${url}&expiration=${expirationDate}`,
          {
            method: "POST",
          }
        );
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
        setLastKey(key);
        setUrl("");
        setInputValue("");
        setExpirationDate("3600");
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
        <Card className="w-[20rem] md:w-[28rem]">
          <CardContent>
            {!shortened && (
              <>
                <p className="text-xl pt-5 pb-1 font-semibold">elr</p>
                <p className="text-xs text-gray-500 mb-4 pb-3">
                  A minimal URL shortener service. Enter your destination URL
                  and get a shortened link.
                  {!session?.user && (
                    <>
                      {" "}
                      You are not signed in. Sign in to create custom short
                      links and permanent links.
                    </>
                  )}
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center justify-between gap-2 pb-4 text-sm w-full">
                      <p>Link: </p>
                      <Input
                        key="link"
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        className="flex-1"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 pb-4 text-sm w-full">
                      <p>{process.env.NEXT_PUBLIC_DOMAIN_URL || "elr.sh/"}
                      </p>
                      {!session?.user ? (
                        <Input
                          key="backend"
                          disabled
                          value={randomString}
                          className="flex-1"
                        />
                      ) : (
                        <Input
                          className={`flex-1 ${
                            !isInputValid ? "border-red-500" : ""
                          }`}
                          key="backend"
                          placeholder="rickroll"
                          value={inputValue}
                          onChange={handleInputChange}
                        />
                      )}
                    </div>
                    {session?.user && !isInputValid && inputValue && (
                      <p className="text-red-500 text-xs mb-2">
                        Only letters and numbers are allowed
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2 text-sm w-full">
                      <p>Expires in:</p>
                      <div className="flex-1">
                        <Select
                          value={expirationDate}
                          onValueChange={setExpirationDate}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Expiration" />
                          </SelectTrigger>
                          <SelectContent>
                            {session?.user && (
                              <SelectItem value="never">
                                No expiration
                              </SelectItem>
                            )}
                            <SelectItem value="3600">1 hour</SelectItem>
                            <SelectItem value="10800">3 hours</SelectItem>
                            <SelectItem value="86400">1 day</SelectItem>
                            <SelectItem value="259200">3 days</SelectItem>
                            <SelectItem value="604800">7 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {!session?.user && expirationDate !== "never" && (
                      <p className="text-[0.7rem] text-gray-500 pt-2">
                        Links will expire after the selected duration. Log in to remove the expiration date.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-5">
                    {!session?.user ? (
                      <>
                        <Button
                          className="w-full bg-gray-700"
                          onClick={handleRandomize}
                          disabled={isAnimating}
                          type="button"
                        >
                          Randomize
                        </Button>
                        <Button
                          onClick={() => signIn("github", { redirectTo: "/" })}
                          type="button"
                          className="w-full bg-gray-700"
                        >
                          Sign In
                        </Button>
                      </>
                    ) : null}
                  </div>
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={session?.user && !isInputValid}
                    >
                      Shorten
                    </Button>
                  </div>
                </form>
              </>
            )}
            {shortened && (
              <>
                <div className="pb-3 pt-5">
                  <p className="text-green-700 text-sm pb-2">
                    Shortened link created!
                  </p>
                  <p className="text-sm">Share this link:</p>
                  <Link
                    href={`${process.env.NEXT_PUBLIC_DOMAIN_URL || "elr.sh/"}${lastKey}`}
                    className="text-xs underline text-gray-700"
                  >
                   {`${process.env.NEXT_PUBLIC_DOMAIN_URL || "elr.sh/"}${lastKey}`}
                  </Link>
                  <Button
                    className="w-full mt-4"
                    onClick={() => setShortened(false)}
                  >
                    Shorten another link
                  </Button>
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
