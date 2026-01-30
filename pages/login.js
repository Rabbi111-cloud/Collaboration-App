import { useState } from "react"
import { useRouter } from "next/router"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../lib/firebase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        alert("No account found. Please sign up.")
      } else if (err.code === "auth/wrong-password") {
        alert("Incorrect password.")
      } else {
        alert(err.message)
      }
    }
  }

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    justifyContent: "center",
    alignItems: "center"
  }
}
