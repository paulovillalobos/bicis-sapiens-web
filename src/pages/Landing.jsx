import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Interstitial from '@/components/landing/Interstitial';
import Manifesto from '@/components/landing/Manifesto';
import DataDashboard from '@/components/landing/DataDashboard';
import Solution3Cs from '@/components/landing/Solution3Cs';
import InteractiveMap from '@/components/landing/InteractiveMap';
import BikeBus from '@/components/landing/BikeBus';
import AppCTA from '@/components/landing/AppCTA';
import CommunityHub from '@/components/landing/CommunityHub';
import Municipalities from '@/components/landing/Municipalities';
import AboutTeam from '@/components/landing/AboutTeam';
import Support from '@/components/landing/Support';
import Footer from '@/components/landing/Footer';
import JoinModal from '@/components/landing/JoinModal';

function LandingContent() {
  const [joinOpen, setJoinOpen] = useState(false);
  const openJoin = () => setJoinOpen(true);

  return (
    <div className="font-body min-h-screen bg-background text-foreground">
      <Navbar onJoinClick={openJoin} />
      <Hero onJoinClick={openJoin} />
      <Interstitial />
      <Manifesto />
      <DataDashboard />
      <Solution3Cs />
      <InteractiveMap />
      <BikeBus onJoinClick={openJoin} />
      <AppCTA />
      <CommunityHub onJoinClick={openJoin} />
      <Municipalities />
      <AboutTeam />
      <Support />
      <Footer />
      <JoinModal open={joinOpen} onOpenChange={setJoinOpen} />
    </div>
  );
}

export default function Landing() {
  return <LandingContent />;
}