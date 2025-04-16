import { useState, useEffect } from 'react';
import ProfileCard from '../components/ProfileCard';

export default function Explore() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/users?search=${search}`)
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, [search]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Explore Researchers</h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by domain or keywords"
        className="w-full p-2 mb-4 border rounded"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.map((user) => (
          <ProfileCard key={user._id} user={user} />
        ))}
      </div>
    </div>
  );
}