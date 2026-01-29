import { useEffect } from "react"
import { useRouter } from "next/router"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../lib/firebase"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/dashboard")
      else router.push("/login")
    })
    return () => unsub()
  }, [])

  return <p>Loading...</p>
}
