import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "../lib/firebase"
import { collection, addDoc, getDocs } from "firebase/firestore"

export default function Dashboard() {
  const router = useRouter()
  const [boards, setBoards] = useState([])

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login")

      const snap = await getDocs(collection(db, "boards"))
      setBoards(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  const createBoard = async () => {
    const doc = await addDoc(collection(db, "boards"), {
      name: "New Board",
      createdAt: Date.now(),
    })
    router.push(`/board/${doc.id}`)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <button onClick={createBoard}>+ New Board</button>

      <ul>
        {boards.map(b => (
          <li key={b.id} onClick={() => router.push(`/board/${b.id}`)}>
            {b.name}
          </li>
        ))}
      </ul>

      <button onClick={() => signOut(auth)}>Logout</button>
    </div>
  )
}
