import React, { useEffect } from 'react';
import AppHeader from './components/AppHeader';
import AppShell from './components/AppShell';
import ErrorBoundary from './components/ErrorBoundary';
import Workspace from './components/Workspace';
import './App.css';

function AppContent() {
  // The app has no routes; this effect replaces the old router-driven ScrollToTop
  // (its pathname dependency could never change without navigation).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AppShell>
      <a href="#main-workspace" className="skip-link">
        Bỏ qua đến nội dung chính
      </a>
      <AppHeader />
      <Workspace />
    </AppShell>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
