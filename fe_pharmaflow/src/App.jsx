import Layout from "@/layout/Layout"

export default function App() {
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
