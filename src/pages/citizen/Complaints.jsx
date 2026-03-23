import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { MessageSquareWarning, MapPin, Send, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function Complaints() {
  const { currentUser } = useAuth();
  
  // Form State
  const [type, setType] = useState('Stubble Burning');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [description, setDescription] = useState('');
  
  // UX State
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const CAUSES = [
    'Stubble Burning',
    'Construction Dust',
    'Vehicular Emissions',
    'Industrial Waste',
    'Other'
  ];
  const CITIES = ['Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai'];

  useEffect(() => {
    // 1. Fetch user profile for default city
    const fetchUserCity = async () => {
      if (currentUser?.uid) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().city) {
            setCity(docSnap.data().city);
          }
        } catch (error) {
          console.error("Error fetching user city:", error);
        }
      }
    };
    fetchUserCity();
  }, [currentUser]);

  useEffect(() => {
    // 2. Snapshot listener for user's complaints
    if (!currentUser?.uid) return;
    
    const complaintsRef = collection(db, 'complaints');
    const q = query(complaintsRef, where('userId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort locally to avoid Firebase index requirement
      docs.sort((a, b) => {
        const timeA = a.timestamp?.toMillis() || 0;
        const timeB = b.timestamp?.toMillis() || 0;
        return timeB - timeA;
      });
      setComplaints(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return;
    
    setSubmitting(true);
    setSuccessMsg('');

    try {
      await addDoc(collection(db, 'complaints'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        type,
        location: location.trim(),
        city,
        description: description.trim(),
        status: 'Pending',
        timestamp: serverTimestamp()
      });
      
      setSuccessMsg('Complaint filed successfully. Authorities have been notified.');
      
      // Reset text fields
      setLocation('');
      setDescription('');
      
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      console.error("Error filing complaint:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    return new Date(timestamp.toMillis()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <MessageSquareWarning className="text-red-500" size={32} />
          Citizen Complaints
        </h1>
        <p className="text-slate-500 mt-2">
          Report active pollution sources directly to local environmental authorities.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="w-full lg:w-1/2 xs:w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 sticky top-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-400" />
              File New Complaint
            </h2>

            {successMsg && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4">
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                <span className="font-medium text-sm">{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type of Pollution</label>
                <select
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all appearance-none bg-slate-50"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specific Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="E.g. NH-48 Sector 32"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-slate-50"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none appearance-none bg-slate-50"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the extent of the pollution, time of day observed, etc."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none bg-slate-50"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-2"
              >
                {submitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={18} />
                )}
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="w-full lg:w-1/2 xs:w-full">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 min-h-[500px]">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-slate-400" />
              My Past Complaints
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-red-500 animate-spin"></div>
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={32} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-700">No complaints filed yet</h3>
                <p className="text-slate-500 text-sm mt-1">When you report an issue, it will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map(complaint => (
                  <div key={complaint.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg mb-2">
                          {complaint.type}
                        </span>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">
                          {complaint.location}, {complaint.city}
                        </h3>
                      </div>
                      
                      {complaint.status === 'Action Taken' ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                          <CheckCircle2 size={14} />
                          Action Taken
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100">
                          <Clock size={14} />
                          Pending
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      {complaint.description}
                    </p>
                    
                    <div className="text-xs text-slate-400 font-medium border-t border-slate-50 pt-3">
                      Filed on {formatDate(complaint.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
