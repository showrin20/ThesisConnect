import { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';

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
    const res = await fetch('http://localhost:5001/api/users/profile', {
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
      />
      <input
        name="university"
        value={formData.university}
        onChange={handleChange}
        placeholder="University"
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        name="domain"
        value={formData.domain}
        onChange={handleChange}
        placeholder="Research Domain"
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        name="scholarLink"
        value={formData.scholarLink}
        onChange={handleChange}
        placeholder="Google Scholar Link"
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        name="githubLink"
        value={formData.githubLink}
        onChange={handleChange}
        placeholder="GitHub Link"
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        name="keywords"
        value={formData.keywords}
        onChange={handleChange}
        placeholder="Keywords (comma-separated)"
        className="w-full p-2 mb-4 border rounded"
      />
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
        Update Profile
      </button>
    </form>
  );
}