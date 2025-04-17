import { useState, useEffect } from 'react';
import ProjectForm from '../components/ProjectForm';
import ProjectCard from '../components/ProjectCard';

export default function ProjectHub() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Project Hub</h1>
      <ProjectForm />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </div>
  );
}