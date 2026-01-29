"use client"

import { useEffect, useState } from "react"
import { auth, db } from "../../lib/firebase"
import { collection, addDoc, onSnapshot } from "firebase/firestore"
import BoardCard from "../../components/BoardCard"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [boards, setBoards] = useState([])
  const router = useRouter()

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/login")
      return
    }

    const unsub = onSnapshot(collection(db, "boards"), snapshot => {
      setBoards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    return () => unsub()
  }, [])

  async function createBoard() {
    const name = prompt("Board name?")
    if (!name) return
    await addDoc(collection(db, "boards"), { name })
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Your Boards</h2>
      <button onClick={createBoard}>+ Create Board</button>
      <div style={{ marginTop: 20 }}>
        {boards.map(board => (
          <BoardCard key={board.id} board={board} />
        ))}
      </div>
    </div>
  )
}
