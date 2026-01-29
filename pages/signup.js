import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "../lib/firebase"
import { useRouter } from "next/router"

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Create Account</h2>

      <input
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />
      <br />

      <input
        type="password"
        placeholder="Password (min 6 chars)"
        onChange={e => setPassword(e.target.value)}
      />
      <br />

      <button onClick={signup}>Sign Up</button>

      <p style={{ color: "red" }}>{error}</p>

      <p>
        Already have an account?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => router.push("/login")}
        >
          Login
        </span>
      </p>
    </div>
  )
}
