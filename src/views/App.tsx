import LinearProgress from '@mui/material/LinearProgress';
import { Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Redirect, Route, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import { selectFinalDataTkb, useDrawerStore, useTkbStore } from '../zus';
import ErrorBoundary from './components/ErrorBoundary';
import LeftDrawer from './components/LeftDrawer';
import NeedStep1Warning from './components/NeedStep1';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

const ChonFileExcel = lazy(() => import('./1ChonFileExcel'));
const XepLop = lazy(() => import('./2XepLop'));
const KetQua = lazy(() => import('./3KetQua'));

type PersistedRouteProps = {
  path: string;
  component: React.ComponentType;
};

function PersistedRoute(props: PersistedRouteProps) {
  const location = useLocation();
  const match = location.pathname === props.path;
  return (
    <div hidden={!match} style={{ width: '100%' }}>
      <props.component />
    </div>
  );
}

function FallbackRoute() {
  const location = useLocation();
  const hasAnyMatch = Object.values(ROUTES).some((route) => route.path === location.pathname);
  return hasAnyMatch ? null : <Redirect to={ROUTES._1ChonFileExcel.path} />;
}

function App() {
  const isDrawerOpen = useDrawerStore((s) => s.isDrawerOpen);
  const classes = useStyles({ isDrawerOpen });
  const dataTkb = useTkbStore(selectFinalDataTkb);

  return (
    <div className={classes.root}>
      <a href="#main-content" className="skip-link">
        Bỏ qua điều hướng
      </a>
      <ErrorBoundary>
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          <Route component={ScrollToTop} />
          <LeftDrawer />
          <main
            id="main-content"
            className={clsx(classes.content, {
              [classes.contentShift]: isDrawerOpen,
            })}
          >
            <Suspense fallback={<LinearProgress className={classes.progress} />}>
              <PersistedRoute path={ROUTES._1ChonFileExcel.path} component={ChonFileExcel} />
              <PersistedRoute path={ROUTES._2XepLop.path} component={dataTkb.length ? XepLop : NeedStep1Warning} />
              <PersistedRoute path={ROUTES._3KetQua.path} component={dataTkb.length ? KetQua : NeedStep1Warning} />
              <FallbackRoute />
            </Suspense>
          </main>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}

export default App;

const drawerWidth = 248;
const drawerWidthClosed = 72;

type StyleProps = {
  isDrawerOpen: boolean;
};

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  root: {
    display: 'flex',
    minHeight: '100vh',
    '& > canvas': {
      position: 'fixed !important',
    },
  },
  content: {
    flexGrow: 1,
    minWidth: 0,
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    padding: (props) => theme.spacing(props.isDrawerOpen ? 3 : 2),
    background: 'transparent',
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -(drawerWidth - drawerWidthClosed),
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  progress: {
    width: '100%',
    borderRadius: 999,
  },
}));
