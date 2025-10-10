import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    const res = await axios.post('/auth/register', { email, password, name: 'Demo User' });
    setUser(res.data.user);
  };
  const login = async () => {
    const res = await axios.post('/auth/login', { email, password });
    setUser(res.data.user);
  };

  return (
    <div>
      <h2>Login / Register</h2>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
      <button onClick={login}>Login</button>
      <button onClick={register}>Register</button>
      <hr />
      <a href="http://localhost:5000/auth/google">Sign in with Google</a>
    </div>
  );
}
