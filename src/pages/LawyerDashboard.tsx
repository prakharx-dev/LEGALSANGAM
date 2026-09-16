import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Calendar, FileText, Users, Loader2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LawyerProfile } from "@/types/lawyer";

const createDefaultProfile = (user: {
  uid: string;
  displayName: string | null;
  email: string | null;
}): LawyerProfile => ({
  id: user.uid,
  name: user.displayName || user.email || "Lawyer",
  specialty: "General Law",
  rating: 0,
  reviews: 0,
  experience: "0 years",
  location: "",
  fees: "Contact for pricing",
  languages: ["English"],
  verified: false,
  available: true,
  image: "/placeholder.svg",
  consultations: 0,
  successRate: 0,
  description: "Add your specialization, location, fees, and availability.",
});

const LawyerDashboard = () => {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [languagesInput, setLanguagesInput] = useState("English");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (!user || role !== "lawyer") {
      return;
    }

    const profileRef = doc(db, "lawyers", user.uid);
    const unsubscribe = onSnapshot(
      profileRef,
      (snapshot) => {
        const nextProfile = snapshot.exists()
          ? ({
              ...createDefaultProfile(user),
              id: snapshot.id,
              ...snapshot.data(),
            } as LawyerProfile)
          : createDefaultProfile(user);

        setProfileError("");
        setProfile(nextProfile);
        setLanguagesInput(nextProfile.languages.join(", "));
      },
      (error) => {
        console.error("Failed to load lawyer profile:", error);
        setProfileError(
          "Unable to load your public profile. Please refresh and try again.",
        );
      },
    );

    return unsubscribe;
  }, [role, user]);

  const updateProfileField = <K extends keyof LawyerProfile>(
    field: K,
    value: LawyerProfile[K],
  ) => {
    setProfile((currentProfile) =>
      currentProfile ? { ...currentProfile, [field]: value } : currentProfile,
    );
  };

  const handleProfileSave = async () => {
    if (!user || !profile) {
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    const languages = languagesInput
      .split(",")
      .map((language) => language.trim())
      .filter(Boolean);

    try {
      await setDoc(
        doc(db, "lawyers", user.uid),
        {
          ...profile,
          languages: languages.length > 0 ? languages : ["English"],
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setSaveMessage("Profile saved. Clients now see the latest version live.");
    } catch (error) {
      console.error("Failed to save lawyer profile:", error);
      setSaveMessage("Unable to save changes right now. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || !role) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (role !== "lawyer") {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lawyer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.displayName || user.email}!
          </p>
        </div>

        {profileError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{profileError}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Cases
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                +0 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Public Availability
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.available ? "Live" : "Paused"}
              </div>
              <p className="text-xs text-muted-foreground">
                Updates client search instantly
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => navigate("/booking")} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Manage Cases
              </Button>
              <Button
                onClick={() => navigate("/find")}
                className="w-full"
                variant="outline"
              >
                <Users className="mr-2 h-4 w-4" />
                View Public Listing
              </Button>
              <Button
                onClick={() => navigate("/profile")}
                className="w-full"
                variant="outline"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Account Overview
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center justify-between text-sm">
                  <span>New client inquiry</span>
                  <Badge variant="secondary">Today</Badge>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span>Profile synced</span>
                  <Badge variant="secondary">Live</Badge>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span>Availability updated</span>
                  <Badge variant="secondary">Realtime</Badge>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {user.displayName || "Not set"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="default">Lawyer</Badge>
                  <span className="text-sm text-muted-foreground">Role</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Live Public Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Update your public listing here. Changes appear on client-facing
                discovery pages in real time.
              </p>

              {profile && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-name">Display Name</Label>
                      <Input
                        id="lawyer-name"
                        value={profile.name}
                        onChange={(event) =>
                          updateProfileField("name", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-specialty">Specialty</Label>
                      <Input
                        id="lawyer-specialty"
                        value={profile.specialty}
                        onChange={(event) =>
                          updateProfileField("specialty", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-location">Location</Label>
                      <Input
                        id="lawyer-location"
                        value={profile.location}
                        onChange={(event) =>
                          updateProfileField("location", event.target.value)
                        }
                        placeholder="Delhi, Mumbai, Bangalore..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-experience">Experience</Label>
                      <Input
                        id="lawyer-experience"
                        value={profile.experience}
                        onChange={(event) =>
                          updateProfileField("experience", event.target.value)
                        }
                        placeholder="10 years"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-fees">Consultation Fee</Label>
                      <Input
                        id="lawyer-fees"
                        value={profile.fees}
                        onChange={(event) =>
                          updateProfileField("fees", event.target.value)
                        }
                        placeholder="Rs 999/consultation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-languages">Languages</Label>
                      <Input
                        id="lawyer-languages"
                        value={languagesInput}
                        onChange={(event) =>
                          setLanguagesInput(event.target.value)
                        }
                        placeholder="English, Hindi"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lawyer-description">About You</Label>
                    <Textarea
                      id="lawyer-description"
                      value={profile.description}
                      onChange={(event) =>
                        updateProfileField("description", event.target.value)
                      }
                      rows={5}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">
                        Available for new consultations
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Toggle this to instantly update your live availability.
                      </p>
                    </div>
                    <Switch
                      checked={profile.available}
                      onCheckedChange={(checked) =>
                        updateProfileField("available", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      {saveMessage}
                    </p>
                    <Button onClick={handleProfileSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Live Profile"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;
