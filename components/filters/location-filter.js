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
import { discountService } from "@/services/discount.service";
import { brandService } from "@/services/brand.service";
import { branchService } from "@/services/branch.service";
import { useToast } from "@/components/ui/use-toast";

/**
 * LocationFilter Component
 * 
 * A reusable component for filtering by country, brand, and branch
 * 
 * @param {Object} props
 * @param {string} props.userType - The user type (e.g., 'SUPERADMIN')
 * @param {string} props.userBranchId - The user's branch ID
 * @param {Function} props.onSearch - Callback function when search is clicked
 * @param {boolean} props.showOnlyForSuperadmin - Whether to show the filter only for SUPERADMIN users
 */
export const LocationFilter = ({
  userType,
  userBranchId,
  onSearch,
  showOnlyForSuperadmin = true,
  className = "",
  initialCountry = "",
  initialBrand = "",
  initialBranch = ""
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [brands, setBrands] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);

  // Fetch countries when component mounts
  useEffect(() => {
    if (!showOnlyForSuperadmin || userType === 'SUPERADMIN') {
      fetchCountries();
    }
  }, [userType, showOnlyForSuperadmin]);

  // Load initial data when component mounts with initial values
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (initialBranch && (!showOnlyForSuperadmin || userType === 'SUPERADMIN')) {
          setLoading(true);
          // First load countries
          const countriesResponse = await discountService.getCountries();
          if (countriesResponse.success && Array.isArray(countriesResponse.data)) {
            setCountries(countriesResponse.data);

            // Get the branch details to find the brand and country
            const branchResponse = await branchService.getBranchById(initialBranch);
            if (branchResponse.success && branchResponse.data) {
              const branch = branchResponse.data;
              const countryId = branch.country_id?.toString();
              const brandId = branch.brand_id?.toString();

              // Set selected country
              if (countryId) {
                setSelectedCountry(countryId);

                // Load brands for the country without files
                const brandsResponse = await brandService.getAllBrandsWithoutFiles({ country_id: countryId });
                if (brandsResponse.success && Array.isArray(brandsResponse.data)) {
                  setBrands(brandsResponse.data);

                  // Set selected brand
                  if (brandId) {
                    setSelectedBrand(brandId);

                    // Load branches for the brand without files
                    const branchesResponse = await branchService.getAllBranchesWithoutFiles({ brand_id: brandId });
                    if (branchesResponse.success && Array.isArray(branchesResponse.data)) {
                      let filteredBranches = branchesResponse.data.filter(
                        b => b.country_id.toString() === countryId
                      );

                      // Filter based on user type
                      if (userType !== 'SUPERADMIN' && userBranchId) {
                        filteredBranches = filteredBranches.filter(b => b.id === userBranchId);
                      }

                      setBranches(filteredBranches);
                      setSelectedBranch(initialBranch);
                    }
                  }
                }
              }
            }
          }
        } else if (initialCountry && (!showOnlyForSuperadmin || userType === 'SUPERADMIN')) {
          setLoading(true);
          // First load countries
          const countriesResponse = await discountService.getCountries();
          if (countriesResponse.success && Array.isArray(countriesResponse.data)) {
            setCountries(countriesResponse.data);
            setSelectedCountry(initialCountry);

            // Then load brands if initialBrand is provided
            if (initialBrand) {
              const brandsResponse = await brandService.getAllBrandsWithoutFiles({ country_id: initialCountry });
              if (brandsResponse.success && Array.isArray(brandsResponse.data)) {
                setBrands(brandsResponse.data);
                setSelectedBrand(initialBrand);
              }
            }
          }
        } else {
          // Just load countries if no initial values
          fetchCountries();
        }
      } catch (error) {
        console.error('Error loading initial filter data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load filter data",
        });
        // Still try to load countries as fallback
        fetchCountries();
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [initialCountry, initialBrand, initialBranch, userType, userBranchId, showOnlyForSuperadmin]);

  // Fetch countries
  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await discountService.getCountries();
      if (response.success && Array.isArray(response.data)) {
        setCountries(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch countries');
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
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

  // Handle country selection
  const handleCountryChange = async (countryId) => {
    try {
      setLoading(true);
      setSelectedCountry(countryId);
      setSelectedBrand("");
      setSelectedBranch("");
      setBranches([]);

      // If countryId is provided, fetch brands for that country without files
      if (countryId) {
        const result = await brandService.getAllBrandsWithoutFiles({ country_id: countryId });
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
    } catch (error) {
      console.error('Error handling country change:', error);
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
    setSelectedBranch("");

    if (!brandId || brandId === "no-brands") return;

    try {
      setLoading(true);
      // Use the new getAllBranchesWithoutFiles function to get branches without large media files
      const branchesResponse = await branchService.getAllBranchesWithoutFiles({
        brand_id: brandId,
        country_id: selectedCountry // Include country filter for more specific results
      });

      if (branchesResponse.success && Array.isArray(branchesResponse.data)) {
        let filteredBranches = [...branchesResponse.data];

        // Filter based on user type
        if (userType !== 'SUPERADMIN' && userBranchId) {
          filteredBranches = filteredBranches.filter(branch => branch.id === userBranchId);
        }

        setBranches(filteredBranches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
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
  };

  // Handle search button click
  const handleSearch = () => {
    try {
      if (!selectedBranch) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a branch",
        });
        return;
      }

      // Find the selected branch object
      const selectedBranchObj = branches.find(branch => branch.id.toString() === selectedBranch);

      // Show search notification
      toast({
        title: "Filter Applied",
        description: `Filtering data for ${selectedBranchObj?.branch_name || 'selected branch'}`,
      });

      // Call the onSearch callback with the selected values
      if (onSearch && typeof onSearch === 'function') {
        onSearch({
          countryId: selectedCountry,
          brandId: selectedBrand,
          branchId: selectedBranch,
          branchObj: selectedBranchObj
        });
      }
    } catch (error) {
      console.error('Error in handling search:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while applying the filter",
      });
    }
  };

  // If showOnlyForSuperadmin is true and user is not SUPERADMIN, don't render anything
  if (showOnlyForSuperadmin && userType !== 'SUPERADMIN') {
    return null;
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
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
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.length > 0 ? (
                  countries.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
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
              disabled={!selectedCountry || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
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
              disabled={!selectedBrand || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
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
                    No branches available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSearch}
            disabled={!selectedBranch || loading}
            className="w-full md:w-auto"
          >
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationFilter;