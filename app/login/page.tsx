"use client";
import { useState } from "react";
import { auth, db } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SecurityLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // NEW: State for eye icon
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
      console.error("Firebase Auth Error:", err);
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
          <button type="button" onClick={() => processAuth("admin@upnm.edu.my", "Qwer1234@")} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm transition-colors border border-slate-600 font-mono">
            Login as Admin
          </button>
          <button type="button" onClick={() => processAuth("moderator@upnm.edu.my", "Qwer1234@")} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm transition-colors border border-slate-600 font-mono">
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
            {/* NEW: Relative wrapper for the input and the eye icon */}
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full p-3 pr-10 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-red-500 transition-colors font-mono text-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  // Eye Slash Icon (Hide)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  // Eye Icon (Show)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
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