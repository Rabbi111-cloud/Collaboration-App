import { useState } from "react"
import { useRouter } from "next/router"
import { auth, db } from "../lib/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { setDoc, doc, serverTimestamp } from "firebase/firestore"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!email || !password) return alert("Enter email and password")
    setLoading(true)

    try {
      if (isSignup) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, "users", userCred.user.uid), {
          uid: userCred.user.uid,
          email,
          name: email.split("@")[0],
          createdAt: serverTimestamp()
        })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }

      router.push("/dashboard")
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{isSignup ? "Create account" : "Welcome back"}</h2>

        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

        <button onClick={submit} disabled={loading}>
          {loading ? "Loading..." : isSignup ? "Sign Up" : "Login"}
        </button>

        <p style={{ cursor: "pointer", textAlign: "center" }} onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Already have an account? Login" : "No account? Sign up"}
        </p>
      </div>
    </div>
  )
}
