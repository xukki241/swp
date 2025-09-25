import { Pill } from "lucide-react"
import { Link } from "react-router-dom"
import { Outlet } from "react-router-dom"
export default function AuthLayout() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link to="/" className="flex items-center gap-2 font-medium text-lg">
                        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                            <Pill className="size-5" />
                        </div>
                        PharmaFlow
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md">
                        <Outlet />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <img
                    src="/Pharmacy.png"
                    alt="Pharmacy Background"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}
