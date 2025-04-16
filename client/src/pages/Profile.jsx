import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import ProfileForm from '../components/ProfileForm';

export default function Profile() {
  const { user } = useContext(UserContext);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      {user ? <ProfileForm user={user} /> : <p>Please log in to view your profile.</p>}
    </div>
  );
}