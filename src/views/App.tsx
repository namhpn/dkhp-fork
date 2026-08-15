import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import AppShell from './components/AppShell';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import Workspace from './components/Workspace';
import './App.css';

function AppContent() {
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
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <RouteReset />
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function RouteReset() {
  return <ScrollToTop />;
}

export default App;
