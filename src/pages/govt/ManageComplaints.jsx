import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { MessageSquareWarning, Search, Filter, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All');
  const [processingId, setProcessingId] = useState(null);

  const CITIES = ['All', 'Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai'];

  useEffect(() => {
    // Fetch all complaints, order by time locally or from query
    // We will just fetch all and sort locally for safety if no index exists
    const complaintsRef = collection(db, 'complaints');
    const unsubscribe = onSnapshot(complaintsRef, (snapshot) => {
      let docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      docs.sort((a, b) => {
        const timeA = a.timestamp?.toMillis() || 0;
        const timeB = b.timestamp?.toMillis() || 0;
        return timeB - timeA;
      });
      
      setComplaints(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkActionTaken = async (id) => {
    setProcessingId(id);
    try {
      const docRef = doc(db, 'complaints', id);
      await updateDoc(docRef, { status: 'Action Taken', updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Error updating complaint status:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredComplaints = selectedCity === 'All' 
    ? complaints 
    : complaints.filter(c => c.city === selectedCity);

  const pendingCount = filteredComplaints.filter(c => c.status === 'Pending').length;
  const resolvedCount = filteredComplaints.filter(c => c.status === 'Action Taken').length;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.toMillis()).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <MessageSquareWarning className="text-blue-600" size={32} />
            Citizen Complaints
          </h1>
          <p className="text-slate-500 mt-2">
            Monitor, manage, and resolve environmental pollution reports.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <Filter size={18} className="text-slate-400 ml-2" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="pl-2 pr-8 py-1.5 border-none bg-transparent font-medium text-slate-700 outline-none focus:ring-0 cursor-pointer"
          >
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
            <MessageSquareWarning size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Filtered</p>
            <h3 className="text-2xl font-bold text-slate-800">{filteredComplaints.length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Requires Action</p>
            <h3 className="text-2xl font-bold text-slate-800">{pendingCount}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Resolved</p>
            <h3 className="text-2xl font-bold text-slate-800">{resolvedCount}</h3>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue Type</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4">Loading complaints...</p>
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-600">No complaints found</p>
                    <p className="text-sm">Everything looks good in this region.</p>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(complaint.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-800">{complaint.location}</div>
                      <div className="text-xs text-slate-500">{complaint.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {complaint.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 relative group max-w-xs">
                      <p className="text-sm text-slate-600 truncate">{complaint.description}</p>
                      {/* Tooltip for long descriptions */}
                      <div className="absolute z-10 hidden group-hover:block bg-slate-800 text-white text-xs rounded p-2 top-full mt-1 w-64 shadow-lg">
                        {complaint.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {complaint.status === 'Pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock size={12} />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          Action Taken
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {complaint.status === 'Pending' && (
                        <button
                          onClick={() => handleMarkActionTaken(complaint.id)}
                          disabled={processingId === complaint.id}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-bold rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        >
                          {processingId === complaint.id ? 'Processing...' : 'Mark Action Taken'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
