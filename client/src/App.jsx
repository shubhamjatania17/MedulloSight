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
import AboutView from './views/AboutView';
import { getSessionsList, getSessionDetails, getBenchmarkSamples } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [activeSession, setActiveSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [benchmarkSamples, setBenchmarkSamples] = useState([]);

  useEffect(() => {
    // Load recent sessions and benchmark sample slices on mount
    async function loadInitialData() {
      try {
        const samples = await getBenchmarkSamples();
        setBenchmarkSamples(samples);
      } catch (err) {
        // Fallback local samples if API hasn't loaded yet
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

  const handleProcessingComplete = (sessionResult) => {
    setActiveSession(sessionResult);
    setSessionHistory(prev => [sessionResult, ...prev.filter(s => s.sessionId !== sessionResult.sessionId)]);
    // Transition to Dashboard or Pipeline upon completion
    setCurrentView('dashboard');
  };

  const handleLoadSession = async (sessionId) => {
    try {
      const details = await getSessionDetails(sessionId);
      setActiveSession(details);
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Failed to load session details', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Application Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        hasActiveSession={!!activeSession}
      />

      {/* Main Content View Switcher */}
      <main style={{ flex: 1 }}>
        {currentView === 'landing' && (
          <LandingPage onLaunchWorkstation={() => setCurrentView('analyze')} />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            activeSession={activeSession}
            sessionHistory={sessionHistory}
            onNavigate={(viewId) => setCurrentView(viewId)}
            onLoadSession={handleLoadSession}
          />
        )}

        {currentView === 'analyze' && (
          <AnalyzeView
            onProcessingComplete={handleProcessingComplete}
            benchmarkSamples={benchmarkSamples}
          />
        )}

        {currentView === 'pipeline' && (
          <PipelineView activeSession={activeSession} />
        )}

        {currentView === 'segmentation' && (
          <SegmentationView activeSession={activeSession} />
        )}

        {currentView === 'comparison' && (
          <ComparisonView activeSession={activeSession} />
        )}

        {currentView === 'metrics' && (
          <MetricsView activeSession={activeSession} />
        )}

        {currentView === 'batch' && (
          <BatchView onSelectSession={handleProcessingComplete} />
        )}

        {currentView === 'reports' && (
          <ReportsView activeSession={activeSession} />
        )}

        {currentView === 'about' && (
          <AboutView />
        )}
      </main>
    </div>
  );
}
