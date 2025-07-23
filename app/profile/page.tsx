import Header from "../../components/header"
import ProfilePage from "../../components/profile-page"

export default function Profile() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <ProfilePage />
      </div>
    </div>
  )
}
