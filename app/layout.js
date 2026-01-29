import "../styles/globals.css"

export const metadata = {
  title: "Task Collaboration App"
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
