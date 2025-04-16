export default function ProfileCard({ user }) {
    return (
      <div className="border p-4 rounded shadow">
        <h3 className="text-xl font-bold">{user.name}</h3>
        <p>{user.university}</p>
        <p>Domain: {user.domain}</p>
        <p>Keywords: {user.keywords?.join(', ')}</p>
        <a href={user.scholarLink} className="text-blue-500">Google Scholar</a>
      </div>
    );
  }