import React, { useState, useEffect } from 'react';
import { RoverStatus } from '../types/rover';
import { soundFX } from '../utils/audio';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  status: RoverStatus;
  mode: 'simulated' | 'live';
  onToggleMode: (mode: 'simulated' | 'live') => void;
  onTriggerJudgeMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  status,
  mode,
  onToggleMode,
  onTriggerJudgeMode
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [audioActive, setAudioActive] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    soundFX.playClick();
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleAudio = () => {
    const isNowOn = soundFX.toggle();
    setAudioActive(isNowOn);
  };

  const handleNavClick = (tabId: string) => {
    soundFX.playClick();
    onSelectTab(tabId);
  };

  // Expressive status face based on rover state
  const getStatusFace = () => {
    switch (status.state) {
      case 'docked':
      case 'charging':
        return '◡ ‿ ◡'; // sleepy/content charging
      case 'travelling':
      case 'departing':
        return '• ‿ •'; // alert roaming
      case 'serving':
        return '★ ‿ ★'; // happy powering phone
      case 'obstacle_wait':
        return '• ᴖ •'; // concerned obstacle
      case 'e_stop':
      case 'fault':
        return '> ᴖ <'; // alarmed stop
      default:
        return '• ‿ •';
    }
  };

  const navItems = [
    { id: 'home', label: 'home' },
    { id: 'system', label: 'system' },
    { id: 'how-it-works', label: 'how it works' },
    { id: 'demo', label: 'demo dashboard' },
    { id: 'energy-simulator', label: 'energy simulator' },
    { id: 'parts', label: 'parts & wiring' },
    { id: 'honest', label: 'the honest bit' },
    { id: 'team', label: 'team & files' }
  ];

  return (
    <header className="app-header">
      <div className="header-left">
        <a
          href="#home"
          className="logo-link"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('home');
          }}
        >
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-solar)', boxShadow: '0 0 10px var(--accent-solar)' }}></span>
          s.p.a.r.c.
        </a>

        <div
          className="status-face"
          title={`rover is currently ${status.state} • click for haptic feedback`}
          onClick={() => soundFX.playClick()}
          style={{ cursor: 'pointer' }}
        >
          {getStatusFace()}
        </div>
      </div>

      <nav className="header-nav">
        {navItems.map((item) => (
          <span
            key={item.id}
            className={`nav-link ${currentTab === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            {item.label}
          </span>
        ))}
      </nav>

      <div className="header-right">
        {/* Audio Haptic Synthesizer Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleAudio}
          title={audioActive ? 'Audio FX active (click to mute)' : 'Enable tactile audio synthesizer effects'}
        >
          {audioActive ? '🔊 fx' : '🔇 fx'}
        </button>

        {/* Theme Toggle (Studio vs Dark Lab) */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title="Toggle Studio Light / Dark Lab theme"
        >
          {theme === 'light' ? '🌙 dark' : '☀️ lab'}
        </button>

        {/* Simulated vs Live Global Mode Switch */}
        <div className="mode-toggle">
          <button
            className={mode === 'simulated' ? 'active-sim' : ''}
            onClick={() => {
              soundFX.playClick();
              onToggleMode('simulated');
            }}
            title="Runs built-in dead-reckoning simulation model"
          >
            simulated
          </button>
          <button
            className={mode === 'live' ? 'active-live' : ''}
            onClick={() => {
              soundFX.playClick();
              onToggleMode('live');
            }}
            title="Connects to real Raspberry Pi Pico WH over local Wi-Fi"
          >
            live
          </button>
        </div>

        {/* Judge Mode Quick Trigger */}
        <button
          className="btn btn-secondary"
          style={{ padding: '4px 12px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
          onClick={() => {
            soundFX.playChime(true);
            onTriggerJudgeMode();
          }}
          title="Press J or click to start 90s review presentation"
        >
          judge [J]
        </button>
      </div>
    </header>
  );
};
