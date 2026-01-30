import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../lib/firebase"
import "../styles/global.css"
import "../styles/dashboard.css"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [boards, setBoards] = useState([])
  const [title, setTitle] = useState("")
  const [showNewBoard, setShowNewBoard] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      if (!u) router.push("/login")
      else setUser(u)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, "boards"), where("members", "array-contains", user.uid))
    return onSnapshot(q, snap => {
      setBoards(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [user])

  const createBoard = async () => {
    if (!title.trim()) return alert("Enter title")
    await addDoc(collection(db, "boards"), {
      title,
      owner: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp()
    })
    setTitle("")
    setShowNewBoard(false)
  }

  return (
    <div className="dashboard">
      <h2>Your Boards</h2>

      {showNewBoard ? (
        <>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Board name" />
          <button onClick={createBoard}>Create</button>
        </>
      ) : (
        <button onClick={() => setShowNewBoard(true)}>+ New Board</button>
      )}

      <div className="board-grid">
        {boards.map(b => (
          <div key={b.id} className="board-card" onClick={() => router.push(`/board/${b.id}`)}>
            {b.title}
          </div>
        ))}
      </div>

      <button onClick={() => signOut(auth)}>Logout</button>
    </div>
  )
}
