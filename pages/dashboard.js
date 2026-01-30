import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

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
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Your Boards</h2>
        <button style={styles.logout} onClick={() => signOut(auth)}>Logout</button>
      </header>

      {showNewBoard ? (
        <div style={styles.newBoardContainer}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Board name"
            style={styles.input}
          />
          <button style={styles.createBtn} onClick={createBoard}>Create</button>
        </div>
      ) : (
        <button style={styles.addBoardBtn} onClick={() => setShowNewBoard(true)}>+ New Board</button>
      )}

      <div style={styles.boardGrid}>
        {boards.map(b => (
          <div
            key={b.id}
            style={styles.boardCard}
            onClick={() => router.push(`/board/${b.id}`)}
          >
            {b.title}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: 40,
    background: theme.pageBg,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  title: { fontSize: 28, fontWeight: 600, color: theme.textPrimary },
  logout: {
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    background: theme.danger,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s",
  },
  logoutHover: { filter: "brightness(0.9)" },
  newBoardContainer: {
    display: "flex",
    gap: 10,
    marginBottom: 20
  },
  input: {
    padding: "8px 12px",
    borderRadius: 6,
    border: `1px solid ${theme.inputBorder}`,
    flex: 1,
    fontSize: 16
  },
  createBtn: {
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    background: theme.primary,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s"
  },
  addBoardBtn: {
    padding: "10px 20px",
    borderRadius: 6,
    border: "none",
    background: theme.primary,
    color: "#fff",
    fontWeight: 500,
    cursor: "pointer",
    marginBottom: 20,
    transition: "all 0.2s"
  },
  boardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 20
  },
  boardCard: {
    background: theme.cardBg,
    padding: 20,
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 16,
    boxShadow: theme.shadow,
    transition: "all 0.2s",
  },
  boardCardHover: { transform: "translateY(-4px)", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }
}
