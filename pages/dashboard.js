import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { auth, db } from "../lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore"

export default function Dashboard() {
  const router = useRouter()
  const [boards, setBoards] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return router.push("/login")
      setUser(u)

      const q = query(
        collection(db, "boards"),
        where("members", "array-contains", u.email)
      )

      onSnapshot(q, (snap) => {
        setBoards(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      })
    })

    return () => unsub()
  }, [])

  const createBoard = async () => {
    const doc = await addDoc(collection(db, "boards"), {
      name: "New Board",
      ownerId: user.uid,
      members: [user.email],
    })
    router.push(`/board/${doc.id}`)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Your Boards</h1>
      <button onClick={createBoard}>+ New Board</button>

      <ul>
        {boards.map(b => (
          <li
            key={b.id}
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/board/${b.id}`)}
          >
            {b.name}
          </li>
        ))}
      </ul>

      <button onClick={() => signOut(auth)}>Logout</button>
    </div>
  )
}

