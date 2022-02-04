/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Cookie from 'js-cookie';
import Login from './page/Login';
import CreateRoom from './page/CreateRoom';
import NoMatch from './page/NoMatch';
import MediaTest from './page/MediaTest';
// import NavBar from './page/component/NavBar';
import Room from './page/Room';
import { User as UserContext, Room as RoomContext, RTCStream as RTCStreamContext } from './context';
import useAuth from './page/hook/useAuth';
import { parseCookie } from './utils/utils';

const vuser = Cookie.get('vuser');

function App() {
  const [user, setUser] = useState(parseCookie(vuser) || {});
  const [room, setRoom] = useState({});
  const [RTCStream, setRTCStream] = useState(null);
  useEffect(() => {
    console.log('userContext --->', user);
    console.log('roomContext --->', room);
    console.log('RTCContext --->', RTCStream);
  }, [user, room, RTCStream]);

  return (
    <div className="App">
      {/* <NavBar /> */}
      <UserContext.Provider value={{ user, setUser }}>
        <RoomContext.Provider value={{ room, setRoom }}>
          <RTCStreamContext.Provider value={{ RTCStream, setRTCStream }}>
            <Routes>
              <Route path="*" element={<NoMatch />} />
              <Route path="/" element={<Login />} />
              <Route path="/createRoom" element={useAuth(<CreateRoom />, true)} />
              <Route path="/mediaTest" element={useAuth(<MediaTest />, true)} />
              <Route path="/room/:id" element={useAuth(<Room />, true)} />
            </Routes>
          </RTCStreamContext.Provider>
        </RoomContext.Provider>
      </UserContext.Provider>
    </div>
  );
}

export default App;
