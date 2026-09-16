import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { lawyers as fallbackLawyers } from "@/data/lawyers";
import {
  LawyerCoordinates,
  LawyerProfile,
  getCoordinatesForLocation,
} from "@/types/lawyer";

type FirestoreLawyer = Partial<LawyerProfile> & {
  languages?: string[] | string;
  coordinates?: LawyerCoordinates;
};

const normalizeLawyer = (
  id: string,
  lawyer: FirestoreLawyer,
  fallback?: Partial<LawyerProfile>,
): LawyerProfile => {
  const location = lawyer.location || fallback?.location || "";

  return {
    id,
    name: lawyer.name || fallback?.name || "Unnamed Lawyer",
    specialty: lawyer.specialty || fallback?.specialty || "General Law",
    rating: lawyer.rating ?? fallback?.rating ?? 0,
    reviews: lawyer.reviews ?? fallback?.reviews ?? 0,
    experience: lawyer.experience || fallback?.experience || "Not specified",
    location,
    fees: lawyer.fees || fallback?.fees || "Contact for pricing",
    languages: Array.isArray(lawyer.languages)
      ? lawyer.languages
      : typeof lawyer.languages === "string"
        ? lawyer.languages
            .split(",")
            .map((language) => language.trim())
            .filter(Boolean)
        : fallback?.languages || ["English"],
    verified: lawyer.verified ?? fallback?.verified ?? false,
    available: lawyer.available ?? fallback?.available ?? false,
    image: lawyer.image || fallback?.image || "/placeholder.svg",
    consultations: lawyer.consultations ?? fallback?.consultations ?? 0,
    successRate: lawyer.successRate ?? fallback?.successRate ?? 0,
    description:
      lawyer.description ||
      fallback?.description ||
      "Profile details will appear here soon.",
    coordinates:
      lawyer.coordinates ||
      fallback?.coordinates ||
      getCoordinatesForLocation(location),
    phone: lawyer.phone || fallback?.phone,
    website: lawyer.website || fallback?.website,
  };
};

const fallbackProfiles: LawyerProfile[] = fallbackLawyers.map((lawyer) =>
  normalizeLawyer(String(lawyer.id), lawyer),
);

export const useRealtimeLawyers = () => {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>(fallbackProfiles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "lawyers"),
      (snapshot) => {
        if (snapshot.empty) {
          setLawyers(fallbackProfiles);
          setLoading(false);
          return;
        }

        const liveLawyers = snapshot.docs.map((lawyerDoc) => {
          const fallback = fallbackProfiles.find(
            (lawyer) => lawyer.id === lawyerDoc.id,
          );

          return normalizeLawyer(
            lawyerDoc.id,
            lawyerDoc.data() as FirestoreLawyer,
            fallback,
          );
        });

        const liveLawyerIds = new Set(liveLawyers.map((lawyer) => lawyer.id));
        const mergedLawyers = [
          ...liveLawyers,
          ...fallbackProfiles.filter((lawyer) => !liveLawyerIds.has(lawyer.id)),
        ];

        setLawyers(mergedLawyers);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to lawyers:", error);
        setLawyers(fallbackProfiles);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return { lawyers, loading };
};
