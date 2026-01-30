"use client"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Task Collaboration App</h1>
      <p style={styles.subtitle}>Organize tasks. Collaborate in real time.</p>

      <div style={styles.buttons}>
        <button onClick={() => router.push("/login")} style={styles.login}>
          Login
        </button>
        <button onClick={() => router.push("/signup")} style={styles.signup}>
          Sign Up
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f4f4"
  },
  title: { fontSize: "32px", marginBottom: "10px" },
  subtitle: { marginBottom: "30px", color: "#555" },
  buttons: { display: "flex", gap: "15px" },
  login: {
    padding: "12px 20px",
    background: "#25D366",
    color: "#fff",
    border: "none",
    borderRadius: "6px"
  },
  signup: {
    padding: "12px 20px",
    background: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "6px"
  }
}
