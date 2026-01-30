import { useState } from "react"
import { useRouter } from "next/router"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "../lib/firebase"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const signup = async () => {
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
    }
  }

  return (
    <div style={styles.container}>
      <h2>Sign Up</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={signup}>Create Account</button>
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
