import React, { useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user, setUser } = useContext(AuthContext);
  const logout = async () => {
    await axios.get('/auth/logout');
    setUser(null);
  };
  if (!user) return <div>Please login</div>;
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome: {user.name}</p>
      <p>Email: {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
