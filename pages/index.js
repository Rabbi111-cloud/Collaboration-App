import { useRouter } from "next/router"
import "../styles/global.css"

export default function Home() {
  const router = useRouter()

  return (
    <div style={styles.page}>
      <h1>Task Collab</h1>
      <p>Organize work. Collaborate. Chat.</p>

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
    gap: 20
  },
  buttons: {
    display: "flex",
    gap: 12
  },
  primary: {
    background: "#2563eb",
    color: "#fff",
    padding: "12px 20px"
  },
  secondary: {
    background: "#e5e7eb",
    padding: "12px 20px"
  }
}
