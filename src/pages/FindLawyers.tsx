import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpRight,
  Award,
  Calendar,
  Globe,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Video,
} from "lucide-react";
import Rating from "@/pages/Rating";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRealtimeLawyers } from "@/hooks/useRealtimeLawyers";

const specialties = [
  "Criminal Law",
  "Family Law",
  "Corporate Law",
  "Property Law",
  "Labor Law",
  "Consumer Protection",
  "Tax Law",
  "Immigration Law",
  "Intellectual Property",
  "Banking Law",
  "Environmental Law",
  "Cyber Law",
];

const cities = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Ahmedabad",
  "Pune",
  "Surat",
  "Jaipur",
  "Lucknow",
  "Kanpur",
];

const MapSizeFix = () => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const refreshMapSize = () => map.invalidateSize({ pan: false });
    const observer = new ResizeObserver(refreshMapSize);

    observer.observe(container);
    refreshMapSize();
    const timeoutId = window.setTimeout(refreshMapSize, 250);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, [map]);

  return null;
};

const FindLawyers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const { lawyers, loading } = useRealtimeLawyers();

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  const cityCoordinates = lawyers
    .filter((lawyer) => lawyer.coordinates)
    .map((lawyer) => ({
      name: lawyer.location,
      lat: lawyer.coordinates!.lat,
      lng: lawyer.coordinates!.lng,
    }));

  const filteredLawyers = lawyers.filter((lawyer) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      lawyer.name.toLowerCase().includes(query) ||
      lawyer.specialty.toLowerCase().includes(query) ||
      lawyer.description.toLowerCase().includes(query);
    const matchesCity =
      !selectedCity ||
      selectedCity === "all" ||
      lawyer.location.toLowerCase() === selectedCity.toLowerCase();
    const matchesSpecialty =
      !selectedSpecialty ||
      selectedSpecialty === "all" ||
      lawyer.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    const matchesRating =
      !selectedRating || lawyer.rating >= parseFloat(selectedRating);
    return matchesSearch && matchesCity && matchesSpecialty && matchesRating;
  });

  const hasActiveFilters = Boolean(
    searchQuery || selectedCity || selectedSpecialty || selectedRating,
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedSpecialty("");
    setSelectedRating("");
  };

  const openLawyer = (lawyer: (typeof lawyers)[number]) =>
    navigate("/lawyer-details", { state: { lawyer } });

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <main>
        <section className="border-b border-white/10 bg-[#111111]">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#e8d05b]">
                  <ShieldCheck className="h-4 w-4" />
                  Find your advocate
                </div>
                <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] tracking-tight sm:text-6xl">
                  The right legal help starts with the right conversation.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/55">
                  Compare advocates by practice area, location, experience, and
                  availability. Find someone who fits your situation.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm text-white/45">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {loading ? "Updating profiles" : "Profiles updated live"}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#0b0b0b]/95 backdrop-blur lg:sticky lg:top-16 lg:z-30">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="grid gap-3 lg:grid-cols-[1.6fr_0.75fr_0.95fr_0.75fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-white/35" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search name, specialty, or concern"
                  className="h-10 border-white/15 bg-white/5 pl-10 text-white placeholder:text-white/30"
                />
              </div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="border-white/15 bg-white/5 text-white">
                  <SelectValue placeholder="Any city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city.toLowerCase()}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedSpecialty}
                onValueChange={setSelectedSpecialty}
              >
                <SelectTrigger className="border-white/15 bg-white/5 text-white">
                  <SelectValue placeholder="Any practice area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All specialties</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty.toLowerCase()}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="border-white/15 bg-white/5 text-white">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                  <SelectItem value="4">4.0+ stars</SelectItem>
                  <SelectItem value="3.5">3.5+ stars</SelectItem>
                  <SelectItem value="3">3.0+ stars</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {hasActiveFilters ? "Clear filters" : "Filters"}
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                Your shortlist
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {filteredLawyers.length} advocates found
              </h2>
            </div>
            <p className="text-sm text-white/40">
              Select a profile to see the full story.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
            <div className="space-y-4">
              {filteredLawyers.map((lawyer) => (
                <article
                  key={lawyer.id}
                  className="group cursor-pointer border border-white/10 bg-[#111111] p-5 transition-colors hover:border-[#e8d05b]/45 hover:bg-[#151515] sm:p-6"
                  onClick={() => openLawyer(lawyer)}
                >
                  <div className="grid gap-6 md:grid-cols-[8rem_1fr_auto]">
                    <div className="relative">
                      <img
                        src={lawyer.image}
                        alt={lawyer.name}
                        className="h-28 w-28 rounded-full object-cover grayscale-[10%]"
                      />
                      {lawyer.verified && (
                        <span
                          className="absolute -right-1 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#e8d05b] text-black"
                          title="Verified advocate"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold group-hover:text-[#e8d05b]">
                            {lawyer.name}
                          </h3>
                          <p className="mt-1 text-sm text-[#e8d05b]">
                            {lawyer.specialty}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-2 text-xs font-medium ${lawyer.available ? "text-emerald-400" : "text-white/35"}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${lawyer.available ? "bg-emerald-400" : "bg-white/25"}`}
                          />
                          {lawyer.available
                            ? "Available now"
                            : "Currently busy"}
                        </div>
                      </div>
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/50">
                        {lawyer.description}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/45">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#e8d05b]" />
                          {lawyer.location}
                        </span>
                        <span>{lawyer.experience} experience</span>
                        <span className="flex items-center gap-1.5">
                          <Rating value={lawyer.rating} /> {lawyer.reviews}{" "}
                          reviews
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {lawyer.languages.map((language) => (
                          <Badge
                            key={language}
                            className="border-white/10 bg-white/5 text-xs font-normal text-white/50"
                          >
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex min-w-[150px] flex-col justify-between border-t border-white/10 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                      <div>
                        <p className="text-xl font-semibold text-[#e8d05b]">
                          {lawyer.fees}
                        </p>
                        <p className="mt-1 text-xs text-white/35">
                          per consultation
                        </p>
                      </div>
                      <div className="mt-5 space-y-2">
                        <Button
                          disabled={!lawyer.available}
                          className="w-full bg-[#e8d05b] text-black hover:bg-[#f2df72]"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate("/booking", { state: { lawyer } });
                          }}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Book
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate("/video-call", { state: { lawyer } });
                          }}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Video call
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {filteredLawyers.length === 0 && (
                <div className="border border-dashed border-white/15 px-6 py-16 text-center">
                  <Search className="mx-auto h-8 w-8 text-white/25" />
                  <h3 className="mt-4 text-xl font-semibold">
                    No advocates match those filters.
                  </h3>
                  <p className="mt-2 text-sm text-white/45">
                    Try a wider search or clear one of the filters.
                  </p>
                </div>
              )}
            </div>

            <aside className="h-fit border border-white/10 bg-[#111111] lg:sticky lg:top-32">
              <div className="border-b border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                      Explore by place
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      Advocates across India
                    </h2>
                  </div>
                  <MapPin className="h-5 w-5 text-[#e8d05b]" />
                </div>
                <p className="mt-3 text-sm leading-6 text-white/45">
                  Select a marker to focus the list on a city.
                </p>
              </div>
              <div className="h-[430px] overflow-hidden">
                <MapContainer
                  center={[20.5937, 78.9629]}
                  zoom={4}
                  style={{ height: "100%", width: "100%" }}
                >
                  <MapSizeFix />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {cityCoordinates.map((city, index) => (
                    <Marker
                      key={`${city.name}-${index}`}
                      position={[city.lat, city.lng]}
                    >
                      <Popup
                        onOpen={() => setSelectedCity(city.name.toLowerCase())}
                      >
                        <div className="text-center">
                          <h3 className="font-semibold">{city.name}</h3>
                          <p className="mt-1 text-sm">
                            Filter advocates for {city.name}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 text-center">
                <div className="p-3">
                  <p className="text-lg font-semibold text-[#e8d05b]">
                    {lawyers.length}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">
                    Profiles
                  </p>
                </div>
                <div className="p-3">
                  <p className="text-lg font-semibold text-[#e8d05b]">
                    {new Set(lawyers.map((lawyer) => lawyer.location)).size}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">
                    Cities
                  </p>
                </div>
                <div className="p-3">
                  <p className="text-lg font-semibold text-[#e8d05b]">24/7</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">
                    Access
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#e8d05b] text-black">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/55">
                Need a starting point?
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Describe your situation to our AI assistant.
              </h2>
            </div>
            <Button
              onClick={() => navigate("/ai-legal-assistant")}
              className="self-start bg-black text-[#e8d05b] hover:bg-black/80 md:self-auto"
            >
              Get guidance <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FindLawyers;
