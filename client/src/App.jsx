import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './views/LandingPage';
import DashboardView from './views/DashboardView';
import AnalyzeView from './views/AnalyzeView';
import PipelineView from './views/PipelineView';
import SegmentationView from './views/SegmentationView';
import ComparisonView from './views/ComparisonView';
import MetricsView from './views/MetricsView';
import BatchView from './views/BatchView';
import ReportsView from './views/ReportsView';
import { getSessionsList, getSessionDetails, getBenchmarkSamples } from './services/api';

const VALID_APP_VIEWS = [
  'dashboard',
  'analyze',
  'pipeline',
  'segmentation',
  'comparison',
  'metrics',
  'batch',
  'reports'
];

function parseHash(hash) {
  if (hash && hash.startsWith('#/app')) {
    const rawView = hash.replace(/^#\/app\/?/, '').split('?')[0];
    const appView = VALID_APP_VIEWS.includes(rawView) ? rawView : 'analyze';
    return { site: 'app', view: appView };
  }
  return { site: 'landing', view: 'landing' };
}

export default function App() {
  const initialRoute = parseHash(window.location.hash);
  const [currentSite, setCurrentSite] = useState(initialRoute.site);
  const [currentAppView, setCurrentAppView] = useState(initialRoute.view === 'landing' ? 'analyze' : initialRoute.view);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [benchmarkSamples, setBenchmarkSamples] = useState([]);

  // Synchronize site and app view with browser URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const route = parseHash(window.location.hash);
      setCurrentSite(route.site);
      if (route.site === 'app') {
        setCurrentAppView(route.view);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Initial load of sample slices and session history
  useEffect(() => {
    async function loadInitialData() {
      try {
        const samples = await getBenchmarkSamples();
        setBenchmarkSamples(samples);
      } catch (err) {
        setBenchmarkSamples([
          { id: 't1', filename: 't1_medullo.png', sequence: 'T1', path: '/samples/t1_medullo.png' },
          { id: 't1c', filename: 't1c_medullo.png', sequence: 'T1C+', path: '/samples/t1c_medullo.png' },
          { id: 't2', filename: 't2_medullo.png', sequence: 'T2', path: '/samples/t2_medullo.png' }
        ]);
      }

      try {
        const sessions = await getSessionsList();
        setSessionHistory(sessions);
      } catch (err) {
        // No persistent sessions yet
      }
    }

    loadInitialData();
  }, []);

  const navigateToApp = (view = 'analyze') => {
    const targetView = VALID_APP_VIEWS.includes(view) ? view : 'analyze';
    window.location.hash = `#/app/${targetView}`;
    setCurrentSite('app');
    setCurrentAppView(targetView);
    window.scrollTo(0, 0);
  };

  const navigateToLanding = () => {
    window.location.hash = '#/';
    setCurrentSite('landing');
    window.scrollTo(0, 0);
  };

  const navigateToAppView = (view) => {
    const targetView = VALID_APP_VIEWS.includes(view) ? view : 'analyze';
    window.location.hash = `#/app/${targetView}`;
    setCurrentAppView(targetView);
    window.scrollTo(0, 0);
  };

  const handleProcessingComplete = (sessionResult) => {
    setActiveSession(sessionResult);
    setSessionHistory(prev => [sessionResult, ...prev.filter(s => s.sessionId !== sessionResult.sessionId)]);
    navigateToAppView('dashboard');
  };

  const handleLoadSession = async (sessionId) => {
    try {
      const details = await getSessionDetails(sessionId);
      setActiveSession(details);
      navigateToAppView('dashboard');
    } catch (err) {
      console.error('Failed to load session details', err);
    }
  };

  // 1. Landing Page Portal (Comprehensive merged content)
  if (currentSite === 'landing') {
    return (
      <LandingPage onLaunchWorkstation={() => navigateToApp('analyze')} />
    );
  }

  // 2. Interactive Analysis Workstation (Separate app site)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Workstation Navigation Bar */}
      <Navbar
        currentView={currentAppView}
        setCurrentView={navigateToAppView}
        onBackToLanding={navigateToLanding}
        activeSession={activeSession}
      />

      {/* Main Workstation View Switcher */}
      <main style={{ flex: 1 }}>
        {currentAppView === 'dashboard' && (
          <DashboardView
            activeSession={activeSession}
            sessionHistory={sessionHistory}
            onNavigate={navigateToAppView}
            onLoadSession={handleLoadSession}
          />
        )}

        {currentAppView === 'analyze' && (
          <AnalyzeView
            onProcessingComplete={handleProcessingComplete}
            benchmarkSamples={benchmarkSamples}
          />
        )}

        {currentAppView === 'pipeline' && (
          <PipelineView activeSession={activeSession} />
        )}

        {currentAppView === 'segmentation' && (
          <SegmentationView activeSession={activeSession} />
        )}

        {currentAppView === 'comparison' && (
          <ComparisonView activeSession={activeSession} />
        )}

        {currentAppView === 'metrics' && (
          <MetricsView activeSession={activeSession} />
        )}

        {currentAppView === 'batch' && (
          <BatchView onSelectSession={handleProcessingComplete} />
        )}

        {currentAppView === 'reports' && (
          <ReportsView activeSession={activeSession} />
        )}
      </main>
    </div>
  );
}
