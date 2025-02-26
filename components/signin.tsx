'use client'
import { signIn } from "next-auth/react"
import { Button } from "./ui/button"
 
export default function SignIn() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        signIn("github", { redirectTo: "/" })
      }}
    >
      <Button className="w-full" type="submit">Signin with GitHub</Button>
    </form>
  )
} 