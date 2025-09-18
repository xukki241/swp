import React from "react";
import AppNavbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Layout = ({ children }) => {
    // Get stored sidebar state or default to open on desktop
    const getSavedSidebarState = () => {
        try {
            const saved = localStorage.getItem("sidebarOpen");
            return saved !== null ? JSON.parse(saved) : true;
        } catch (error) {
            return true;
        }
    };

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(getSavedSidebarState);
    const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 1024);

    // Toggle sidebar and save state to localStorage
    const toggleSidebar = () => {
        const newState = !isSidebarOpen;
        setIsSidebarOpen(newState);

        // Only save state for desktop view
        if (isDesktop) {
            try {
                localStorage.setItem("sidebarOpen", JSON.stringify(newState));
            } catch (error) {
                console.error("Failed to save sidebar state:", error);
            }
        }
    };

    // Close sidebar (mainly for mobile)
    const closeSidebar = () => {
        if (!isDesktop) {
            setIsSidebarOpen(false);
        }
    };

    // Handle window resize to determine if we're on desktop
    React.useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth >= 1024;
            setIsDesktop(desktop);

            // If transitioning to desktop and sidebar was closed on mobile, open it
            if (desktop && !isDesktop && !isSidebarOpen) {
                setIsSidebarOpen(getSavedSidebarState());
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isDesktop, isSidebarOpen]);

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50">
            <AppNavbar
                onToggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
            />

            <div className="flex flex-1 pt-16">
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={closeSidebar}
                    isDesktop={isDesktop}
                />

                <main
                    className={`flex-1 transition-all duration-300 ${isDesktop && isSidebarOpen ? "lg:ml-60" : isDesktop ? "lg:ml-[72px]" : ""
                        }`}
                >
                    <div className="container mx-auto px-4 py-6 max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;