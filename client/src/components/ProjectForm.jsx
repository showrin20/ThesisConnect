import { useState } from 'react';
import axios from '../axios';

export default function ProjectForm({ onProjectCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to create a project');
      }

      const response = await axios.post('/projects', {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      setFormData({ title: '', description: '', tags: '' });
      setSuccess(true);
      
      // Call parent callback to refresh projects list
      if (onProjectCreated) {
        onProjectCreated();
      }

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Project creation error:', err);
      setError(
        err.response?.data?.msg || 
        err.response?.data?.message || 
        err.message ||
        'Failed to create project. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 rounded-lg shadow-xl p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 mb-4">
          <p className="text-green-300 text-sm">Project created successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            Project Title *
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter project title"
            required
            className="w-full p-3 bg-slate-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your project..."
            required
            rows={4}
            className="w-full p-3 bg-slate-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., AI, Machine Learning, Data Science"
            className="w-full p-3 bg-slate-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.title.trim() || !formData.description.trim()}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            loading || !formData.title.trim() || !formData.description.trim()
              ? 'bg-gray-600 cursor-not-allowed text-gray-400'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating Project...
            </span>
          ) : (
            'Create Project'
          )}
        </button>
      </form>
    </div>
  );
}