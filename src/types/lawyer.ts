export interface LawyerCoordinates {
  lat: number;
  lng: number;
}

export interface LawyerProfile {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  fees: string;
  languages: string[];
  verified: boolean;
  available: boolean;
  image: string;
  consultations: number;
  successRate: number;
  description: string;
  coordinates?: LawyerCoordinates;
  phone?: string;
  website?: string;
}

const cityCoordinates: Record<string, LawyerCoordinates> = {
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  delhi: { lat: 28.6139, lng: 77.209 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  ambala: { lat: 30.3787, lng: 76.7806 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  pune: { lat: 18.5204, lng: 73.8567 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  surat: { lat: 21.1702, lng: 72.8311 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  kanpur: { lat: 26.4499, lng: 80.3319 },
};

export const getCoordinatesForLocation = (
  location: string,
): LawyerCoordinates | undefined => {
  const normalizedLocation = location.trim().toLowerCase();

  if (!normalizedLocation) {
    return undefined;
  }

  if (cityCoordinates[normalizedLocation]) {
    return cityCoordinates[normalizedLocation];
  }

  const locationPart = normalizedLocation.split(",")[0]?.trim();
  return locationPart ? cityCoordinates[locationPart] : undefined;
};
