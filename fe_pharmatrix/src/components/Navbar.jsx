import { Icon } from "@iconify/react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Input,
    Button,
    Avatar,
    Badge,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@heroui/react";

const AppNavbar = ({ onToggleSidebar, isSidebarOpen }) => {
    return (
        <Navbar
            maxWidth="full"
            isBordered
            position="sticky"
            className="bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 h-16 min-h-16"
        >
            <NavbarContent className="gap-4">
                <Button
                    isIconOnly
                    variant="light"
                    aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                    onPress={onToggleSidebar}
                    className="sm:flex"
                >
                    <Icon icon="lucide:menu" className="h-5 w-5" />
                </Button>
                <NavbarBrand>
                    <Icon icon="lucide:layout-dashboard" className="h-6 w-6 text-primary" />
                    <p className="font-semibold text-inherit ml-2">AppDash</p>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="hidden md:flex flex-1 justify-center">
                <Input
                    classNames={{
                        base: "max-w-md",
                        inputWrapper: "bg-zinc-50"
                    }}
                    placeholder="Search..."
                    startContent={<Icon icon="lucide:search" className="text-zinc-400 h-4 w-4" />}
                    type="search"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            // Search functionality would go here
                        }
                    }}
                />
            </NavbarContent>

            <NavbarContent justify="end" className="gap-2">
                <NavbarItem>
                    <Button
                        isIconOnly
                        variant="light"
                        aria-label="Search"
                        className="md:hidden"
                    >
                        <Icon icon="lucide:search" className="h-5 w-5" />
                    </Button>
                </NavbarItem>
                <NavbarItem>
                    <Badge content="5" color="danger" shape="circle" size="sm">
                        <Button
                            isIconOnly
                            variant="light"
                            aria-label="Notifications"
                        >
                            <Icon icon="lucide:bell" className="h-5 w-5" />
                        </Button>
                    </Badge>
                </NavbarItem>
                <NavbarItem>
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Avatar
                                as="button"
                                className="transition-transform"
                                size="sm"
                                src="https://img.heroui.chat/image/avatar?w=150&h=150&u=1"
                            />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile Actions">
                            <DropdownItem key="profile" className="h-14 gap-2">
                                <p className="font-semibold">Signed in as</p>
                                <p className="font-semibold">user@example.com</p>
                            </DropdownItem>
                            <DropdownItem key="settings">My Settings</DropdownItem>
                            <DropdownItem key="team">Team Settings</DropdownItem>
                            <DropdownItem key="analytics">Analytics</DropdownItem>
                            <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
                            <DropdownItem key="logout" color="danger">
                                Log Out
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
};

export default AppNavbar;