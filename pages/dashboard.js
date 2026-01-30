import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [title, setTitle] = useState("")
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) router.push("/login")
      else setUser(u)
    })
    return () => unsub()
  }, [])

  // Boards listener
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, "boards"), where("members", "array-contains", user.uid))
    return onSnapshot(q, snap => {
      setBoards(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [user])

  // Notifications
  useEffect(() => {
    if (!user) return
    return onSnapshot(query(collection(db, "notifications")), snap => {
      setNotifications(snap.docs.filter(n => n.data().uid === user.uid).map(d => d.data()))
    })
  }, [user])

  const createBoard = async () => {
    if (!title.trim()) return alert("Enter board title")
    const docRef = await addDoc(collection(db, "boards"), {
      title: title.trim(),
      owner: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp()
    })
    setTitle("")
    setShowNewBoard(false)
  }

  const logout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  if (loading) return <p>Loading dashboard...</p>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Your Boards</h2>
        <button onClick={logout} style={styles.logout}>Logout</button>
      </div>

      {showNewBoard ? (
        <div style={styles.newBoard}>
          <input placeholder="Board title" value={title} onChange={e => setTitle(e.target.value)} />
          <button onClick={createBoard}>Create</button>
          <button onClick={() => setShowNewBoard(false)}>Cancel</button>
        </div>
      ) : (
        <button style={styles.addBoard} onClick={() => setShowNewBoard(true)}>+ New Board</button>
      )}

      <div style={styles.grid}>
        {boards.map(b => (
          <div key={b.id} style={styles.board} onClick={() => router.push(`/board/${b.id}`)}>
            {b.title}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <h4>Notifications</h4>
        {notifications.map((n, i) => <p key={i}>• {n.text}</p>)}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: 20 },
  header: { display: "flex", justifyContent: "space-between" },
  logout: { background: "#e63946", color: "#fff", border: "none", padding: "8px", borderRadius: 6 },
  addBoard: { padding: 12, background: "#0070f3", color: "#fff", borderRadius: 8, border: "none" },
  newBoard: { marginBottom: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 15 },
  board: { padding: 20, background: "#fff", borderRadius: 8, cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }
}
