import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './page/Login';
import CreateRoom from './page/CreateRoom';
import NoMatch from './page/NoMatch';
// import NavBar from './page/component/NavBar';
import Room from './page/Room';

function App() {
  return (
    <div className="App">
      {/* <NavBar /> */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/createRoom" element={<CreateRoom />} />
        <Route path="/room:id" element={<Room />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </div>
  );
}

export default App;
