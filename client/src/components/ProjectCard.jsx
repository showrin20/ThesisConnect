export default function ProjectCard({ project }) {
    return (
      <div className="border p-4 rounded shadow">
        <h3 className="text-xl font-bold">{project.title}</h3>
        <p>{project.description}</p>
        <p className="text-sm text-gray-600">Tags: {project.tags.join(', ')}</p>
        <button className="mt-2 p-2 bg-blue-500 text-white rounded">
          Apply to Join
        </button>
      </div>
    );
  }