"use client";
import { useState } from "react";
import { auth, db } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SecurityLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const processAuth = async (targetEmail: string, targetPass: string) => {
    setLoading(true);
    setError("");
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, targetPass);
      const user = userCredential.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.role === "admin") {
          router.push("/admin");
        } else if (userData.role === "moderator") {
          router.push("/moderator");
        } else {
          setError("Clearance level undefined. Access denied.");
          setLoading(false);
        }
      } else {
        setError("Identity verified, but clearance records missing.");
        setLoading(false);
      }
    } catch (err: any) {
      // This logs the exact technical error to your browser console
      console.error("Firebase Auth Error:", err);
      // This displays the specific Firebase error code on your screen
      setError(`Auth Rejected: ${err.code || err.message}`);
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    processAuth(email, password);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1a] to-[#0a0f1a]">
      <div className="max-w-sm w-full bg-slate-900 border border-slate-700 p-8 rounded-lg shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase">Restricted Area</h1>
          <p className="text-xs text-red-400 mt-2 font-mono">Level 4 Clearance Required</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm font-mono text-center">
            {error}
          </div>
        )}

        <div className="mb-6 space-y-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <p className="text-xs text-slate-400 uppercase tracking-wider text-center mb-2">Evaluator Quick Access</p>
          <button 
            type="button"
            onClick={() => processAuth("admin@upnm.edu.my", "Qwer1234@")}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm transition-colors border border-slate-600 font-mono"
          >
            Login as Admin
          </button>
          <button 
            type="button"
            onClick={() => processAuth("moderator@upnm.edu.my", "Qwer1234@")}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm transition-colors border border-slate-600 font-mono"
          >
            Login as Moderator
          </button>
        </div>

        <div className="flex items-center mb-6">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="px-3 text-xs text-slate-500 uppercase">OR MANUAL ENTRY</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Identification</label>
            <input 
              type="email" 
              required
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-red-500 transition-colors font-mono text-sm"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Passphrase</label>
            <input 
              type="password" 
              required
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-red-500 transition-colors font-mono text-sm"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-4 rounded mt-6 transition-colors uppercase tracking-wider text-sm disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Initialize Uplink"}
          </button>
        </form>
      </div>
    </div>
  );
}