"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

export default function ForumMainInterface() {
  const [qaData, setQaData] = useState({ senderName: "", targetPanelist: "Any Panelist", question: "" });
  const [qaLoading, setQaLoading] = useState(false);
  const [qaSuccess, setQaSuccess] = useState(false);
  const [liveFeed, setLiveFeed] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "questions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLiveFeed(feedData);
    });
    return () => unsubscribe();
  }, []);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQaLoading(true);
    try {
      await addDoc(collection(db, "questions"), {
        ...qaData,
        timestamp: new Date(),
        status: "pending"
      });
      setQaSuccess(true);
      setQaData({ senderName: "", targetPanelist: "Any Panelist", question: "" });
      setTimeout(() => setQaSuccess(false), 4000);
    } catch (error) {
      alert("Failed to transmit question.");
    }
    setQaLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 font-sans p-6">
      <div className="max-w-6xl mx-auto mt-8">
        
        <div className="border-b border-slate-700 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
              Forum DSA <span className="text-blue-500">2026</span>
            </h1>
            <p className="text-lg text-slate-400">AI & Cyber Security as the Vanguard of Digital Defence</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 px-4 py-2 rounded text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Live Location</p>
            <p className="text-emerald-400 font-mono text-sm">Ballroom 2, MITEC</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-xl relative overflow-hidden flex flex-col h-[600px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-500"></div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2 shrink-0">
              <span className="w-2 h-6 bg-purple-500 rounded-sm"></span> Direct Comms Channel
            </h2>
            <p className="text-sm text-slate-400 mb-6 shrink-0">Submit your questions to the panel in real-time.</p>

            <div className="shrink-0 mb-8 border-b border-slate-700 pb-8">
              {qaSuccess ? (
                <div className="bg-emerald-900/30 border border-emerald-500 p-6 rounded text-center">
                  <h3 className="text-emerald-400 font-bold mb-2">Transmission Successful</h3>
                  <p className="text-sm text-slate-300">Your question is now visible on the live feed.</p>
                </div>
              ) : (
                <form onSubmit={handleQuestionSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input type="text" placeholder="Your Name (Optional)" className="w-full p-3 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500 text-sm" value={qaData.senderName} onChange={(e) => setQaData({...qaData, senderName: e.target.value})} />
                    </div>
                    <div>
                      <select className="w-full p-3 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500 text-sm" value={qaData.targetPanelist} onChange={(e) => setQaData({...qaData, targetPanelist: e.target.value})}>
                        <option>Any Panelist</option>
                        <option>YBhg. Dato' Seri Dr. Ahmad Jailani</option>
                        <option>YBhg. Laksamana Muda Dato' Fadhil</option>
                        <option>YBhg. Dato' Nonee Ashirin</option>
                        <option>YBhg. Prof. Ts. Dr. Noor Afiza</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <textarea required rows={2} className="w-full p-3 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500 resize-none text-sm" placeholder="Type your question here..." value={qaData.question} onChange={(e) => setQaData({...qaData, question: e.target.value})}></textarea>
                  </div>
                  <button type="submit" disabled={qaLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded disabled:opacity-50 transition-colors shadow-lg text-sm">
                    {qaLoading ? "Transmitting..." : "Send Question"}
                  </button>
                </form>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 sticky top-0 bg-slate-900 py-2">Live Question Feed</h3>
              <div className="space-y-3">
                {liveFeed.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No questions submitted yet.</p>
                ) : (
                  liveFeed.map((q) => (
                    <div key={q.id} className="bg-slate-800/50 p-4 rounded border border-slate-700/50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-purple-400">TO: {q.targetPanelist}</span>
                        {q.status === 'addressed' && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">ANSWERED</span>}
                      </div>
                      <p className="text-sm text-white mb-2">{q.question}</p>
                      <p className="text-xs text-slate-500 font-mono">FROM: {q.senderName || "Anonymous"}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-xl h-[600px] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-sm"></span> Official Itinerary
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-20 shrink-0 font-mono text-slate-400 text-sm mt-1">09:30</div>
                <div>
                  <h4 className="text-white font-semibold">Ketibaan Tetamu & Keynote</h4>
                  <p className="text-sm text-slate-400 mt-1">Nyanyian Negaraku, Tayangan Montaj.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-20 shrink-0 font-mono text-emerald-400 font-bold text-sm mt-1">10:50</div>
                <div className="bg-slate-800 p-4 rounded border border-slate-700 w-full">
                  <h4 className="text-white font-bold mb-3">Sesi Forum Utama</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• <span className="text-emerald-400">Panelis 1:</span> YBhg. Dato' Seri Dr. Ahmad Jailani</li>
                    <li>• <span className="text-emerald-400">Panelis 2:</span> YBhg. Laksamana Muda Dato' Fadhil</li>
                    <li>• <span className="text-emerald-400">Panelis 3:</span> YBhg. Dato' Nonee Ashirin</li>
                    <li>• <span className="text-emerald-400">Panelis 4:</span> YBhg. Prof. Ts. Dr. Noor Afiza</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-20 shrink-0 font-mono text-slate-400 text-sm mt-1">12:30</div>
                <div>
                  <h4 className="text-white font-semibold">Sesi Soal Jawab & Penutup</h4>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}