"use client"

import { useState } from "react"
import SearchBar from "./SearchBar"
import FilterGroup from "./FilterGroup"
import ActiveFilters from "./ActiveFilters"
import { toast } from "sonner"

export default function InventorySearching({ onSearch, suppliers }) {
    const [searchValue, setSearchValue] = useState("")
    const [filters, setFilters] = useState({
        search: "",
        stock: { min: "", max: "" },
        price: { min: "", max: "" },
        manufactureDate: { from: "", to: "" },
        expiryDate: { from: "", to: "" },
        supplier: [],
        prescription: false,
    })

    const handleFilterChange = (filterKey, value) => {
        setFilters((prev) => ({ ...prev, [filterKey]: value }))
    }

    const handleSearch = () => {
        // Validate ranges
        if (filters.stock.min && filters.stock.max && Number(filters.stock.min) > Number(filters.stock.max)) {
            toast.error("Stock Min cannot be greater than Stock Max.")
            return
        }
        if (filters.price.min && filters.price.max && Number(filters.price.min) > Number(filters.price.max)) {
            toast.error("Price Min cannot be greater than Price Max.")
            return
        }
        if (
            filters.manufactureDate.from &&
            filters.manufactureDate.to &&
            new Date(filters.manufactureDateMin) > new Date(filters.manufactureDateMax)
        ) {
            toast.error("Manufacture Date Min cannot be later than Manufacture Date Max.")
            return
        }
        if (
            filters.expiryDate.from &&
            filters.expiryDate.to &&
            new Date(filters.expiryDate.from) > new Date(filters.expiryDate.to)
        ) {
            toast.error("Expiry Date Min cannot be later than Expiry Date Max.")
            return
        }

        // Prepare search payload
        const searchPayload = {
            search: searchValue,
            stockMin: filters.stock.min,
            stockMax: filters.stock.max,
            priceMin: filters.price.min,
            priceMax: filters.price.max,
            manufactureDateMin: filters.manufactureDate.from,
            manufactureDateMax: filters.manufactureDate.to,
            expiryDateMin: filters.expiryDate.from,
            expiryDateMax: filters.expiryDate.to,
            supplier: filters.supplier,
            prescription: filters.prescription,
        }

        onSearch(searchPayload)
    }

    const handleRemoveFilter = (filterKey) => {
        if (filterKey === "stock" || filterKey === "price") {
            setFilters((prev) => ({
                ...prev,
                [filterKey]: { min: "", max: "" },
            }))
        } else if (filterKey === "manufactureDate" || filterKey === "expiryDate") {
            setFilters((prev) => ({
                ...prev,
                [filterKey]: { from: "", to: "" },
            }))
        } else if (filterKey === "supplier") {
            setFilters((prev) => ({
                ...prev,
                [filterKey]: [],
            }))
        } else if (filterKey === "prescription") {
            setFilters((prev) => ({
                ...prev,
                [filterKey]: false,
            }))
        }
    }

    return (
        <div className="space-y-4">
            <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} onSearch={handleSearch} />

            <FilterGroup filters={filters} onFilterChange={handleFilterChange} suppliers={suppliers} />

            <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} />
        </div>
    )
}
