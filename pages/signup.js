import { useState } from "react"
import { useRouter } from "next/router"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "../lib/firebase"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const signup = async () => {
    if (!email || !password) return alert("Enter email and password")
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      alert("Account created! Please log in.")
      router.push("/login")
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        alert("This email already exists. Please log in.")
        router.push("/login")
      } else {
        alert(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Sign Up</h2>

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

        <button style={styles.button} onClick={signup} disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p style={styles.switchText} onClick={() => router.push("/login")}>
          Already have an account? Login
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
  heading: {
    textAlign: "center",
    marginBottom: 20
  },
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
