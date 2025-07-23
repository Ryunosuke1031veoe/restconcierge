import Header from "../../components/header"
import SettingsForm from "../../components/settings-form"

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <SettingsForm />
      </div>
    </div>
  )
}
