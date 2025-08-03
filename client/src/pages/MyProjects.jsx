import React, { useState, useEffect } from 'react';
import axios from '../axios'; // your axios instance configured with baseURL
import ProjectCard from '../components/ProjectCard';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    tags: '',
    status: 'Planned',
    collaborators: '',
  });

  const fetchMyProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/projects/my-projects');
      setProjects(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load your projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const parseCSV = (str) =>
    str.split(',').map(s => s.trim()).filter(Boolean);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: parseCSV(formData.tags),
        collaborators: parseCSV(formData.collaborators),
      };

      const res = await axios.put(`/projects/${editingProject._id}`, payload);
      console.log('Updated:', res.data);

      setEditingProject(null);
      setFormData({ title: '', description: '', link: '', tags: '', status: 'Planned', collaborators: '' });
      fetchMyProjects();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await axios.delete(`/projects/${id}`);
      alert('Project deleted successfully!');
      fetchMyProjects();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete project');
    }
  };

  const startEditing = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      link: project.link || '',
      tags: (project.tags || []).join(', '),
      status: project.status || 'Planned',
      collaborators: (project.collaborators || []).join(', '),
    });
  };

  const cancelForm = () => {
    setEditingProject(null);
    setFormData({ title: '', description: '', link: '', tags: '', status: 'Planned', collaborators: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20">
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            My Projects
          </span>
        </h1>

        {editingProject && (
          <form onSubmit={handleUpdate} className="max-w-2xl mx-auto bg-white/5 backdrop-blur-lg rounded-xl p-8 mb-8 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Edit Project</h2>
              <button type="button" onClick={cancelForm} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>

            <div className="space-y-4">
              <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Title" className="w-full p-3 rounded-lg bg-slate-800/50 text-white" />
              <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} placeholder="Description" className="w-full p-3 rounded-lg bg-slate-800/50 text-white" />
              <input type="url" name="link" value={formData.link} onChange={handleChange} required placeholder="Project Link" className="w-full p-3 rounded-lg bg-slate-800/50 text-white" />
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags (comma separated)" className="w-full p-3 rounded-lg bg-slate-800/50 text-white" />
              <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800/50 text-white">
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <input type="text" name="collaborators" value={formData.collaborators} onChange={handleChange} placeholder="Collaborators (comma separated)" className="w-full p-3 rounded-lg bg-slate-800/50 text-white" />
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
        ) : projects.length === 0 ? (
          <p className="text-white text-center">No projects found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="relative group">
                <ProjectCard {...project} />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEditing(project)} title="Edit" className="p-2 bg-yellow-500/20 text-yellow-300 rounded-lg"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(project._id)} title="Delete" className="p-2 bg-red-500/20 text-red-300 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
