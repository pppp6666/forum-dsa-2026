"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Scanner } from '@yudiel/react-qr-scanner';
import Link from "next/link";

export default function SecurityScanner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "denied">("idle");
  const router = useRouter();

  // 1. Security Firewall: Verify Admin or Moderator Role
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        const role = userDocSnap.exists() ? userDocSnap.data().role : null;
        if (role === "admin" || role === "moderator") {
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

  // 2. Optical Decoding Logic
  const handleScan = async (text: string) => {
    // Prevent double-scanning while already processing a result
    if (scanStatus !== "idle") return;

    try {
      // Security Check: Does the QR code match our expected format?
      if (!text.startsWith("verify-")) {
        setScanStatus("denied");
        setScanResult({ error: "Invalid QR Format. Not a Forum DSA 2026 pass." });
        return;
      }

      // Extract the specific UID from the QR code
      const uid = text.replace("verify-", "");
      
      // Query the master ledger
      const docRef = doc(db, "registrations", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setScanStatus("success");
        setScanResult(docSnap.data());
      } else {
        setScanStatus("denied");
        setScanResult({ error: "Clearance ID not found in database. Forgery detected." });
      }
    } catch (error) {
      setScanStatus("denied");
      setScanResult({ error: "Network uplink failed during verification." });
    }
  };

  const resetScanner = () => {
    setScanStatus("idle");
    setScanResult(null);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 p-6 flex flex-col items-center">
      <div className="w-full max-w-md mt-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase">Access Control Node</h1>
          <p className="text-xs text-slate-400 mt-2 font-mono">MITEC Ballroom Perimeter Security</p>
        </div>

        {/* Dynamic Scanner Window */}
        <div className="bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden shadow-2xl relative">
          
          {scanStatus === "idle" && (
            <div className="relative">
              <div className="absolute top-0 left-0 w-full p-2 bg-black/50 text-center z-10 font-mono text-xs text-emerald-400 animate-pulse">
                OPTICS ACTIVE: AWAITING PASS...
              </div>
              <Scanner 
                onResult={(text, result) => handleScan(text)} 
                onError={(error) => console.log(error?.message)}
                options={{ delayBetweenScanSuccess: 2000 }}
              />
            </div>
          )}

          {scanStatus === "success" && (
            <div className="p-8 text-center bg-emerald-900/20 border-t-4 border-emerald-500">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-emerald-400 mb-1">CLEARANCE GRANTED</h2>
              <p className="text-white font-bold text-lg mt-4">{scanResult?.name}</p>
              <p className="text-slate-400 text-sm mb-6">{scanResult?.organization}</p>
              <button onClick={resetScanner} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded border border-slate-600 transition-colors">
                Scan Next Attendee
              </button>
            </div>
          )}

          {scanStatus === "denied" && (
            <div className="p-8 text-center bg-red-900/20 border-t-4 border-red-500">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-red-400 mb-1">ACCESS DENIED</h2>
              <p className="text-slate-300 text-sm mt-4 mb-6">{scanResult?.error}</p>
              <button onClick={resetScanner} className="w-full bg-red-900/50 hover:bg-red-800 text-white font-bold py-3 rounded border border-red-500/50 transition-colors">
                Reset Optics
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/admin" className="text-sm text-slate-500 hover:text-white transition-colors underline">
            Return to Master Ledger
          </Link>
        </div>

      </div>
    </div>
  );
}