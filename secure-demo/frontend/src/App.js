import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function AppInner(){
  const { user } = useContext(AuthContext);
  return user ? <Dashboard/> : <Login/>;
}

function App(){
  return <AuthProvider><AppInner/></AuthProvider>;
}
export default App;
