"use client";
import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({ name: "", email: "", organization: "", password: "" });
  const [qrValue, setQrValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // NEW: Strict Password Policy Regex
    // Requires: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(formData.password)) {
      setError("Passphrase must be at least 8 characters and include uppercase, lowercase, a number, and a special character.");
      setLoading(false);
      return; // Stop the registration process
    }
    
    try {
      // ... your existing Firebase auth creation code ...
      // 1. Create secure Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Assign the 'audience' role in the database
      await setDoc(doc(db, "users", user.uid), {
        role: "audience"
      });

      // 3. Save their registration details, linking it exactly to their Auth UID
      await setDoc(doc(db, "registrations", user.uid), {
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
        role: "audience",
        timestamp: new Date()
      });

      setQrValue(user.uid);
    } catch (err: any) {
      console.error("Registration Error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email already registered. Please proceed to Audience Portal to log in.");
      } else if (err.code === "auth/weak-password") {
        setError("Passphrase must be at least 6 characters.");
      } else {
        setError("Registration failed. Secure connection interrupted.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-[#0a0f1a] to-[#0a0f1a]">
      
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full bg-slate-800/50 border border-slate-700 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
           <span className="text-emerald-500 font-mono text-xs tracking-widest uppercase">UPNM Encrypted Channel</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">FORUM DSA 2026</h1>
        <h2 className="text-md text-slate-400 max-w-lg mx-auto">
          AI & Cyber Security as the Vanguard of Digital Defence
        </h2>
      </div>

      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-slate-700/80 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600"></div>

        {!qrValue ? (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-xs font-mono text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" required className="w-full p-3 bg-slate-800/50 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500" onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Official Email</label>
                <input type="email" required className="w-full p-3 bg-slate-800/50 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500" onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Unit / Organization</label>
                <input type="text" required className="w-full p-3 bg-slate-800/50 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500" onChange={(e) => setFormData({...formData, organization: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Create Secure Passphrase (Min 8 Chars)</label>
                <input type="password" required minLength={6} className="w-full p-3 bg-slate-800/50 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500" onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Create Secure Passphrase</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="w-full p-3 pr-10 bg-slate-800/50 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500" 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
                {/* NEW: Policy Helper Text */}
                <p className="text-[10px] text-slate-500 mt-2">
                  Must contain 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&).
                </p>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded mt-4 transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50">
                {loading ? "Encrypting Data..." : "Generate Security Pass"}
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
              <p className="text-xs text-slate-400 mb-3">Already Registered?</p>
              <Link href="/audience-login" className="inline-block w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500 font-semibold py-2.5 rounded transition-all text-sm">
                Enter Audience Portal
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-700 w-full mt-4">
            
            {/* NEW: The Tactical Digital ID Badge */}
            <div className="w-full max-w-sm bg-slate-800 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.15)] relative">
              
              {/* Badge Header */}
              <div className="bg-emerald-900/40 p-4 border-b border-emerald-500/30 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50"></div>
                <p className="text-emerald-400 font-bold tracking-widest uppercase text-sm">Official Security Pass</p>
                <p className="text-slate-400 text-xs font-mono mt-1">FORUM DSA 2026 • MITEC</p>
              </div>

              {/* QR Code Area with Scanner Brackets */}
              <div className="p-8 flex justify-center relative bg-slate-900/50">
                {/* Tactical Corner Brackets */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-500/70"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-500/70"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-500/70"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-500/70"></div>

                <div className="p-3 bg-white rounded-xl relative overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <QRCodeSVG value={`verify-${qrValue}`} size={190} />
                  
                  {/* The Simulated Scanner Laser */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_10px_red] animate-[ping_2.5s_ease-in-out_infinite] opacity-60"></div>
                </div>
              </div>

              {/* Badge Footer */}
              <div className="bg-slate-800 p-5 text-center border-t border-slate-700 relative">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Clearance ID</p>
                <p className="font-mono text-emerald-400 text-lg tracking-widest">{qrValue}</p>
                <p className="text-[10px] text-slate-500 mt-3 font-mono">
                  PRESENT TO PHYSICAL PERIMETER SCANNER
                </p>
              </div>
            </div>

            <Link href="/forum" className="mt-8 w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] uppercase tracking-wider text-sm">
              Enter Main Forum Portal →
            </Link>
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center text-xs text-slate-500 font-mono flex flex-col items-center space-y-3">
        <div>
          <p>System Architecture by UPNM CS Honors Protocol</p>
          <p>Secured via Firebase & Next.js</p>
        </div>
        <Link href="/login" className="px-4 py-1 mt-2 border border-slate-700/50 rounded text-slate-600 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors">
          [ Authorized Personnel Login ]
        </Link>
      </div>
    </div>
  );
}