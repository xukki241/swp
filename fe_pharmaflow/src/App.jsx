import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from "@/layout/Layout"
import Login from "@/pages/LoginPage"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

function Dashboard() {
  const breadcrumbItems = [
    { title: "Building Your Application", href: "#" },
    { title: "Data Fetching" }
  ]

  return (
    <Layout breadcrumbItems={breadcrumbItems}>
      <div className="text-4xl">Hello, world!</div>
    </Layout>
  )
}
