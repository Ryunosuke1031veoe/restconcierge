import Header from "../../components/header"
import HistoryList from "../../components/history-list"

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <HistoryList />
      </div>
    </div>
  )
}
