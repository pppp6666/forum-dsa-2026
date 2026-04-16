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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
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
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Create Secure Passphrase (Min 6 Chars)</label>
                <input type="password" required minLength={6} className="w-full p-3 bg-slate-800/50 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500" onChange={(e) => setFormData({...formData, password: e.target.value})} />
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
          <div className="flex flex-col items-center space-y-6 py-4 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Clearance Granted</h3>
              <p className="text-sm text-slate-400">Identity verified and logged.</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-lg border-4 border-emerald-500/20">
              <QRCodeSVG value={`verify-${qrValue}`} size={220} />
            </div>
            <Link href="/forum" className="mt-6 w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
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