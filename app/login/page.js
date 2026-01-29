"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthClient } from "../../lib/firebase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  async function handleLogin() {
    const auth = await getAuthClient()

    const { signInWithEmailAndPassword } = await import("firebase/auth")

    await signInWithEmailAndPassword(auth, email, password)
    router.push("/dashboard")
  }

  async function handleSignup() {
    const auth = await getAuthClient()

    const { createUserWithEmailAndPassword } = await import("firebase/auth")

    await createUserWithEmailAndPassword(auth, email, password)
    router.push("/dashboard")
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Login / Signup</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup} style={{ marginLeft: 10 }}>
        Signup
      </button>
    </div>
  )
}
