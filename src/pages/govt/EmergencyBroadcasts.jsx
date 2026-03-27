import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Radio, AlertTriangle, ShieldCheck, Clock, PowerOff } from 'lucide-react';

export default function EmergencyBroadcasts() {
  const [selectedCity, setSelectedCity] = useState('Delhi NCR');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [history, setHistory] = useState([]);
  
  const CITIES = ['Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai'];

  // Fetch History
  useEffect(() => {
    const broadcastsRef = collection(db, 'broadcasts');
    // Basic query avoiding complex indices
    const q = query(broadcastsRef, where('city', '==', selectedCity));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort in JS to prevent Firebase index errors
      fetched.sort((a, b) => {
        const tA = a.timestamp?.toMillis() || 0;
        const tB = b.timestamp?.toMillis() || 0;
        return tB - tA;
      });
      
      setHistory(fetched);
    });

    return () => unsubscribe();
  }, [selectedCity]);

  const handleSendAlert = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, 'broadcasts'), {
        message: message.trim(),
        city: selectedCity,
        active: true,
        timestamp: serverTimestamp()
      });
      setMessage('');
      setSuccessMsg('Emergency alert broadcasted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error broadcasting alert:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      const docRef = doc(db, 'broadcasts', id);
      await updateDoc(docRef, { active: false });
    } catch (err) {
      console.error('Error deactivating broadcast:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Radio className="text-red-600" size={32} />
            Emergency Broadcast Center
          </h1>
          <p className="text-slate-500 mt-2">
            Issue and manage critical public health and safety alerts.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <span className="text-sm font-medium text-slate-500 ml-2">Jurisdiction:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="pl-2 pr-8 py-1.5 border-none bg-transparent font-bold text-slate-800 outline-none focus:ring-0 cursor-pointer"
          >
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Top Section: Send Alert */}
      <div className="bg-white rounded-2xl shadow-md border border-red-100 overflow-hidden mb-8">
        <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-2">
          <AlertTriangle className="text-red-600" size={20} />
          <h2 className="text-lg font-bold text-red-900">Issue New Broadcast</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSendAlert} className="flex flex-col gap-4">
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none text-slate-800 placeholder:text-slate-400"
              rows="3"
              placeholder={`Enter critical alert message for ${selectedCity}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
            
            <div className="flex justify-between items-center">
              <div>
                {successMsg && (
                  <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <ShieldCheck size={16} /> {successMsg}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="bg-red-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 shadow-md flex items-center gap-2"
              >
                {isSending ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Radio size={20} />
                )}
                {isSending ? 'Sending...' : 'Broadcast Alert'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Section: Broadcast History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="text-slate-600" size={24} />
          <h2 className="text-xl font-bold text-slate-800">Broadcast History ({selectedCity})</h2>
        </div>

        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map(item => (
              <div 
                key={item.id} 
                className={`p-5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${
                  item.active ? 'border-red-200 bg-red-50/30' : 'border-slate-100 bg-slate-50'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      item.active ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {item.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {item.timestamp ? new Date(item.timestamp.toMillis()).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <p className={`text-sm ${item.active ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                    {item.message}
                  </p>
                </div>
                
                {item.active && (
                  <button
                    onClick={() => handleDeactivate(item.id)}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-100 hover:text-red-600 transition-colors shadow-sm"
                  >
                    <PowerOff size={16} /> Deactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-100 dashed">
            No broadcast history found for {selectedCity}.
          </div>
        )}
      </div>
    </div>
  );
}
