import { useState, useCallback, useMemo } from "react";
import { BreadcrumbContext } from "../contexts/BreadcrumbContext";


export function BreadcrumbProvider({ children }) {
    const [items, setItems] = useState([]);

    const setBreadcrumb = useCallback((newItems) => {
        setItems(newItems);
    }, []);

    const value = useMemo(() => ({ items, setBreadcrumb }), [items, setBreadcrumb]);

    return (
        <BreadcrumbContext.Provider value={value}>
            {children}
        </BreadcrumbContext.Provider>
    );
}


