// import Header from "../../components/header"
// import AnalyticsDashboard from "../../components/analytics-dashboard"

// export default function AnalyticsPage() {
//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />
//       <div className="flex-1">
//         <AnalyticsDashboard />
//       </div>
//     </div>
//   )
// }

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Header from "../../components/header"
import AnalyticsDashboard from "../../components/analytics-dashboard"

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <AnalyticsDashboard />
      </div>
    </div>
  )
}
