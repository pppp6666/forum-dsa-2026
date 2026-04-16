"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const router = useRouter();

  // 1. Security Firewall: Verify Admin Role
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
          setIsAuthenticated(true);
        } else {
          router.push("/login"); 
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  // 2. Real-Time Uplink: Fetch Registrations
  useEffect(() => {
    if (!isAuthenticated) return;

    // Listen to the registrations collection, ordered by newest first
    const q = query(collection(db, "registrations"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const regData = snapshot.docs.map(doc => ({
        id: doc.id, // The document ID is their Clearance ID
        ...doc.data()
      }));
      setRegistrations(regData);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!isAuthenticated) return null; // Prevent UI flicker before auth clears

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 p-6">
      <div className="max-w-7xl mx-auto mt-8">
        
        {/* Dashboard Header */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wider uppercase">Level 4: Security Admin</h1>
            <p className="text-blue-400 font-mono text-sm mt-1">Master Clearance Ledger • Active Headcount: {registrations.length}</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded transition-colors text-sm font-bold tracking-widest">
            TERMINATE SESSION
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700 text-xs uppercase tracking-wider text-slate-400">
                  <th className="p-4 font-semibold">Authorized Name</th>
                  <th className="p-4 font-semibold">Official Email</th>
                  <th className="p-4 font-semibold">Unit / Organization</th>
                  <th className="p-4 font-semibold">Clearance ID (UID)</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                      No records found in the database.
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-white font-medium">{reg.name || "N/A"}</td>
                      <td className="p-4 text-slate-300">{reg.email || "N/A"}</td>
                      <td className="p-4 text-slate-400">{reg.organization || "N/A"}</td>
                      <td className="p-4">
                        <span className="font-mono text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-500/30">
                          {reg.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">
                          CLEARED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}