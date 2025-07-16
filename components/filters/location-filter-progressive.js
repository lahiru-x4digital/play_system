"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { discountService } from "@/services/discount.service";
import { brandService } from "@/services/brand.service";
import { branchService } from "@/services/branch.service";

/**
 * LocationFilterProgressive Component
 *
 * A filter component with progressive enabling:
 * - Country selection enables brand selection
 * - Brand selection enables branch selection  
 * - Branch selection enables search button
 *
 * @param {Object} props
 * @param {string} props.userType - The user type (e.g., 'SUPERADMIN')
 * @param {string} props.userBranchId - The user's branch ID
 * @param {Function} props.onFilterChange - Callback function when search is triggered
 * @param {boolean} props.showOnlyForSuperadmin - Whether to show the filter only for SUPERADMIN users
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.resetTrigger - When this value changes, the component will reset
 */
export const LocationFilterProgressive = ({
    userType,
    userBranchId,
    onFilterChange,
    showOnlyForSuperadmin = true,
    className = "",
    resetTrigger = 0,
}) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Data arrays
    const [countries, setCountries] = useState([]);
    const [brands, setBrands] = useState([]);
    const [branches, setBranches] = useState([]);

    // Selected values
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");

    // Fetch countries when component mounts
    useEffect(() => {
        if (!showOnlyForSuperadmin || userType === "SUPERADMIN" || userType === "ORGANIZATION_USER") {
            fetchCountries();
        }
    }, [userType, showOnlyForSuperadmin]);

    // Reset component when resetTrigger changes
    useEffect(() => {
        if (resetTrigger > 0) {
            handleReset();
        }
    }, [resetTrigger]);

    // Fetch countries
    const fetchCountries = async () => {
        try {
            setLoading(true);
            const response = await discountService.getCountries();
            if (response.success && Array.isArray(response.data)) {
                setCountries(response.data);
            } else {
                setCountries([]);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load countries",
                });
            }
        } catch (error) {
            console.error("Error fetching countries:", error);
            setCountries([]);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load countries",
            });
        } finally {
            setLoading(false);
        }
    };

    // Load brands for selected country
    const loadBrandsForCountry = async (countryId) => {
        try {
            setLoading(true);
            const response = await brandService.getAllBrandsWithoutFiles({
                country_id: countryId,
            });
            if (response.success && Array.isArray(response.data)) {
                setBrands(response.data);
            } else {
                setBrands([]);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load brands for selected country",
                });
            }
        } catch (error) {
            console.error("Error loading brands:", error);
            setBrands([]);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load brands",
            });
        } finally {
            setLoading(false);
        }
    };

    // Load branches for selected brand
    const loadBranchesForBrand = async (brandId, countryId) => {
        try {
            setLoading(true);
            const response = await branchService.getAllBranchesWithoutFiles({
                brand_id: brandId,
                country_id: countryId,
            });
            if (response.success && Array.isArray(response.data)) {
                setBranches(response.data);
            } else {
                setBranches([]);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load branches for selected brand",
                });
            }
        } catch (error) {
            console.error("Error loading branches:", error);
            setBranches([]);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load branches",
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle country change
    const handleCountryChange = async (countryId) => {
        setSelectedCountry(countryId);

        // Reset brand and branch selections
        setSelectedBrand("");
        setSelectedBranch("");
        setBrands([]);
        setBranches([]);

        // Load brands for the selected country
        if (countryId) {
            await loadBrandsForCountry(countryId);
        }
    };

    // Handle brand change
    const handleBrandChange = async (brandId) => {
        setSelectedBrand(brandId);

        // Reset branch selection
        setSelectedBranch("");
        setBranches([]);

        // Load branches for the selected brand
        if (brandId && selectedCountry) {
            await loadBranchesForBrand(brandId, selectedCountry);
        }
    };

    // Handle branch change
    const handleBranchChange = (branchId) => {
        setSelectedBranch(branchId);
    };

    // Handle search button click
    const handleSearch = () => {
        // Only trigger if all three selections are made
        if (selectedCountry && selectedBrand && selectedBranch) {
            if (onFilterChange && typeof onFilterChange === "function") {
                onFilterChange({
                    countryId: selectedCountry,
                    brandId: selectedBrand,
                    branchId: selectedBranch,
                    filterType: "search",
                });
            }
        } else {
            toast({
                variant: "destructive",
                title: "Incomplete Selection",
                description: "Please select country, brand, and branch before searching",
            });
        }
    };

    // Handle reset
    const handleReset = () => {
        setSelectedCountry("");
        setSelectedBrand("");
        setSelectedBranch("");
        setBrands([]);
        setBranches([]);

        // Trigger filter change callback with null values to clear filters
        if (onFilterChange && typeof onFilterChange === "function") {
            onFilterChange({
                countryId: null,
                brandId: null,
                branchId: null,
                filterType: "reset",
            });
        }
    };

    // Check if search should be enabled
    const isSearchEnabled = selectedCountry && selectedBrand && selectedBranch && !loading;

    // If showOnlyForSuperadmin is true and user is not SUPERADMIN, don't render anything
    if (showOnlyForSuperadmin && userType !== "SUPERADMIN" && userType !== "ORGANIZATION_USER") {
        return null;
    }

    return (
        <Card className={className}>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Progressive Location Filter</h3>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        {/* Country Selection */}
                        <div className="w-full md:w-[200px]">
                            <label className="text-sm font-medium mb-2 block">
                                Select Country
                            </label>
                            <Select
                                value={selectedCountry}
                                onValueChange={handleCountryChange}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.length > 0 ? (
                                        countries.map((country) => (
                                            <SelectItem
                                                key={country.id}
                                                value={country.id.toString()}
                                            >
                                                {country.country_name || country.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-countries" disabled>
                                            No countries available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Brand Selection */}
                        <div className="w-full md:w-[200px]">
                            <label className="text-sm font-medium mb-2 block">
                                Select Brand
                            </label>
                            <Select
                                value={selectedBrand}
                                onValueChange={handleBrandChange}
                                disabled={loading || !selectedCountry}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={!selectedCountry ? "Select country first" : "Select a brand"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.length > 0 ? (
                                        brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id.toString()}>
                                                {brand.brand_name || brand.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-brands" disabled>
                                            {selectedCountry ? "No brands available" : "Select country first"}
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Branch Selection */}
                        <div className="w-full md:w-[200px]">
                            <label className="text-sm font-medium mb-2 block">
                                Select Branch
                            </label>
                            <Select
                                value={selectedBranch}
                                onValueChange={handleBranchChange}
                                disabled={loading || !selectedBrand}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={!selectedBrand ? "Select brand first" : "Select a branch"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.length > 0 ? (
                                        branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                                {branch.branch_name || branch.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-branches" disabled>
                                            {selectedBrand ? "No branches available" : "Select brand first"}
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search Button */}
                        <Button
                            onClick={handleSearch}
                            disabled={!isSearchEnabled}
                            className="w-full md:w-auto"
                        >
                            Search
                        </Button>

                        {/* Reset Button */}
                        <Button
                            onClick={handleReset}
                            disabled={loading}
                            className="w-full md:w-auto md:ml-2 mt-2 md:mt-0"
                            variant="secondary"
                            size="sm"
                        >
                            Reset All
                        </Button>
                    </div>

                    {loading && (
                        <div className="text-xs text-gray-500 text-center">
                            Loading filter options...
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default LocationFilterProgressive; 