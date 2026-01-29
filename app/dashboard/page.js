"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, onSnapshot } from "firebase/firestore"
import { db, getAuthClient } from "../../lib/firebase"
import BoardCard from "../../components/BoardCard"

export default function Dashboard() {
  const [boards, setBoards] = useState([])
  const router = useRouter()

  useEffect(() => {
    let unsubscribeBoards = null

    async function init() {
      const auth = await getAuthClient()

      // 🔐 Protect route
      if (!auth.currentUser) {
        router.push("/login")
        return
      }

      // 📡 Realtime boards listener
      unsubscribeBoards = onSnapshot(
        collection(db, "boards"),
        (snapshot) => {
          setBoards(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }))
          )
        }
      )
    }

    init()

    return () => {
      if (unsubscribeBoards) unsubscribeBoards()
    }
  }, [router])

  async function createBoard() {
    const name = prompt("Board name?")
    if (!name) return

    await addDoc(collection(db, "boards"), {
      name,
      createdAt: new Date()
    })
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Your Boards</h2>

      <button onClick={createBoard}>+ Create Board</button>

      <div style={{ marginTop: 20 }}>
        {boards.length === 0 && (
          <p>No boards yet. Create one 👆</p>
        )}

        {boards.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
      </div>
    </div>
  )
}
