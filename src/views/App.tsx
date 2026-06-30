import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { getTongSoTcJudgement } from '../utils';
import {
  selectFinalDataTkb,
  selectIsChiVeTkb,
  selectSelectedClassesOutput,
  selectTongSoTcOutput,
  useTkbStore,
} from '../zus';
import SelectExcelButton from './1ChonFileExcel/SelectExcelButton';
import TrungTkbDialog, { TrungTkbDialogContext } from './2XepLop/TrungTkbDialog';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import ThoiKhoaBieuTable from './components/ThoiKhoaBieuTable';
import ScriptDangKyInput, { DanhSachLopInput } from './3KetQua/ScriptDangKyInput';
import './App.css';

const AgGrid = lazy(() => import('./2XepLop/AgGrid'));

const NAV_ITEMS = [
  { id: 'import', label: 'Nhập Excel', Icon: FileUploadOutlinedIcon },
  { id: 'plan', label: 'Xếp lớp', Icon: TableChartOutlinedIcon },
  { id: 'output', label: 'Mã lớp & script', Icon: ListAltOutlinedIcon },
] as const;

type NavId = typeof NAV_ITEMS[number]['id'];

function useActiveSection() {
  const [active, setActive] = useState<NavId>('import');

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id as NavId);
      },
      { rootMargin: '-18% 0px -70% 0px', threshold: [0.1, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
}

function PageHeader() {
  const active = useActiveSection();

  return (
    <div className="page-header">
      <Typography component="h1" className="app-title">
        Courses
      </Typography>
      <nav className="section-nav" aria-label="Điều hướng trong trang">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <a key={id} className={active === id ? 'section-nav-item active' : 'section-nav-item'} href={`#${id}`}>
            <Icon fontSize="small" aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

function SectionHeader({ id, title, actions }: { id: string; title: string; actions?: React.ReactNode }) {
  return (
    <div className="section-header">
      <Typography id={id} component="h2" className="section-title">
        {title}
      </Typography>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
}

function ImportSection() {
  return (
    <section id="import" className="task-section import-section" aria-labelledby="import-title">
      <SectionHeader id="import-title" title="Nhập Excel" />
      <SelectExcelButton />
    </section>
  );
}

function SchedulePanel() {
  const selectedClasses = useTkbStore(selectSelectedClassesOutput);

  if (!selectedClasses.length) return null;

  return (
    <div className="schedule-panel" aria-label="Thời khóa biểu">
      <Typography component="h3" className="subsection-title">
        Thời khóa biểu
      </Typography>
      <div id="thoi-khoa-bieu-wrapper">
        <ThoiKhoaBieuTable />
      </div>
    </div>
  );
}

function PlanSection() {
  const allClasses = useTkbStore(selectFinalDataTkb);

  return (
    <section id="plan" className="task-section plan-section" aria-labelledby="plan-title">
      <SectionHeader id="plan-title" title="Xếp lớp" />
      {allClasses.length ? (
        <TrungTkbDialogContext>
          <div className="grid-frame">
            <Suspense fallback={<LinearProgress className="inline-progress" />}>
              <AgGrid />
            </Suspense>
          </div>
          <SchedulePanel />
          <TrungTkbDialog />
        </TrungTkbDialogContext>
      ) : (
        <div className="empty-inline">
          <SearchOffOutlinedIcon fontSize="small" aria-hidden="true" />
          <span>Nạp file Excel để xem danh sách lớp.</span>
          <a href="#import" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Đi tới nhập file</a>
        </div>
      )}
    </section>
  );
}

function OutputSection() {
  const setIsChiVeTkb = useTkbStore((s) => s.setIsChiVeTkb);
  const khongXepLop = useTkbStore(selectIsChiVeTkb);
  const tongSoTC = useTkbStore(selectTongSoTcOutput);
  const judgement = useMemo(() => getTongSoTcJudgement(tongSoTC), [tongSoTC]);

  return (
    <section id="output" className="task-section output-section" aria-labelledby="output-title">
      <SectionHeader
        id="output-title"
        title="Mã lớp & script"
        actions={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <span className={judgement.isOk ? 'credit-pill ok' : 'credit-pill warn'}>{tongSoTC} tín chỉ</span>
            <Tooltip title="Bật để nhập mã lớp thủ công">
              <FormControlLabel
                className="manual-toggle"
                control={
                  <Checkbox
                    checked={khongXepLop}
                    onChange={(e) => setIsChiVeTkb(e.target.checked)}
                    name="chiVeTkb"
                    color="primary"
                    size="small"
                  />
                }
                label="Nhập mã lớp"
              />
            </Tooltip>
          </Stack>
        }
      />

      <Grid container spacing={1.5} className="script-grid-compact">
        <DanhSachLopInput />
        <ScriptDangKyInput />
      </Grid>
    </section>
  );
}

function AppContent() {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Bỏ qua điều hướng
      </a>
      <main id="main-content" className="single-page-flow">
        <PageHeader />
        <ImportSection />
        <PlanSection />
        <OutputSection />
      </main>
    </div>
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
