"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link"; // NEW: We need this to route to the scanner

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const router = useRouter();

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

  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, "registrations"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const regData = snapshot.docs.map(doc => ({
        id: doc.id,
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

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 p-6">
      <div className="max-w-7xl mx-auto mt-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wider uppercase">Level 4: Security Admin</h1>
            <p className="text-blue-400 font-mono text-sm mt-1">Master Clearance Ledger • Active Headcount: {registrations.length}</p>
          </div>
          
          {/* NEW: Tactical Command Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link 
              href="/scanner" 
              className="flex-1 md:flex-none px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors text-sm font-bold tracking-widest flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
              </svg>
              LAUNCH OPTICS
            </Link>
            <button onClick={handleLogout} className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded transition-colors text-sm font-bold tracking-widest">
              TERMINATE
            </button>
          </div>
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