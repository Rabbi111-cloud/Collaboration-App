import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { onAuthStateChanged } from "firebase/auth"
import { doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "../../lib/firebase"

export default function BoardPage() {
  const router = useRouter()
  const { id } = router.query

  const [user, setUser] = useState(null)
  const [board, setBoard] = useState(null)
  const [columns, setColumns] = useState([])
  const [activity, setActivity] = useState([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [newColumn, setNewColumn] = useState("")
  const [messages, setMessages] = useState([])
  const [chatText, setChatText] = useState("")

  // Auth
  useEffect(() => onAuthStateChanged(auth, u => { if(!u) router.push("/login"); else setUser(u) }), [])

  // Board data
  useEffect(() => {
    if (!id) return
    return onSnapshot(doc(db, "boards", id), snap => { if(!snap.exists()) return router.push("/dashboard"); setBoard({ id: snap.id, ...snap.data() }) })
  }, [id])

  // Columns
  useEffect(() => {
    if (!id) return
    return onSnapshot(collection(db, "boards", id, "columns"), snap => setColumns(snap.docs.map(d=>({id:d.id,...d.data()}))))
  }, [id])

  // Activity
  useEffect(() => {
    if (!id) return
    const q = query(collection(db, "boards", id, "activity"), orderBy("createdAt","desc"))
    return onSnapshot(q, snap => setActivity(snap.docs.map(d=>d.data())))
  }, [id])

  // Chat messages
  useEffect(() => {
    if (!id) return
    const q = query(collection(db, "boards", id, "messages"), orderBy("createdAt"))
    return onSnapshot(q, snap => setMessages(snap.docs.map(d=>d.data())))
  }, [id])

  const log = async text => { await addDoc(collection(db,"boards",id,"activity"),{ text, createdAt: serverTimestamp() }) }

  const addColumn = async () => { if(!newColumn.trim()) return; await addDoc(collection(db,"boards",id,"columns"),{title:newColumn,createdAt:serverTimestamp()}); await log(`${user.email} added a column`); setNewColumn("") }

  const addTask = async columnId => { const text = prompt("Task title"); if(!text) return; await addDoc(collection(db,"boards",id,"columns",columnId,"tasks"),{text,order:Date.now(),columnId}); await log(`${user.email} added a task`) }

  const invite = async () => {
    if(!inviteEmail) return alert("Enter email")
    let uid
    const snap = await getDoc(doc(db,"users",inviteEmail))
    if(!snap.exists()){ uid=inviteEmail; await setDoc(doc(db,"users",inviteEmail),{ uid, email:inviteEmail, name:inviteEmail.split("@")[0], createdAt:serverTimestamp() }) }
    else uid = snap.data().uid
    await updateDoc(doc(db,"boards",id),{ members:[...new Set([...board.members, uid])]})
    await log(`${inviteEmail} joined the board`)
    setInviteEmail("")
  }

  const rename = async () => { const name=prompt("New board name",board.title); if(!name) return; await updateDoc(doc(db,"boards",id),{title:name}); await log(`${user.email} renamed the board`) }
  const remove = async () => { if(!confirm("Delete this board?")) return; await deleteDoc(doc(db,"boards",id)); router.push("/dashboard") }

  const sendChat = async () => { if(!chatText.trim()) return; await addDoc(collection(db,"boards",id,"messages"),{ text:chatText, uid:user.uid, email:user.email, createdAt:serverTimestamp() }); setChatText("") }

  return (
    <div style={{padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <h2>{board?.title}</h2>
        <div>
          <button onClick={rename}>Rename</button>
          <button onClick={remove}>Delete</button>
        </div>
      </div>

      <div>
        <input placeholder="Invite by email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} />
        <button onClick={invite}>Invite</button>
      </div>

      <div style={{display:"flex",gap:12,overflowX:"auto",marginTop:10}}>
        {columns.map(col=>(
          <div key={col.id} style={{background:"#fff",padding:12,width:250,borderRadius:8}}>
            <h4>{col.title}</h4>
            <TaskList boardId={id} columnId={col.id} />
            <button onClick={()=>addTask(col.id)}>+ Task</button>
          </div>
        ))}
        <div style={{background:"#fff",padding:12,width:250,borderRadius:8}}>
          <input placeholder="New column" value={newColumn} onChange={e=>setNewColumn(e.target.value)} />
          <button onClick={addColumn}>Add</button>
        </div>
      </div>

      <div style={{marginTop:20,background:"#fff",padding:12,borderRadius:8}}>
        <h4>Activity</h4>
        {activity.map((a,i)=><p key={i}>• {a.text}</p>)}
      </div>

      <div style={{marginTop:20,background:"#fff",padding:12,borderRadius:8,display:"flex",flexDirection:"column",gap:5}}>
        <h4>Chat</h4>
        <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
          {messages.map((m,i)=>(
            <div key={i} style={{alignSelf:m.uid===user.uid?"flex-end":"flex-start",background:m.uid===user.uid?"#0070f3":"#eee",color:m.uid===user.uid?"#fff":"#000",padding:6,borderRadius:6}}>
              <small>{m.email}</small>
              <div>{m.text}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:6}}>
          <input value={chatText} onChange={e=>setChatText(e.target.value)} placeholder="Type a message..." style={{flex:1}} />
          <button onClick={sendChat}>Send</button>
        </div>
      </div>
    </div>
  )
}

function TaskList({boardId,columnId}){
  const [tasks,setTasks]=useState([])

  useEffect(()=>onSnapshot(collection(db,"boards",boardId,"columns",columnId,"tasks"),snap=>{
    setTasks(snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>a.order-b.order))
  }),[boardId,columnId])

  const onDragStart=(e,task)=>e.dataTransfer.setData("task",JSON.stringify(task))
  const onDrop=async e=>{
    const task=JSON.parse(e.dataTransfer.getData("task"))
    if(task.columnId===columnId) return
    await deleteDoc(doc(db,"boards",boardId,"columns",task.columnId,"tasks",task.id))
    await addDoc(collection(db,"boards",boardId,"columns",columnId,"tasks"),{...task,columnId})
  }

  return <div onDragOver={e=>e.preventDefault()} onDrop={onDrop}>
    {tasks.map(t=><div key={t.id} draggable onDragStart={e=>onDragStart(e,t)} style={{background:"#e3f2fd",padding:8,borderRadius:6,marginBottom:6,cursor:"grab"}}>{t.text}</div>)}
  </div>
}
