import { useState } from "react"
import { useRouter } from "next/router"
import { auth } from "../lib/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { setDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "../lib/firebase"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)

  const submit = async () => {
    if (!email || !password) return alert("Enter email and password")
    setLoading(true)

    try {
      if (isSignup) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password)
        // create profile
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
      <h2>{isSignup ? "Sign Up" : "Login"}</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={submit} disabled={loading}>{loading ? "Loading..." : isSignup ? "Sign Up" : "Login"}</button>
      <p onClick={() => setIsSignup(!isSignup)} style={{ cursor: "pointer" }}>
        {isSignup ? "Already have an account? Login" : "No account? Sign Up"}
      </p>
    </div>
  )
}

const styles = {
  page: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 10 }
}
