import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Register from './Register';
import LoginCard from './LoginCard';
import Dashboard from './Dashboard';
import RegisterChild from './insertkid';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/loginCard" element={<LoginCard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/registerChild" element={<RegisterChild />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;