/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Users,
  Briefcase,
  Flag,
  User,
  Building2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import PoliticianCard from "@/components/politicians/PoliticianCard";
import PaginationControls from "@/components/politicians/PaginationControls";
import { Politician } from "@/types/politician";
import { getAllPoliticians, getCabinetMembers } from "@/api/politicians"; // Update import

const PoliticiansPage = () => {
  // State for all politicians data
  const [allPoliticians, setAllPoliticians] = useState<Politician[]>([]);
  const [cabinetMembers, setCabinetMembers] = useState<Politician[]>([]);
  const [federalPoliticians, setFederalPoliticians] = useState<Politician[]>(
    []
  );
  const [statePoliticians, setStatePoliticians] = useState<Politician[]>([]);
  const [countyPoliticians, setCountyPoliticians] = useState<Politician[]>([]);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for filter options
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableParties, setAvailableParties] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for the active tab
  const [activeTab, setActiveTab] = useState("all");

  // Define fetchData function with useCallback
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all politicians
      console.log("Fetching all politicians...");
      const politicians = await getAllPoliticians();
      setAllPoliticians(politicians);

      // Fetch cabinet members
      console.log("Fetching cabinet members...");
      const cabinet = await getCabinetMembers();

      // Map cabinet data to match Politician format if needed
      const formattedCabinet = cabinet.map((member) => {
        // Ensure all required fields exist for PoliticianCard component
        return {
          ...member,
          // Set default values for any potentially missing fields
          state: member.state || "Federal",
          yearsServed: member.yearsServed || 0,
          // If you need to map photoUrl from your JSON
          photoUrl: member.photoUrl === "N/A" ? null : member.photoUrl,
        };
      });

      setCabinetMembers(formattedCabinet);
      console.log("Cabinet members loaded:", formattedCabinet.length);

      // Categorize politicians - exclude cabinet members from federal
      const cabinetIds = new Set(cabinet.map((c) => c.id));

      const federal = politicians.filter(
        (p) => p.state === "Federal" && !cabinetIds.has(p.id)
      );

      const state = politicians.filter(
        (p) => p.county === null && p.state !== "Federal"
      );

      const county = politicians.filter((p) => p.county !== null);

      setFederalPoliticians(federal);
      setStatePoliticians(state);
      setCountyPoliticians(county);

      // Extract available filter options including cabinet
      const allPoliticiansWithCabinet = [
        ...politicians,
        ...cabinet.filter((c) => !politicians.some((p) => p.id === c.id)),
      ];

      const uniqueStates = new Set(
        allPoliticiansWithCabinet.map((p) => p.state)
      );
      const states = Array.from(uniqueStates).filter(Boolean).sort();

      const uniqueParties = new Set(
        allPoliticiansWithCabinet.map((p) => p.party)
      );
      const parties = Array.from(uniqueParties).filter(Boolean).sort();

      setAvailableStates(states);
      setAvailableParties(parties);
    } catch (error) {
      console.error("Error fetching politicians:", error);
      setError("Failed to load politicians data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load politicians data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, partyFilter, stateFilter]);

  // Apply filters to politicians
  const filterPoliticians = (politicians: Politician[]) => {
    return politicians.filter((politician) => {
      // Apply search filter
      const matchesSearch =
        searchQuery === "" ||
        politician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (politician.position &&
          politician.position
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      // Apply party filter
      const matchesParty =
        partyFilter === "all" || politician.party === partyFilter;

      // Apply state filter
      const matchesState =
        stateFilter === "all" || politician.state === stateFilter;

      return matchesSearch && matchesParty && matchesState;
    });
  };

  // Get paginated data
  const getPaginatedData = (data: Politician[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  // Filter politicians based on current filters
  const filteredCabinet = filterPoliticians(cabinetMembers);
  const filteredFederal = filterPoliticians(federalPoliticians);
  const filteredState = filterPoliticians(statePoliticians);
  const filteredCounty = filterPoliticians(countyPoliticians);

  // Combine all unique politicians
  const allUniquePoliticians = [...cabinetMembers];

  // Add other politicians that are not in cabinet
  const cabinetIds = new Set(cabinetMembers.map((c) => c.id));
  federalPoliticians.forEach((p) => {
    if (!cabinetIds.has(p.id)) allUniquePoliticians.push(p);
  });

  // Add state and county politicians
  statePoliticians.forEach((p) => allUniquePoliticians.push(p));
  countyPoliticians.forEach((p) => allUniquePoliticians.push(p));

  const filteredAll = filterPoliticians(allUniquePoliticians);

  // Paginated data for current tab
  const paginatedCabinet = getPaginatedData(filteredCabinet);
  const paginatedFederal = getPaginatedData(filteredFederal);
  const paginatedState = getPaginatedData(filteredState);
  const paginatedCounty = getPaginatedData(filteredCounty);
  const paginatedAll = getPaginatedData(filteredAll);

  // Calculate total pages for each tab
  const cabinetPages = Math.ceil(filteredCabinet.length / itemsPerPage);
  const federalPages = Math.ceil(filteredFederal.length / itemsPerPage);
  const statePages = Math.ceil(filteredState.length / itemsPerPage);
  const countyPages = Math.ceil(filteredCounty.length / itemsPerPage);
  const allPages = Math.ceil(filteredAll.length / itemsPerPage);

  // Get total pages for current tab
  const getTotalPagesForTab = (tab: string) => {
    switch (tab) {
      case "cabinet":
        return cabinetPages;
      case "federal":
        return federalPages;
      case "state":
        return statePages;
      case "county":
        return countyPages;
      default:
        return allPages;
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setPartyFilter("all");
    setStateFilter("all");
    setCurrentPage(1);
  };

  // Function to retry data fetch
  const handleRetry = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold mb-6">Politicians Directory</h1>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-destructive/10 text-destructive p-4 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium">Error Loading Data</h3>
              <p className="text-sm">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {/* Search and Filter Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Search size={20} />
              Search & Filter Politicians
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    disabled={isLoading || !!error}
                  />
                </div>

                <Select
                  value={partyFilter}
                  onValueChange={setPartyFilter}
                  disabled={isLoading || !!error}
                >
                  <SelectTrigger className="w-[180px]">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <SelectValue placeholder="Party" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Parties</SelectItem>
                      {availableParties.map((party) => (
                        <SelectItem key={party} value={party}>
                          {party}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  value={stateFilter}
                  onValueChange={setStateFilter}
                  disabled={isLoading || !!error}
                >
                  <SelectTrigger className="w-[180px]">
                    <span className="flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      <SelectValue placeholder="State" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All States</SelectItem>
                      {availableStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={resetFilters}
                className="flex items-center gap-2"
                disabled={isLoading || !!error}
              >
                <Filter className="h-4 w-4" />
                Reset Filters
              </Button>
            </div>

            {/* Filter summary */}
            {!isLoading && !error && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Search: {searchQuery}
                  </Badge>
                )}
                {partyFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Party: {partyFilter}
                  </Badge>
                )}
                {stateFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    State: {stateFilter}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading politicians...</p>
          </div>
        ) : (
          /* Politicians Tabs */
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={(tab) => {
              setActiveTab(tab);
              setCurrentPage(1); // Reset to page 1 when changing tabs
            }}
          >
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">All</span>
                <Badge variant="secondary" className="ml-1">
                  {filteredAll.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="cabinet" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Cabinet</span>
                <Badge variant="secondary" className="ml-1">
                  {filteredCabinet.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="federal" className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                <span className="hidden sm:inline">Federal</span>
                <Badge variant="secondary" className="ml-1">
                  {filteredFederal.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="state" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">State</span>
                <Badge variant="secondary" className="ml-1">
                  {filteredState.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="county" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">County</span>
                <Badge variant="secondary" className="ml-1">
                  {filteredCounty.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* All Politicians Tab */}
            <TabsContent value="all">
              <h2 className="text-2xl font-bold mb-4">All Politicians</h2>
              {filteredAll.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paginatedAll.map((politician) => (
                      <PoliticianCard
                        key={politician.id}
                        politician={politician}
                      />
                    ))}
                  </div>

                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={allPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              ) : (
                <p className="text-center py-12 text-muted-foreground">
                  No politicians match your filters
                </p>
              )}
            </TabsContent>

            {/* Cabinet Members Tab */}
            <TabsContent value="cabinet">
              <h2 className="text-2xl font-bold mb-4">Presidential Cabinet</h2>
              {filteredCabinet.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paginatedCabinet.map((politician) => (
                      <PoliticianCard
                        key={politician.id}
                        politician={politician}
                      />
                    ))}
                  </div>

                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={cabinetPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              ) : (
                <p className="text-center py-12 text-muted-foreground">
                  No cabinet members match your filters
                </p>
              )}
            </TabsContent>

            {/* Federal Politicians Tab */}
            <TabsContent value="federal">
              <h2 className="text-2xl font-bold mb-4">Federal Officials</h2>
              {filteredFederal.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paginatedFederal.map((politician) => (
                      <PoliticianCard
                        key={politician.id}
                        politician={politician}
                      />
                    ))}
                  </div>

                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={federalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              ) : (
                <p className="text-center py-12 text-muted-foreground">
                  No federal officials match your filters
                </p>
              )}
            </TabsContent>

            {/* State Politicians Tab */}
            <TabsContent value="state">
              <h2 className="text-2xl font-bold mb-4">State Officials</h2>
              {filteredState.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paginatedState.map((politician) => (
                      <PoliticianCard
                        key={politician.id}
                        politician={politician}
                      />
                    ))}
                  </div>

                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={statePages}
                    onPageChange={setCurrentPage}
                  />
                </>
              ) : (
                <p className="text-center py-12 text-muted-foreground">
                  No state officials match your filters
                </p>
              )}
            </TabsContent>

            {/* County Politicians Tab */}
            <TabsContent value="county">
              <h2 className="text-2xl font-bold mb-4">County Officials</h2>
              {filteredCounty.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paginatedCounty.map((politician) => (
                      <PoliticianCard
                        key={politician.id}
                        politician={politician}
                      />
                    ))}
                  </div>

                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={countyPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              ) : (
                <p className="text-center py-12 text-muted-foreground">
                  No county officials match your filters
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default PoliticiansPage;
