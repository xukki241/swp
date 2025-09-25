import { useState, useCallback } from "react"
import { BreadcrumbContext } from "../contexts/BreadcrumbContext"

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