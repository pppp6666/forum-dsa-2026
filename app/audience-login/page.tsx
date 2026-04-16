"use client";
import { useState } from "react";
import { auth, db } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AudienceLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Verify their clearance level is strictly 'audience'
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().role === "audience") {
        router.push("/forum");
      } else {
        // If an admin tries to log in through the audience portal, reject them
        setError("Access Denied. Ensure you are using the correct portal.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Invalid credentials. Please verify your email and passphrase.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1a] to-[#0a0f1a]">
      <div className="max-w-sm w-full bg-slate-900 border border-slate-700 p-8 rounded-lg shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase">Audience Portal</h1>
          <p className="text-xs text-emerald-400 mt-2 font-mono">Verify Event Credentials</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm font-mono text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Registered Email</label>
            <input 
              type="email" 
              required
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Secure Passphrase</label>
            <input 
              type="password" 
              required
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded mt-6 transition-colors tracking-wider text-sm disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Access Live Forum"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors underline">
            Need Credentials? Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}