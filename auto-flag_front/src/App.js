import React from 'react';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import Register from './pages/Register';
import List from './pages/List';

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Register</Link>
            </li>
            <li>
              <Link to="/list">List</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/list" element={<List />} />
          <Route path="/" element={<Register />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
