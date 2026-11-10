import { Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import CitizenLayout from '../layouts/CitizenLayout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import FeedbackPage from '../pages/citizen/FeedbackPage'
import CollectionSchedulePage from '../pages/citizen/CollectionSchedulePage'
import ProfilePage from '../pages/citizen/ProfilePage'
import CitizenDashboard from '../pages/citizen/CitizenDashboard'
import MyComplaintsPage from '../pages/citizen/MyComplaintsPage'
import ReportGarbagePage from '../pages/citizen/ReportGarbagePage'
import NotFoundPage from '../pages/NotFoundPage'
import StaffLayout from '../layouts/StaffLayout'
import StaffDashboard from '../pages/staff/StaffDashboard'
import MyTasksPage from '../pages/staff/MyTasksPage'
import TaskHistoryPage from '../pages/staff/TaskHistoryPage'
import StaffSchedulePage from '../pages/staff/StaffSchedulePage'
import NotificationsPage from '../pages/staff/NotificationsPage'
import StaffProfilePage from '../pages/staff/StaffProfilePage'

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/citizen" element={<CitizenLayout />}>
        <Route index element={<CitizenDashboard />} />
        <Route path="report" element={<ReportGarbagePage />} />
        <Route path="complaints" element={<MyComplaintsPage />} />
        <Route path="schedule" element={<CollectionSchedulePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="feedback" element={<FeedbackPage />} />
      </Route>

      <Route path="/staff" element={<StaffLayout />}>
        <Route index element={<StaffDashboard />} />
        <Route path="tasks" element={<MyTasksPage />} />
        <Route path="history" element={<TaskHistoryPage />} />
        <Route path="schedule" element={<StaffSchedulePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<StaffProfilePage />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
