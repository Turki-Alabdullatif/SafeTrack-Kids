import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; //the session provider
import Home from './Home';
import Register from './Register';
import LoginCard from './LoginCard';
import Dashboard from './Dashboard';//i dont need it anymore
import RegisterChild from './RegisterChild';
import ParentDashboard from './ParentDashboard';
import OrganizerDashboard from './OrganizerDashboard';
import AddBracelet from './AddBracelet';
import PairBracelet from './PairBracelet';
import CreateEvent from './CreateEvent';
import EditBracelets from './EditBracelets';
import ForgotPassword from './ForgotPassword';
import DemoParent from './DemoParent';
import DemoOrganizer from './DemoOrganizer';
import '../styles/main.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/loginCard" element={<LoginCard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/registerChild" element={<RegisterChild />} />
            <Route path="/parentDashboard" element={<ParentDashboard />} />
            <Route path="/organizerDashboard" element={<OrganizerDashboard />} />
            <Route path="/createevent" element={<CreateEvent/>} />
            <Route path="/AddBracelet" element={<AddBracelet />} />
            <Route path="/pairBracelet" element={<PairBracelet />} />
            <Route path="/editBracelets" element={<EditBracelets />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/demo-parent" element={<DemoParent />} />
            <Route path="/demo-organizer" element={<DemoOrganizer />} />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;