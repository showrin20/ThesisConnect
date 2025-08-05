import { useState } from 'react';
import axios from '../axios';
import { colors } from '../styles/colors';

export default function PublicationForm({ onPublicationCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    year: '',
    venue: '',
    type: '',
    genre: '',
    quality: '',
    tags: '',
    doi: '',
    abstract: '',
    citations: '',
    location: '',
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
      if (!token) throw new Error('Please log in to add a publication');

      // Prepare data with arrays for authors and tags
      const payload = {
        ...formData,
        authors: formData.authors.split(',').map((a) => a.trim()).filter(Boolean),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        year: parseInt(formData.year, 10),
        citations: parseInt(formData.citations, 10) || 0,
      };

      const response = await axios.post('/publications', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormData({
        title: '',
        authors: '',
        year: '',
        venue: '',
        type: '',
        genre: '',
        quality: '',
        tags: '',
        doi: '',
        abstract: '',
        citations: '',
        location: '',
      });
      setSuccess(true);

      if (onPublicationCreated) {
        onPublicationCreated(response.data.data);
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Publication creation error:', err);
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          err.message ||
          'Failed to add publication. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="space-y-6">
      {error && (
        <div 
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: `${colors.accent.red[500]}33`,
            borderColor: `${colors.accent.red[500]}80`
          }}
        >
          <p className="text-sm" style={{ color: colors.accent.red[300] }}>{error}</p>
        </div>
      )}

      {success && (
        <div 
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: `${colors.accent.green[500]}33`,
            borderColor: `${colors.accent.green[500]}80`
          }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.accent.green[500] }}
            >
              <svg
                className="w-3 h-3"
                style={{ color: colors.background.primary }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: colors.accent.green[300] }}>Publication added successfully!</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required fields */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Title *
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Publication title"
            required
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.input.background,
              borderColor: colors.input.border,
              color: colors.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.input.borderFocus;
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}1A`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.input.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div>
          <label htmlFor="authors" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Authors * <span className="text-xs" style={{ color: colors.text.muted }}>(comma separated)</span>
          </label>
          <input
            id="authors"
            name="authors"
            value={formData.authors}
            onChange={handleChange}
            placeholder="Your Name, Co-author, Another Author"
            required
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.input.background,
              borderColor: colors.input.border,
              color: colors.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.input.borderFocus;
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}1A`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.input.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Year *
          </label>
          <input
            id="year"
            name="year"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.year}
            onChange={handleChange}
            placeholder="e.g., 2024"
            required
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.input.background,
              borderColor: colors.input.border,
              color: colors.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.input.borderFocus;
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}1A`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.input.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div>
          <label htmlFor="venue" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Venue (Journal/Conference) *
          </label>
          <input
            id="venue"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            placeholder="e.g., IEEE Transactions on Geoscience"
            required
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.input.background,
              borderColor: colors.input.border,
              color: colors.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.input.borderFocus;
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}1A`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.input.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.input.background,
              borderColor: colors.input.border,
              color: colors.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.input.borderFocus;
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}1A`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.input.border;
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="" disabled>
              Select publication type
            </option>
            <option value="Journal">Journal</option>
            <option value="Conference">Conference</option>
            <option value="Workshop">Workshop</option>
            <option value="Book Chapter">Book Chapter</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Optional fields */}
        <div>
          <label htmlFor="genre" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Genre
          </label>
          <input
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            placeholder="e.g., Machine Learning"
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.input.background,
              borderColor: colors.input.border,
              color: colors.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.input.borderFocus;
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}1A`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.input.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div>
          <label htmlFor="quality" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Quality (Q1, Q2, Q3, Q4, A, A*, N/A)
          </label>
          <select
            id="quality"
            name="quality"
            value={formData.quality}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.input.background,
              borderColor: colors.input.border,
              color: colors.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.input.borderFocus;
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}1A`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.input.border;
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">Select quality</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
            <option value="A">A</option>
            <option value="A*">A*</option>
            <option value="N/A">N/A</option>
          </select>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Research Tags
          </label>
          <input
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., Deep Learning, Flood Prediction, Satellite Imagery"
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.input.background,
              borderColor: colors.input.border,
              color: colors.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.input.borderFocus;
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}1A`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.input.border;
              e.target.style.boxShadow = 'none';
            }}
          />
          <p className="text-xs mt-1" style={{ color: colors.text.muted }}>Separate multiple tags with commas</p>
        </div>

        <div>
          <label htmlFor="doi" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            DOI
          </label>
          <input
            id="doi"
            name="doi"
            value={formData.doi}
            onChange={handleChange}
            placeholder="e.g., 10.1109/TGRS.2024.1234567"
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.input.background,
              borderColor: colors.input.border,
              color: colors.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.input.borderFocus;
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}1A`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.input.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div>
          <label htmlFor="abstract" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Abstract
          </label>
          <textarea
            id="abstract"
            name="abstract"
            value={formData.abstract}
            onChange={handleChange}
            placeholder="Brief summary of the publication"
            rows={4}
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 resize-none"
            style={{
              backgroundColor: colors.input.background,
              borderColor: colors.input.border,
              color: colors.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.input.borderFocus;
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}1A`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.input.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div>
          <label htmlFor="citations" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Citations
          </label>
          <input
            id="citations"
            name="citations"
            type="number"
            min="0"
            value={formData.citations}
            onChange={handleChange}
            placeholder="Number of citations"
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.input.background,
              borderColor: colors.input.border,
              color: colors.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.input.borderFocus;
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}1A`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.input.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Location
          </label>
          <input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., United States"
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.input.background,
              borderColor: colors.input.border,
              color: colors.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.input.borderFocus;
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}1A`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.input.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={
              loading ||
              !formData.title.trim() ||
              !formData.authors.trim() ||
              !formData.year.trim() ||
              !formData.venue.trim() ||
              !formData.type.trim()
            }
            className="flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200"
            style={{
              backgroundColor: loading ||
              !formData.title.trim() ||
              !formData.authors.trim() ||
              !formData.year.trim() ||
              !formData.venue.trim() ||
              !formData.type.trim()
                ? colors.button.disabled.background
                : colors.button.primary.background,
              color: loading ||
              !formData.title.trim() ||
              !formData.authors.trim() ||
              !formData.year.trim() ||
              !formData.venue.trim() ||
              !formData.type.trim()
                ? colors.button.disabled.text
                : colors.button.primary.text,
              cursor: loading ||
              !formData.title.trim() ||
              !formData.authors.trim() ||
              !formData.year.trim() ||
              !formData.venue.trim() ||
              !formData.type.trim()
                ? 'not-allowed'
                : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = colors.button.primary.backgroundHover;
                e.target.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = colors.button.primary.background;
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div 
                  className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: `${colors.button.primary.text}4D`,
                    borderTopColor: colors.button.primary.text
                  }}
                ></div>
                Adding Publication...
              </span>
            ) : (
              'Add Publication'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
