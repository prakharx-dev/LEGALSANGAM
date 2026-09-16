import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  listenToEscrows,
  listenToProviderEscrows,
} from "@/services/escrowService";

interface DashboardData {
  activeBookings: number;
  totalLawyersConsulted: number;
  pendingPayments: number;
  activeCases: number;
  totalClients: number;
  notifications: Notification[];
  analytics: AnalyticsData;
  loading: boolean;
  error: string | null;
}

interface Notification {
  id: string;
  message: string;
  type: "info" | "warning" | "success";
  timestamp: Date;
}

interface AnalyticsData {
  monthlyBookings: { month: string; count: number }[];
  monthlyEarnings: { month: string; amount: number }[];
}

interface BookingData {
  id: string;
  status: string;
  lawyerId: string;
  clientId: string;
}

interface EscrowData {
  id: string;
  status: string;
  amount: number;
}

export const useDashboardData = () => {
  const { user, role } = useAuth();
  const [data, setData] = useState<DashboardData>({
    activeBookings: 0,
    totalLawyersConsulted: 0,
    pendingPayments: 0,
    activeCases: 0,
    totalClients: 0,
    notifications: [],
    analytics: { monthlyBookings: [], monthlyEarnings: [] },
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: null,
        activeBookings: 0,
        totalLawyersConsulted: 0,
        pendingPayments: 0,
        activeCases: 0,
        totalClients: 0,
        notifications: [],
      }));
      return;
    }

    const unsubscribers: (() => void)[] = [];

    const handleListenerError = (error: Error) => {
      console.error("Error listening to dashboard data:", error);
      setData((prev) => ({
        ...prev,
        error: "Unable to load dashboard data. Please refresh and try again.",
        loading: false,
      }));
    };

    const fetchData = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch bookings/cases based on role
        if (role !== "lawyer") {
          const bookingsQuery = query(
            collection(db, "bookings"),
            where("clientId", "==", user.uid),
          );

          const unsubscribeBookings = onSnapshot(
            bookingsQuery,
            (snapshot) => {
              const bookings = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as BookingData[];
              const activeBookings = bookings.filter(
                (b) => b.status === "active" || b.status === "confirmed",
              ).length;
              const totalLawyersConsulted = new Set(
                bookings.map((b) => b.lawyerId),
              ).size;

              setData((prev) => ({
                ...prev,
                activeBookings,
                totalLawyersConsulted,
              }));
            },
            handleListenerError,
          );
          unsubscribers.push(unsubscribeBookings);

          // Fetch escrow data for pending payments
          const unsubscribeEscrows = listenToEscrows(
            user.uid,
            (escrows: EscrowData[]) => {
              const pendingPayments = escrows
                .filter((e) => e.status === "pending")
                .reduce((sum, e) => sum + (e.amount || 0), 0);
              setData((prev) => ({ ...prev, pendingPayments }));
            },
          );
          unsubscribers.push(unsubscribeEscrows);
        } else if (role === "lawyer") {
          const casesQuery = query(
            collection(db, "bookings"),
            where("lawyerId", "==", user.uid),
          );

          const unsubscribeCases = onSnapshot(
            casesQuery,
            (snapshot) => {
              const cases = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as BookingData[];
              const activeCases = cases.filter(
                (c) => c.status === "active" || c.status === "confirmed",
              ).length;
              const totalClients = new Set(cases.map((c) => c.clientId)).size;

              setData((prev) => ({ ...prev, activeCases, totalClients }));
            },
            handleListenerError,
          );
          unsubscribers.push(unsubscribeCases);

          const unsubscribeProviderEscrows = listenToProviderEscrows(
            user.uid,
            (escrows: EscrowData[]) => {
              const pendingPayments = escrows
                .filter((e) => e.status === "pending")
                .reduce((sum, e) => sum + (e.amount || 0), 0);
              setData((prev) => ({ ...prev, pendingPayments }));
            },
          );
          unsubscribers.push(unsubscribeProviderEscrows);
        }

        // Fetch notifications (assuming a notifications collection)
        const notificationsQuery = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid),
          limit(5),
        );

        const unsubscribeNotifications = onSnapshot(
          notificationsQuery,
          (snapshot) => {
            const notifications = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate() || new Date(),
            })) as Notification[];
            setData((prev) => ({ ...prev, notifications }));
          },
          handleListenerError,
        );
        unsubscribers.push(unsubscribeNotifications);

        // Fetch analytics data (simplified - in real app, this would be more complex)
        // For now, we'll generate mock analytics data
        const mockAnalytics: AnalyticsData = {
          monthlyBookings: [
            { month: "Jan", count: 5 },
            { month: "Feb", count: 8 },
            { month: "Mar", count: 12 },
            { month: "Apr", count: 7 },
            { month: "May", count: 15 },
            { month: "Jun", count: 10 },
          ],
          monthlyEarnings: [
            { month: "Jan", amount: 2500 },
            { month: "Feb", amount: 3200 },
            { month: "Mar", amount: 4100 },
            { month: "Apr", amount: 2800 },
            { month: "May", amount: 5500 },
            { month: "Jun", amount: 3800 },
          ],
        };

        setData((prev) => ({
          ...prev,
          analytics: mockAnalytics,
          loading: false,
        }));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setData((prev) => ({
          ...prev,
          error: "Failed to load dashboard data",
          loading: false,
        }));
      }
    };

    fetchData();

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [user, role]);

  return data;
};
