import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './component/Login';
import NoMatch from './component/NoMatch';
import NavBar from './component/NavBar';
import BaseBackground from './component/BaseBackground';

function App() {
  return (
    <div className="App">
      <NavBar />
      <BaseBackground />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </div>
  );
}

export default App;
