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
 * LocationFilterEach Component
 *
 * A filter component that triggers data fetch immediately when each filter is changed
 *
 * @param {Object} props
 * @param {string} props.userType - The user type (e.g., 'SUPERADMIN')
 * @param {string} props.userBranchId - The user's branch ID
 * @param {Function} props.onFilterChange - Callback function when any filter changes
 * @param {boolean} props.showOnlyForSuperadmin - Whether to show the filter only for SUPERADMIN users
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.resetTrigger - When this value changes, the component will reset
 */
export const LocationFilterEach = ({
  userType,
  userBranchId,
  onFilterChange,
  showOnlyForSuperadmin = true,
  className = "",
  initialCountry = "",
  initialBrand = "",
  initialBranch = "",
  resetTrigger = 0,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [brands, setBrands] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry || "");
  const [selectedBrand, setSelectedBrand] = useState(initialBrand || "all");
  const [selectedBranch, setSelectedBranch] = useState(initialBranch || "all");

  // Fetch countries when component mounts and auto-select first country
  useEffect(() => {
    if (!showOnlyForSuperadmin || userType === "SUPERADMIN" || userType === "ORGANIZATION_USER") {
      fetchCountriesAndSelectFirst(false); // Don't trigger callback on initial load
    }
  }, [userType, showOnlyForSuperadmin]);

  // Load initial data when component mounts with initial values
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (
          initialBranch &&
          initialBranch !== "all" &&
          (!showOnlyForSuperadmin || userType === "SUPERADMIN" || userType === "ORGANIZATION_USER")
        ) {
          setLoading(true);
          // First load countries
          const countriesResponse = await discountService.getCountries();
          if (
            countriesResponse.success &&
            Array.isArray(countriesResponse.data)
          ) {
            setCountries(countriesResponse.data);

            // Get the branch details to find the brand and country
            const branchResponse = await branchService.getBranchById(
              initialBranch
            );
            if (branchResponse.success && branchResponse.data) {
              const branch = branchResponse.data;
              const countryId = branch.country_id?.toString();
              const brandId = branch.brand_id?.toString();

              // Set selected country
              if (countryId) {
                setSelectedCountry(countryId);

                // Load brands for the country without files
                const brandsResponse =
                  await brandService.getAllBrandsWithoutFiles({
                    country_id: countryId,
                  });
                if (
                  brandsResponse.success &&
                  Array.isArray(brandsResponse.data)
                ) {
                  setBrands(brandsResponse.data);
                }

                // Set selected brand
                if (brandId) {
                  setSelectedBrand(brandId);

                  // Load branches for the brand
                  const branchesResponse =
                    await branchService.getAllBranchesWithoutFiles({
                      brand_id: brandId,
                      country_id: countryId,
                    });
                  if (
                    branchesResponse.success &&
                    Array.isArray(branchesResponse.data)
                  ) {
                    setBranches(branchesResponse.data);
                  }
                }
              }
            }
          }
        } else if (
          initialCountry &&
          initialCountry !== "all" &&
          (!showOnlyForSuperadmin || userType === "SUPERADMIN" || userType === "ORGANIZATION_USER")
        ) {
          setLoading(true);
          // First load countries
          const countriesResponse = await discountService.getCountries();
          if (
            countriesResponse.success &&
            Array.isArray(countriesResponse.data)
          ) {
            setCountries(countriesResponse.data);
            setSelectedCountry(initialCountry);

            // Then load brands if initialBrand is provided
            if (initialBrand && initialBrand !== "all") {
              const brandsResponse =
                await brandService.getAllBrandsWithoutFiles({
                  country_id: initialCountry,
                });
              if (
                brandsResponse.success &&
                Array.isArray(brandsResponse.data)
              ) {
                setBrands(brandsResponse.data);
                setSelectedBrand(initialBrand);

                // Load branches if initialBranch is provided
                if (initialBranch && initialBranch !== "all") {
                  const branchesResponse =
                    await branchService.getAllBranchesWithoutFiles({
                      brand_id: initialBrand,
                      country_id: initialCountry,
                    });
                  if (
                    branchesResponse.success &&
                    Array.isArray(branchesResponse.data)
                  ) {
                    setBranches(branchesResponse.data);
                  }
                }
              }
            }
          }
        } else {
          // Just load countries and select first one if no initial values
          fetchCountriesAndSelectFirst(false);
        }
      } catch (error) {
        console.error("Error loading initial filter data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load filter data",
        });
        // Still try to load countries as fallback
        fetchCountriesAndSelectFirst(false);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [
    initialCountry,
    initialBrand,
    initialBranch,
    userType,
    userBranchId,
    showOnlyForSuperadmin,
  ]);

  // Reset component when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      // Reset to initial state and fetch first country
      fetchCountriesAndSelectFirst(false);
    }
  }, [resetTrigger]);

  // Fetch countries and auto-select the first one
  const fetchCountriesAndSelectFirst = async (shouldTriggerCallback = false) => {
    try {
      setLoading(true);
      const response = await discountService.getCountries();
      if (
        response.success &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setCountries(response.data);
        // Auto-select the first country (index 0)
        const firstCountry = response.data[0];
        const firstCountryId = firstCountry.id.toString();
        setSelectedCountry(firstCountryId);

        // Load brands for the first country but keep "All Brands" selected
        await loadBrandsForCountry(firstCountryId);
        
        // Only trigger callback if explicitly requested (e.g., during reset)
        if (shouldTriggerCallback && onFilterChange && typeof onFilterChange === "function") {
          onFilterChange({
            countryId: firstCountryId,
            brandId: null,
            branchId: null,
            filterType: "initial",
          });
        }
      } else {
        throw new Error(response.message || "No countries available");
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch countries",
      });
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch countries only (without auto-selection) - this is the new default behavior
  const fetchCountriesOnly = async () => {
    try {
      setLoading(true);
      const response = await discountService.getCountries();
      if (response.success && Array.isArray(response.data)) {
        setCountries(response.data);
        // Don't auto-select any country - let user choose
        setSelectedCountry("");
        setSelectedBrand("all");
        setSelectedBranch("all");
        setBrands([]);
        setBranches([]);
      } else {
        throw new Error(response.message || "Failed to fetch countries");
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch countries",
      });
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to load brands for a country
  const loadBrandsForCountry = async (countryId) => {
    try {
      if (countryId && countryId !== "all") {
        const result = await brandService.getAllBrandsWithoutFiles({
          country_id: countryId,
        });
        if (
          result.success &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          setBrands(result.data);
          // Don't auto-select first brand, keep "All Brands" selected
          setSelectedBrand("all");

          // Don't load branches automatically, keep "All Branches" selected
          setSelectedBranch("all");
          setBranches([]);
        } else {
          setBrands([]);
          setSelectedBrand("all");
        }
      } else {
        setBrands([]);
        setSelectedBrand("all");
      }
    } catch (error) {
      console.error("Error loading brands for country:", error);
      setBrands([]);
      setSelectedBrand("all");
    }
  };

  // Helper function to load branches for a brand
  const loadBranchesForBrand = async (brandId, countryId) => {
    try {
      if (brandId && brandId !== "all") {
        const branchesResponse = await branchService.getAllBranchesWithoutFiles(
          {
            brand_id: brandId,
            country_id: countryId,
          }
        );

        if (branchesResponse.success && Array.isArray(branchesResponse.data)) {
          let filteredBranches = [...branchesResponse.data];

          // Filter based on user type
          if (userType !== "SUPERADMIN" && userType !== "ORGANIZATION_USER" && userBranchId) {
            filteredBranches = filteredBranches.filter(
              (branch) => branch.id === userBranchId
            );
          }

          setBranches(filteredBranches);

          // Keep "All Branches" selected by default
          setSelectedBranch("all");
        } else {
          setBranches([]);
          setSelectedBranch("all");
        }
      } else {
        setBranches([]);
        setSelectedBranch("all");
      }
    } catch (error) {
      console.error("Error loading branches for brand:", error);
      setBranches([]);
      setSelectedBranch("all");
    }
  };

  // Handle country selection
  const handleCountryChange = async (countryId) => {
    try {
      setLoading(true);
      setSelectedCountry(countryId);
      setSelectedBrand("all");
      setSelectedBranch("all");
      setBranches([]);

      // If countryId is provided and not "all", fetch brands for that country without files
      if (countryId && countryId !== "all") {
        const result = await brandService.getAllBrandsWithoutFiles({
          country_id: countryId,
        });
        if (result.success) {
          setBrands(result.data);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch brands",
          });
        }
      } else {
        setBrands([]);
      }

      // Don't trigger filter change callback automatically - wait for search button click
    } catch (error) {
      console.error("Error handling country change:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch brands",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle brand selection
  const handleBrandChange = async (brandId) => {
    setSelectedBrand(brandId);
    setSelectedBranch("all");

    if (!brandId || brandId === "no-brands" || brandId === "all") {
      // Don't trigger filter change callback automatically - wait for search button click
      return;
    }

    try {
      setLoading(true);
      // Use the new getAllBranchesWithoutFiles function to get branches without large media files
      const branchesResponse = await branchService.getAllBranchesWithoutFiles({
        brand_id: brandId,
        country_id:
          selectedCountry && selectedCountry !== "all"
            ? selectedCountry
            : undefined, // Include country filter for more specific results
      });

      if (branchesResponse.success && Array.isArray(branchesResponse.data)) {
        let filteredBranches = [...branchesResponse.data];

        // Filter based on user type
        if (userType !== "SUPERADMIN" && userType !== "ORGANIZATION_USER" && userBranchId) {
          filteredBranches = filteredBranches.filter(
            (branch) => branch.id === userBranchId
          );
        }

        setBranches(filteredBranches);
      }

      // Don't trigger filter change callback automatically - wait for search button click
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch branches",
      });
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle branch selection
  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    // Don't trigger filter change callback automatically - wait for search button click
  };

  // Handle search button click
  const handleSearch = () => {
    // Trigger filter change callback with current selections
    if (onFilterChange && typeof onFilterChange === "function") {
      onFilterChange({
        countryId: selectedCountry, // Always send the selected country ID
        brandId:
          selectedBrand && selectedBrand !== "all" ? selectedBrand : null,
        branchId:
          selectedBranch && selectedBranch !== "all" ? selectedBranch : null,
        filterType: "search",
      });
    }
  };

  // Handle reset - reset to first country and load its data
  const handleReset = async () => {
    try {
      setLoading(true);
      
      // Fetch countries first
      const response = await discountService.getCountries();
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        setCountries(response.data);
        
        // Auto-select the first country
        const firstCountry = response.data[0];
        const firstCountryId = firstCountry.id.toString();
        setSelectedCountry(firstCountryId);

        // Load brands for the first country but keep "All Brands" selected
        await loadBrandsForCountry(firstCountryId);
        
        // Reset branch and brand selections
        setSelectedBrand("all");
        setSelectedBranch("all");
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
      } else {
        // If no countries available, reset everything to null
        setCountries([]);
        setSelectedCountry("");
        setBrands([]);
        setSelectedBrand("all");
        setBranches([]);
        setSelectedBranch("all");

        if (onFilterChange && typeof onFilterChange === "function") {
          onFilterChange({
            countryId: null,
            brandId: null,
            branchId: null,
            filterType: "reset",
          });
        }
      }
    } catch (error) {
      console.error("Error resetting filters:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset filters",
      });
    } finally {
      setLoading(false);
    }
  };

  // If showOnlyForSuperadmin is true and user is not SUPERADMIN, don't render anything
  if (showOnlyForSuperadmin && userType !== "SUPERADMIN" && userType !== "ORGANIZATION_USER") {
    return null;
  }

  return (
    <Card className={className}>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Real-time Location Filter</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end">
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

            <div className="w-full md:w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                Select Brand
              </label>
              <Select
                value={selectedBrand}
                onValueChange={handleBrandChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.length > 0 ? (
                    brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.brand_name || brand.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-brands" disabled>
                      No brands available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                Select Branch
              </label>
              <Select
                value={selectedBranch}
                onValueChange={handleBranchChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.length > 0 ? (
                    branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.branch_name || branch.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-branches" disabled>
                      No branches available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !selectedCountry}
              className="w-full md:w-auto"
            >
              Search
            </Button>
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

export default LocationFilterEach;
