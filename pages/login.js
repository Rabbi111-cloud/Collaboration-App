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
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>{isSignup ? "Create account" : "Welcome back"}</h2>

        <input
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
        />

        <button style={styles.button} onClick={submit} disabled={loading}>
          {loading ? "Loading..." : isSignup ? "Sign Up" : "Login"}
        </button>

        <p style={styles.switchText} onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Already have an account? Login" : "No account? Sign up"}
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f4f8",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minWidth: 300
  },
  heading: { textAlign: "center", marginBottom: 20 },
  input: {
    padding: "10px 14px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 16
  },
  button: {
    padding: "12px",
    borderRadius: 6,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    marginTop: 10
  },
  switchText: {
    cursor: "pointer",
    textAlign: "center",
    color: "#555",
    fontSize: 14,
    marginTop: 10
  }
}
