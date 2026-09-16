import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Star,
  Phone,
  Globe,
  Filter,
  Search,
  Navigation,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useRealtimeLawyers } from "@/hooks/useRealtimeLawyers";

const MapView = () => {
  const [searchLocation, setSearchLocation] = useState("Delhi");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const { lawyers, loading } = useRealtimeLawyers();

  const specialties = [
    "Criminal Law",
    "Family Law",
    "Corporate Law",
    "Property Law",
    "Labor Law",
    "Consumer Protection",
    "Tax Law",
    "Immigration Law",
  ];

  const filteredLawyers = useMemo(() => {
    return lawyers.filter((lawyer) => {
      const matchesSpecialty =
        !selectedSpecialty ||
        selectedSpecialty === "all" ||
        lawyer.specialty.toLowerCase() === selectedSpecialty;

      const matchesLocation =
        !selectedLocation ||
        lawyer.location.toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesSpecialty && matchesLocation;
    });
  }, [lawyers, selectedLocation, selectedSpecialty]);

  const applyFilters = () => {
    setSelectedLocation(searchLocation.trim());
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Find Lawyers Near You
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover verified legal professionals in your area with our
            geo-location feature. Connect with experienced lawyers based on
            proximity and expertise.
          </p>
          <p className="text-sm text-primary">
            {loading
              ? "Loading live map data..."
              : "Profile and availability changes appear here in real time."}
          </p>
        </div>

        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search & Filter
            </CardTitle>
            <CardDescription>
              Find lawyers by location, specialty, and other preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <Input
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        applyFilters();
                      }
                    }}
                    placeholder="Enter city or area"
                    className="pl-10"
                  />
                  <Navigation className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Legal Specialty</label>
                <Select
                  value={selectedSpecialty}
                  onValueChange={setSelectedSpecialty}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem
                        key={specialty}
                        value={specialty.toLowerCase()}
                      >
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end space-x-2">
                <Button className="flex-1" onClick={applyFilters}>
                  <Filter className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedLocation("");
                    setSelectedSpecialty("");
                    setSearchLocation("");
                  }}
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Map View</CardTitle>
              <CardDescription>
                Interactive map showing lawyer locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapContainer
                center={[28.6139, 77.209]}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {lawyers
                  .filter((lawyer) => lawyer.coordinates)
                  .map((lawyer) => (
                    <Marker
                      key={lawyer.id}
                      position={[lawyer.coordinates!.lat, lawyer.coordinates!.lng]}
                      eventHandlers={{
                        click: () => setSelectedLocation(lawyer.location),
                      }}
                    >
                      <Popup>
                        <div>
                          <h3 className="font-semibold">{lawyer.name}</h3>
                          <p>{lawyer.specialty}</p>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLocation(lawyer.location);
                            }}
                          >
                            Filter by Location
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                Nearby Lawyers ({filteredLawyers.length})
              </h2>
              <Button variant="outline" size="sm">
                Live Updates
              </Button>
            </div>

            <div className="space-y-4">
              {filteredLawyers.map((lawyer, index) => (
                <Card
                  key={lawyer.id}
                  className="hover:shadow-medium transition-all duration-300 animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-semibold">
                              {lawyer.name}
                            </h3>
                            {lawyer.verified && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800"
                              >
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                              {lawyer.rating} ({lawyer.reviews} reviews)
                            </span>
                            <span>{lawyer.experience} experience</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary">
                            {lawyer.fees}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {lawyer.available
                              ? "Available for consultation"
                              : "Currently unavailable"}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Badge variant="outline" className="mr-2">
                              {lawyer.specialty}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-1" />
                            {lawyer.location}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {lawyer.languages.map((lang) => (
                              <Badge
                                key={lang}
                                variant="secondary"
                                className="text-xs"
                              >
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <Button size="sm" className="w-full">
                            Book Consultation
                          </Button>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              Call
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Globe className="w-4 h-4 mr-1" />
                              Website
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 animate-fade-in">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {lawyers.length}
              </div>
              <div className="text-sm text-muted-foreground">Live Profiles</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {
                  new Set(
                    lawyers
                      .map((lawyer) => lawyer.location)
                      .filter((location) => location.trim()),
                  ).size
                }
              </div>
              <div className="text-sm text-muted-foreground">
                Cities Covered
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {lawyers.filter((lawyer) => lawyer.available).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Available Now
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">Live</div>
              <div className="text-sm text-muted-foreground">
                Realtime Status
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MapView;
