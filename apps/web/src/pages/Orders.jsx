import { useEffect } from "react";

import { useBreadcrumb } from "@/hooks/useBreadcrumb";

export default function Orders() {
  const setBreadcrumb = useBreadcrumb();

  useEffect(() => {
    setBreadcrumb([{ title: "Orders" }]);
  }, [setBreadcrumb]);

  return <div className="text-4xl">Orders Page</div>;
}
