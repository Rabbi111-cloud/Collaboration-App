"use client"

import { useState } from "react"
import { auth } from "../../lib/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth"
import { useRouter } from "next/navigation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  async function handleLogin() {
    await signInWithEmailAndPassword(auth, email, password)
    router.push("/dashboard")
  }

  async function handleSignup() {
    await createUserWithEmailAndPassword(auth, email, password)
    router.push("/dashboard")
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Login / Signup</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <br /><br />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <br /><br />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup} style={{ marginLeft: 10 }}>Signup</button>
    </div>
  )
}
