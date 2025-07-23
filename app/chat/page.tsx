// import Header from "../../components/header"
// import ChatInterface from "../../components/chat-interface"

// export default function ChatPage() {
//   return (
//     <div className="h-screen flex flex-col">
//       <Header />
//       <div className="flex-1">
//         <ChatInterface />
//       </div>
//     </div>
//   )
// }

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" // あなたのプロジェクトのauth設定ファイル
import { redirect } from "next/navigation"
import Header from "../../components/header"
import ChatInterface from "../../components/chat-interface"

export default async function ChatPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <ChatInterface />
      </div>
    </div>
  )
}
