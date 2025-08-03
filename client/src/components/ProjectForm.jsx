import { useState } from 'react';
import axios from '../axios';

export default function ProjectForm({ onProjectCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
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

      setFormData({ title: '', description: '', link: '', tags: '' });
      setSuccess(true);
      
      // Call parent callback with the new project data
      if (onProjectCreated) {
        // Pass the actual project data from response.data.data
        onProjectCreated(response.data.data);
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
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-300 text-sm font-medium">Project created successfully!</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Project Title *
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter your project title..."
            required
            className="w-full p-3 bg-slate-800/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Project Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your project goals, methodology, and expected outcomes..."
            required
            rows={5}
            className="w-full p-3 bg-slate-800/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div>
          <label htmlFor="link" className="block text-sm font-medium text-gray-300 mb-2">
            Project Link *
          </label>
          <input
            id="link"
            name="link"
            type="url"
            value={formData.link}
            onChange={handleChange}
            placeholder="https://example.com/your-project-report-or-blog"
            required
            className="w-full p-3 bg-slate-800/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
          />
          <p className="text-gray-400 text-xs mt-1">
            Provide a link to your project report, blog post, GitHub repository, or documentation
          </p>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
            Research Tags
          </label>
          <input
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., Machine Learning, Climate Science, Data Analysis"
            className="w-full p-3 bg-slate-800/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
          />
          <p className="text-gray-400 text-xs mt-1">Separate multiple tags with commas</p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.description.trim() || !formData.link.trim()}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              loading || !formData.title.trim() || !formData.description.trim() || !formData.link.trim()
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
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
        </div>
      </form>
    </div>
  );
}