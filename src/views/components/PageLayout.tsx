import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants';

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
};

export function PageShell({ eyebrow, title, description, children, actions, meta }: PageShellProps) {
  return (
    <Box className="page-shell">
      <Paper className="hero-panel" elevation={0}>
        <Box className="hero-copy">
          {eyebrow && <Typography className="eyebrow">{eyebrow}</Typography>}
          <Typography component="h1" className="page-title">
            {title}
          </Typography>
          <Typography className="page-description">{description}</Typography>
          {meta && <Box className="hero-meta">{meta}</Box>}
        </Box>
        {actions && <Box className="hero-actions">{actions}</Box>}
      </Paper>
      {children}
    </Box>
  );
}

type SectionCardProps = {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function SectionCard({ eyebrow, title, children, actions, className }: SectionCardProps) {
  return (
    <Paper className={['section-card', className].filter(Boolean).join(' ')} elevation={0}>
      {(eyebrow || title || actions) && (
        <Box className="section-card-header">
          <Box>
            {eyebrow && <Typography className="eyebrow small">{eyebrow}</Typography>}
            {title && <Typography className="section-title">{title}</Typography>}
          </Box>
          {actions && <Box className="section-actions">{actions}</Box>}
        </Box>
      )}
      {children}
    </Paper>
  );
}

type MetricCardProps = {
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: 'default' | 'good' | 'warn' | 'info';
};

export function MetricCard({ label, value, helper, tone = 'default' }: MetricCardProps) {
  return (
    <Paper className={`metric-card metric-card-${tone}`} elevation={0}>
      <Typography className="metric-label">{label}</Typography>
      <Typography component="div" className="metric-value">
        {value}
      </Typography>
      {helper && <Typography className="metric-helper">{helper}</Typography>}
    </Paper>
  );
}

export function WorkflowProgress() {
  const location = useLocation();
  const routes = Object.values(ROUTES);
  const currentIndex = Math.max(
    routes.findIndex((route) => route.path === location.pathname),
    0,
  );

  return (
    <Stack className="workflow-progress" direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
      {routes.map((route, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        return (
          <Chip
            key={route.path}
            className={`workflow-chip ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
            icon={isDone ? <CheckCircleOutlineIcon /> : <RadioButtonUncheckedIcon />}
            label={route.name}
            variant={isActive ? 'filled' : 'outlined'}
          />
        );
      })}
    </Stack>
  );
}
