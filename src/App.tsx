import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ParallaxBackground } from './components/ParallaxBackground';
import { HomePage } from './pages/HomePage';
import { SystemPage } from './pages/SystemPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { DemoPage } from './pages/DemoPage';
import { EnergySimulatorPage } from './pages/EnergySimulatorPage';
import { PartsAndWiringPage } from './pages/PartsAndWiringPage';
import { HonestBitPage } from './pages/HonestBitPage';
import { TeamAndFilesPage } from './pages/TeamAndFilesPage';
import { PosterPage } from './pages/PosterPage';

import { simulatedClient } from './services/SimulatedRoverClient';
import { liveClient } from './services/LiveRoverClient';
import { RoverStatus, RoverClient } from './types/rover';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [mode, setMode] = useState<'simulated' | 'live'>('simulated');
  const [isJudgeMode, setIsJudgeMode] = useState(false);

  const activeClient: RoverClient = mode === 'simulated' ? simulatedClient : liveClient;
  const [status, setStatus] = useState<RoverStatus>(activeClient.status());

  // Subscribe to telemetry updates
  useEffect(() => {
    const unsub = activeClient.subscribe((s) => {
      setStatus(s);
    });
    return unsub;
  }, [activeClient]);

  // Global Keyboard Shortcuts (J for Judge Mode, Esc to Exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'j' || e.key === 'J') && !isJudgeMode) {
        triggerJudgeMode();
      } else if (e.key === 'Escape' && isJudgeMode) {
        setIsJudgeMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isJudgeMode]);

  const triggerJudgeMode = () => {
    setIsJudgeMode(true);
    setCurrentTab('demo');
    activeClient.setSpeedMultiplier(10);
    activeClient.call('cp-1');
  };

  const handleToggleMode = (newMode: 'simulated' | 'live') => {
    setMode(newMode);
    const c = newMode === 'simulated' ? simulatedClient : liveClient;
    setStatus(c.status());
  };

  if (currentTab === 'poster') {
    return <PosterPage onBack={() => setCurrentTab('home')} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <ParallaxBackground />
      <div className="ambient-glow-wrapper">
        <div className="ambient-glow-amber"></div>
      </div>

      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        status={status}
        mode={mode}
        onToggleMode={handleToggleMode}
        onTriggerJudgeMode={triggerJudgeMode}
      />

      <main style={{ flex: 1, zIndex: 1 }}>
        {currentTab === 'home' && (
          <HomePage
            onGoToDemo={() => setCurrentTab('demo')}
            onGoToHonest={() => setCurrentTab('honest')}
            status={status}
            client={activeClient}
          />
        )}
        {currentTab === 'system' && <SystemPage />}
        {currentTab === 'how-it-works' && <HowItWorksPage onGoToDemo={() => setCurrentTab('demo')} />}
        {currentTab === 'demo' && (
          <DemoPage
            client={activeClient}
            status={status}
            mode={mode}
            isJudgeMode={isJudgeMode}
            onExitJudgeMode={() => setIsJudgeMode(false)}
          />
        )}
        {currentTab === 'energy-simulator' && <EnergySimulatorPage />}
        {currentTab === 'parts' && <PartsAndWiringPage />}
        {currentTab === 'honest' && <HonestBitPage />}
        {currentTab === 'team' && <TeamAndFilesPage />}
      </main>

      <Footer onOpenPoster={() => setCurrentTab('poster')} />
    </div>
  );
};
