import { useContext } from "react";

import { BreadcrumbContext } from "../contexts/BreadcrumbContext";

export function useBreadcrumb() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) {
    throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
  }
  return ctx.setBreadcrumb;
}

export function useBreadcrumbItems() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) {
    throw new Error(
      "useBreadcrumbItems must be used within BreadcrumbProvider"
    );
  }
  return ctx.items;
}
