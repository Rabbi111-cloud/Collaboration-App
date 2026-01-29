"use client"

import { useEffect, useState } from "react"
import { db } from "../../../lib/firebase"
import {
  collection,
  addDoc,
  onSnapshot
} from "firebase/firestore"
import TaskCard from "../../../components/TaskCard"

export default function Board({ params }) {
  const boardId = params.id
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "boards", boardId, "tasks"),
      snapshot => {
        setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      }
    )
    return () => unsub()
  }, [])

  async function addTask() {
    const title = prompt("Task title?")
    if (!title) return

    await addDoc(collection(db, "boards", boardId, "tasks"), {
      title,
      status: "todo"
    })
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Board</h2>
      <button onClick={addTask}>+ Add Task</button>

      <div style={{ marginTop: 20 }}>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
