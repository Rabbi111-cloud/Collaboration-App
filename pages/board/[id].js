import { useRouter } from "next/router"

export default function Board() {
  const { id } = useRouter().query

  return (
    <div style={{ padding: 40 }}>
      <h1>Board</h1>
      <p>Board ID: {id}</p>
    </div>
  )
}
