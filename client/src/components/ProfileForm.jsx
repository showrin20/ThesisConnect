import { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { colors } from '../styles/colors';

export default function ProfileForm({ user }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    university: user.university || '',
    domain: user.domain || '',
    scholarLink: user.scholarLink || '',
    githubLink: user.githubLink || '',
    keywords: user.keywords?.join(', ') || '',
  });
  const { setUser } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:1085/api/users/profile'|| import.meta.env.VITE_API_URL || 'https://thesisconnect-backend.onrender.com/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        keywords: formData.keywords.split(',').map((k) => k.trim()),
      }),
    });
    const updatedUser = await res.json();
    setUser(updatedUser);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4">
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        className="w-full p-2 mb-4 border rounded"
        style={{
          backgroundColor: colors.input.background,
          borderColor: colors.input.border,
          color: colors.input.text
        }}
        onFocus={(e) => e.target.style.borderColor = colors.input.borderFocus}
        onBlur={(e) => e.target.style.borderColor = colors.input.border}
      />
      <input
        name="university"
        value={formData.university}
        onChange={handleChange}
        placeholder="University"
        className="w-full p-2 mb-4 border rounded"
        style={{
          backgroundColor: colors.input.background,
          borderColor: colors.input.border,
          color: colors.input.text
        }}
        onFocus={(e) => e.target.style.borderColor = colors.input.borderFocus}
        onBlur={(e) => e.target.style.borderColor = colors.input.border}
      />
      <input
        name="domain"
        value={formData.domain}
        onChange={handleChange}
        placeholder="Research Domain"
        className="w-full p-2 mb-4 border rounded"
        style={{
          backgroundColor: colors.input.background,
          borderColor: colors.input.border,
          color: colors.input.text
        }}
        onFocus={(e) => e.target.style.borderColor = colors.input.borderFocus}
        onBlur={(e) => e.target.style.borderColor = colors.input.border}
      />
      <input
        name="scholarLink"
        value={formData.scholarLink}
        onChange={handleChange}
        placeholder="Google Scholar Link"
        className="w-full p-2 mb-4 border rounded"
        style={{
          backgroundColor: colors.input.background,
          borderColor: colors.input.border,
          color: colors.input.text
        }}
        onFocus={(e) => e.target.style.borderColor = colors.input.borderFocus}
        onBlur={(e) => e.target.style.borderColor = colors.input.border}
      />
      <input
        name="githubLink"
        value={formData.githubLink}
        onChange={handleChange}
        placeholder="GitHub Link"
        className="w-full p-2 mb-4 border rounded"
        style={{
          backgroundColor: colors.input.background,
          borderColor: colors.input.border,
          color: colors.input.text
        }}
        onFocus={(e) => e.target.style.borderColor = colors.input.borderFocus}
        onBlur={(e) => e.target.style.borderColor = colors.input.border}
      />
      <input
        name="keywords"
        value={formData.keywords}
        onChange={handleChange}
        placeholder="Keywords (comma-separated)"
        className="w-full p-2 mb-4 border rounded"
        style={{
          backgroundColor: colors.input.background,
          borderColor: colors.input.border,
          color: colors.input.text
        }}
        onFocus={(e) => e.target.style.borderColor = colors.input.borderFocus}
        onBlur={(e) => e.target.style.borderColor = colors.input.border}
      />
      <button 
        type="submit" 
        className="w-full p-2 rounded transition-colors"
        style={{
          backgroundColor: colors.button.primary.background,
          color: colors.button.primary.text
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary.blue[600]}
        onMouseLeave={(e) => e.target.style.backgroundColor = colors.button.primary.background}
      >
        Update Profile
      </button>
    </form>
  );
}