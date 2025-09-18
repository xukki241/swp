import React from "react";
import { Icon } from "@iconify/react";
import { Button, Tooltip } from "@heroui/react";

const navigationItems = [
    {
        label: "Dashboard",
        items: [
            { name: "Overview", icon: "lucide:home", active: true },
            { name: "Analytics", icon: "lucide:bar-chart-2" },
            { name: "Reports", icon: "lucide:file-text" },
        ]
    },
    {
        label: "Inventory",
        items: [
            { name: "Products", icon: "lucide:package" },
            { name: "Categories", icon: "lucide:tag" },
            { name: "Stock", icon: "lucide:layers" },
        ]
    },
    {
        label: "Sales",
        items: [
            { name: "Orders", icon: "lucide:shopping-cart" },
            { name: "Customers", icon: "lucide:users" },
            { name: "Invoices", icon: "lucide:file-text" },
        ]
    },
    {
        label: "Settings",
        items: [
            { name: "General", icon: "lucide:settings" },
            { name: "Security", icon: "lucide:shield" },
            { name: "Appearance", icon: "lucide:palette" },
        ]
    }
];

const Sidebar = ({ isOpen, onClose, isDesktop }) => {
    const handleKeyDown = (e) => {
        if (e.key === "Escape" && !isDesktop) {
            onClose();
        }
    };

    // Calculate sidebar width classes based on state and screen size
    const sidebarClasses = React.useMemo(() => {
        // Base classes for both mobile and desktop
        const baseClasses = "fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 flex flex-col bg-white border-r border-zinc-200 transition-all duration-300 ease-in-out overflow-hidden";

        // Desktop specific classes
        if (isDesktop) {
            return `${baseClasses} ${isOpen ? "w-60" : "w-[72px]"}`;
        }

        // Mobile specific classes (off-canvas)
        return `${baseClasses} ${isOpen ? "translate-x-0" : "-translate-x-full"} w-60`;
    }, [isOpen, isDesktop]);

    // Render backdrop for mobile
    const renderBackdrop = () => {
        if (isDesktop) return null;

        return isOpen ? (
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 top-16"
                onClick={onClose}
                aria-hidden="true"
            />
        ) : null;
    };

    return (
        <>
            {renderBackdrop()}
            <aside
                className={sidebarClasses}
                onKeyDown={handleKeyDown}
                tabIndex={isOpen ? 0 : -1}
                aria-hidden={!isOpen}
                aria-label="Sidebar navigation"
            >
                <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-track-zinc-100 scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400">
                    {navigationItems.map((section, idx) => (
                        <div key={idx} className="py-2 px-2">
                            {isOpen && (
                                <p className="px-2 text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                                    {section.label}
                                </p>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item, itemIdx) => {
                                    const NavItem = (
                                        <Button
                                            key={itemIdx}
                                            variant="flat"
                                            color="default"
                                            className={`justify-start w-full h-10 ${isOpen ? "px-3" : "px-0 justify-center min-w-10"
                                                } ${item.active
                                                    ? "bg-zinc-100 text-primary font-medium"
                                                    : "text-zinc-700 hover:bg-zinc-50"
                                                }`}
                                        >
                                            <Icon icon={item.icon} className={`h-5 w-5 flex-shrink-0 ${item.active ? "text-primary" : "text-zinc-500"}`} />
                                            {isOpen && <span className="ml-3 truncate">{item.name}</span>}
                                        </Button>
                                    );

                                    return isOpen ? (
                                        NavItem
                                    ) : (
                                        <Tooltip
                                            key={itemIdx}
                                            content={item.name}
                                            placement="right"
                                        >
                                            {NavItem}
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;