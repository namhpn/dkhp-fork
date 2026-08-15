import Typography from '@mui/material/Typography';
import React from 'react';
import HeaderFileControl from './HeaderFileControl';
import ModeTabs from './ModeTabs';

function AppHeader() {
  return (
    <header className="app-header">
      <Typography component="h1" className="app-title">
        Course Planner
      </Typography>
      <ModeTabs />
      <HeaderFileControl />
    </header>
  );
}

export default AppHeader;
