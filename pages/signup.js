import { useState } from "react"
import { useRouter } from "next/router"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "../lib/firebase"
import { theme } from "../lib/theme"

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
    background: theme.pageBg,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    background: theme.cardBg,
    padding: 30,
    borderRadius: 12,
    boxShadow: theme.shadow,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minWidth: 300,
    transition: "all 0.2s"
  },
  heading: { textAlign: "center", marginBottom: 20, color: theme.textPrimary },
  input: {
    padding: "10px 14px",
    borderRadius: 6,
    border: `1px solid ${theme.inputBorder}`,
    fontSize: 16
  },
  button: {
    padding: "12px",
    borderRadius: 6,
    border: "none",
    background: theme.primary,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    marginTop: 10,
    transition: "all 0.2s"
  },
  buttonHover: { filter: "brightness(0.9)" },
  switchText: {
    cursor: "pointer",
    textAlign: "center",
    color: theme.textSecondary,
    fontSize: 14,
    marginTop: 10
  }
}
