import { Outlet, Link } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useBreadcrumbItems } from "@/hooks/useBreadcrumb";

export default function Layout() {
  const breadcrumbItems = useBreadcrumbItems();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.length > 0 ? (
                  breadcrumbItems.map((item, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                      <BreadcrumbItem
                        className={index === 0 ? "hidden md:block" : ""}
                      >
                        {index === breadcrumbItems.length - 1 ? (
                          <BreadcrumbPage>{item.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={item.href || "#"}>{item.title}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))
                ) : (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link to="/">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Home</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
