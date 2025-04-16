import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import ProjectCard from '../components/ProjectCard';

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (user) {
      fetch('http://localhost:5000/api/projects/my-projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((res) => res.json())
        .then((data) => setProjects(data));
    }
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Dashboard</h1>
      {user ? (
        <div>
          <h2 className="text-xl mb-2">Your Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </div>
      ) : (
        <p>Please log in to view your dashboard.</p>
      )}
    </div>
  );
}