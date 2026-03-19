import React from 'react';
import '../styles/main.css';

import Header from './Header';
import Hero from './Hero';
import DashboardPreview from './DashboardPreview'; // NEW: Show off the cool map!
import UserRoles from './UserRoles';             // NEW: Parents vs. Organizers
import Steps from './Steps';
import Features from './Features';
import HardwareIntegration from './HardwareIntegration'; // NEW: Talk about the bracelets
import Privacy from './Privacy';
import CTA from './CTA';
import Footer from './Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* 1. The Hook */}
        <Hero />
        
        {/* 2. The Visual Proof (Show the map with the geofence!) */}
        <DashboardPreview />
        
        {/* 3. Who is it for? (Split value props) */}
        <UserRoles />
        
        {/* 4. How it works (Register -> Pair -> Track) */}
        <Steps />
        
        {/* 5. Deep dive into software features (Alerts, History) */}
        <Features />
        
        {/* 6. The Physical Tech (Battery life, MAC pairing) */}
        <HardwareIntegration />
        
        {/* 7. Trust & Security (Crucial for kids apps) */}
        <Privacy />
        
        {/* 8. The Close */}
        <CTA />
      </main>
      <Footer />
    </>
  );
}