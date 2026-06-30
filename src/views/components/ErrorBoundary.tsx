import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasErrored: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasErrored: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasErrored: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasErrored) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <Box sx={{ maxWidth: 620, margin: '48px auto', padding: 2 }}>
        <Alert severity="error" icon={<ErrorOutlineIcon />}>
          <AlertTitle>Đã xảy ra lỗi</AlertTitle>
          <Button variant="contained" size="small" onClick={this.handleReload} sx={{ mt: 1 }}>
            Tải lại trang
          </Button>

          {this.state.error && (
            <Accordion sx={{ mt: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" fontWeight={700}>
                  Chi tiết lỗi
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.25,
                    overflow: 'auto',
                    maxHeight: 260,
                    border: '1px solid var(--border-soft, var(--border-soft-fallback))',
                    borderRadius: 1,
                    bgcolor: 'var(--bg, var(--bg-fallback))',
                    color: 'var(--ink-2, var(--ink-2-fallback))',
                    fontSize: 12,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {this.state.error.stack || this.state.error.message}
                  {this.state.errorInfo?.componentStack || ''}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </Alert>
      </Box>
    );
  }
}

export default ErrorBoundary;
