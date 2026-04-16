"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, onSnapshot, query, orderBy, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ModeratorDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists() && userDocSnap.data().role === "moderator") {
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

    const q = query(collection(db, "questions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(qData);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const markAddressed = async (id: string) => {
    await updateDoc(doc(db, "questions", id), {
      status: "addressed"
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 p-6">
      <div className="max-w-6xl mx-auto mt-8">
        <div className="flex justify-between items-center border-b border-slate-700 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wider uppercase">Level 4: Moderator Command</h1>
            <p className="text-emerald-400 font-mono text-sm mt-1">Live Comms Feed Active</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded transition-colors text-sm font-bold tracking-widest">
            TERMINATE SESSION
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {questions.length === 0 ? (
            <div className="text-center p-12 bg-slate-900 border border-slate-700 rounded-lg">
              <p className="text-slate-500 font-mono">Awaiting incoming transmissions...</p>
            </div>
          ) : (
            questions.map((q) => (
              <div key={q.id} className={`p-6 rounded-lg border transition-all ${q.status === 'addressed' ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-800 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)]'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-slate-900 text-purple-400 font-mono text-xs px-2 py-1 rounded border border-purple-500/30">
                        TARGET: {q.targetPanelist}
                      </span>
                      <span className="text-slate-400 text-sm">
                        FROM: <span className="text-white font-bold">{q.senderName || "Anonymous"}</span>
                      </span>
                      {q.status === 'addressed' && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-bold">ADDRESSED</span>
                      )}
                    </div>
                    <p className="text-lg text-white">{q.question}</p>
                  </div>
                  {q.status !== 'addressed' && (
                    <button onClick={() => markAddressed(q.id)} className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-bold transition-colors">
                      Mark Addressed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}