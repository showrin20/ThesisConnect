import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from '../axios'; // ✅ using the custom axios instance

export default function Auth({ isSignup = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    domain: '',
    scholarLink: '',
    githubLink: '',
    keywords: '',
  });

  const [error, setError] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isSignup ? '/auth/register' : '/auth/login';

      const payload = isSignup
        ? {
            ...formData,
            keywords: formData.keywords
              .split(',')
              .map((kw) => kw.trim())
              .filter((kw) => kw),
          }
        : {
            email: formData.email,
            password: formData.password,
          };

      const res = await axios.post(endpoint, payload);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#DDE6ED]">
      <div className="p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-3xl font-extrabold text-center text-[#27374D] mb-6">
          {isSignup ? 'Sign Up' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isSignup && (
            <>
              <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
              <Input label="University" name="university" value={formData.university} onChange={handleChange} />
              <Input label="Domain" name="domain" value={formData.domain} onChange={handleChange} />
              <Input label="Google Scholar Link" name="scholarLink" value={formData.scholarLink} onChange={handleChange} />
              <Input label="GitHub Link" name="githubLink" value={formData.githubLink} onChange={handleChange} />
              <Input
                label="Keywords (comma-separated)"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="e.g. AI, Robotics, IoT"
              />
            </>
          )}
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <p className="text-red-500 text-sm text-center col-span-2">{error}</p>}
          <div className="col-span-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#27374D] to-[#526D82] text-white p-3 rounded-lg shadow-md hover:bg-gradient-to-l hover:from-[#526D82] hover:to-[#27374D] transition-colors duration-300"
            >
              {isSignup ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, type = 'text', required = false, placeholder }) {
  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-[#27374D]">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full p-3 border border-[#526D82] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9DB2BF] focus:border-transparent transition-all duration-200"
      />
    </div>
  );
}
