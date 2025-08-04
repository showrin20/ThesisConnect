import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';
import { Plus, Edit, Trash2 } from 'lucide-react';

import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';

export default function MyPublications() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingPublication, setEditingPublication] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    journal: '',
    year: '',
    doi: '',
    tags: '',
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const fetchMyPublications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/publications/my-publications');
      setPublications(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPublications();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        authors: formData.authors.split(',').map(a => a.trim()),
      };

      const res = await axios.put(`/publications/${editingPublication._id}`, payload);
      setEditingPublication(null);
      setFormData({ title: '', authors: '', journal: '', year: '', doi: '', tags: '' });
      fetchMyPublications();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update publication');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this publication?')) return;
    try {
      await axios.delete(`/publications/${id}`);
      fetchMyPublications();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete publication');
    }
  };

  const startEditing = (pub) => {
    setEditingPublication(pub);
    setFormData({
      title: pub.title || '',
      authors: (pub.authors || []).join(', '),
      journal: pub.journal || '',
      year: pub.year || '',
      doi: pub.doi || '',
      tags: (pub.tags || []).join(', '),
    });
  };

  const cancelForm = () => {
    setEditingPublication(null);
    setFormData({ title: '', authors: '', journal: '', year: '', doi: '', tags: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20">
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative flex h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} projects={[]} />

        <div className="flex-1 flex flex-col lg:ml-0">
          <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} user={user} onLogout={handleLogout} isLoggingOut={isLoggingOut} />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto">
              <h1 className="text-4xl font-bold mb-8 text-center">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  My Publications
                </span>
              </h1>

              {editingPublication && (
                <form onSubmit={handleUpdate} className="max-w-2xl mx-auto bg-white/5 backdrop-blur-lg rounded-xl p-8 mb-8 border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white">Edit Publication</h2>
                    <button type="button" onClick={cancelForm} className="text-gray-400 hover:text-white text-2xl">✕</button>
                  </div>

                  <div className="space-y-4">
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Title" className="w-full p-3 rounded-lg bg-slate-800/50 text-white" />
                    <input type="text" name="authors" value={formData.authors} onChange={handleChange} required placeholder="Authors (comma separated)" className="w-full p-3 rounded-lg bg-slate-800/50 text-white" />
                    <input type="text" name="journal" value={formData.journal} onChange={handleChange} required placeholder="Journal / Conference" className="w-full p-3 rounded-lg bg-slate-800/50 text-white" />
                    <input type="text" name="year" value={formData.year} onChange={handleChange} required placeholder="Year" className="w-full p-3 rounded-lg bg-slate-800/50 text-white" />
                    <input type="text" name="doi" value={formData.doi} onChange={handleChange} placeholder="DOI / Link" className="w-full p-3 rounded-lg bg-slate-800/50 text-white" />
                    <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags (comma separated)" className="w-full p-3 rounded-lg bg-slate-800/50 text-white" />
                  </div>

                  <div className="flex justify-between mt-6">
                    <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg">Update</button>
                    <button type="button" onClick={cancelForm} className="px-6 py-3 border text-white border-gray-500 rounded-lg">Cancel</button>
                  </div>
                </form>
              )}

              {loading ? (
                <p className="text-white text-center">Loading...</p>
              ) : error ? (
                <p className="text-red-400 text-center">{error}</p>
              ) : publications.length === 0 ? (
                <p className="text-white text-center">No publications found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publications.map((pub) => (
                    <div key={pub._id} className="relative group p-4 bg-slate-800/30 rounded-xl shadow-md hover:shadow-lg transition-all">
                      <h3 className="text-white text-lg font-semibold mb-1">{pub.title}</h3>
                      <p className="text-sm text-gray-300 mb-1">{pub.authors.join(', ')}</p>
                      <p className="text-sm text-gray-400 italic">{pub.journal} • {pub.year}</p>
                      {pub.doi && <a href={pub.doi} className="text-blue-400 text-sm underline mt-2 inline-block" target="_blank" rel="noopener noreferrer">View Publication</a>}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditing(pub)} title="Edit" className="p-2 bg-yellow-500/20 text-yellow-300 rounded-lg"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(pub._id)} title="Delete" className="p-2 bg-red-500/20 text-red-300 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
