import { useEffect } from "react";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";

export default function Dashboard() {
  const setBreadcrumb = useBreadcrumb();

  useEffect(() => {
    setBreadcrumb([{ title: "Dashboard" }]);
  }, [setBreadcrumb]);

  return <div className="text-4xl">Hello, Dashboard!</div>;
}
