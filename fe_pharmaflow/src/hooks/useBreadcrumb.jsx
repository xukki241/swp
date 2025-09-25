import { createContext, useContext, useState, useCallback } from "react"

const BreadcrumbContext = createContext(null)

export function BreadcrumbProvider({ children }) {
    const [items, setItems] = useState([])

    // memo hóa để tránh re-render thừa
    const setBreadcrumb = useCallback((newItems) => {
        setItems(newItems)
    }, [])

    return (
        <BreadcrumbContext.Provider value={{ items, setBreadcrumb }}>
            {children}
        </BreadcrumbContext.Provider>
    )
}

export function useBreadcrumb() {
    const ctx = useContext(BreadcrumbContext)
    if (!ctx) {
        throw new Error("useBreadcrumb must be used within BreadcrumbProvider")
    }
    return ctx.setBreadcrumb
}

export function useBreadcrumbItems() {
    const ctx = useContext(BreadcrumbContext)
    if (!ctx) {
        throw new Error("useBreadcrumbItems must be used within BreadcrumbProvider")
    }
    return ctx.items
}
