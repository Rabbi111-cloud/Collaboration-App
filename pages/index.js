import { useRouter } from "next/router"

export default function Home() {
  const router = useRouter()

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Task Collab</h1>
      <p style={styles.subtitle}>Organize work. Collaborate. Chat.</p>

      <div style={styles.buttons}>
        <button onClick={() => router.push("/login")} style={styles.primary}>
          Login
        </button>
        <button onClick={() => router.push("/signup")} style={styles.secondary}>
          Sign Up
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f4f8",
    gap: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  title: { fontSize: 42, fontWeight: 700 },
  subtitle: { fontSize: 18, color: "#555" },
  buttons: { display: "flex", gap: 16 },
  primary: {
    background: "#2563eb",
    color: "#fff",
    padding: "12px 28px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600
  },
  secondary: {
    background: "#e5e7eb",
    padding: "12px 28px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600
  }
}
