import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
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
  selectDataExcel,
  selectFinalDataTkb,
  selectIsChiVeTkb,
  selectSelectedClasses,
  selectSelectedClassesOutput,
  selectTongSoTcOutput,
  selectTongSoTcSelected,
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
  { id: 'import', label: 'Import Excel', Icon: FileUploadOutlinedIcon },
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
      { rootMargin: '-20% 0px -68% 0px', threshold: [0.1, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
}

function TopBar() {
  const active = useActiveSection();
  const dataExcel = useTkbStore(selectDataExcel);
  const selectedClasses = useTkbStore(selectSelectedClasses);
  const status = dataExcel?.data?.length ? `${dataExcel.data.length} dòng · ${selectedClasses.length} lớp chọn` : 'Chưa có file';

  return (
    <header className="app-topbar">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true">
          UIT
        </div>
        <div>
          <Typography component="h1" className="app-title">
            Đăng ký học phần UIT
          </Typography>
          <Typography className="app-status">{status}</Typography>
        </div>
      </div>

      <nav className="section-nav" aria-label="Điều hướng trong trang">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <a key={id} className={active === id ? 'section-nav-item active' : 'section-nav-item'} href={`#${id}`}>
            <Icon fontSize="small" aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </header>
  );
}

function SectionHeader({ id, icon, title, actions }: { id: string; icon: React.ReactNode; title: string; actions?: React.ReactNode }) {
  return (
    <div className="section-header">
      <div className="section-heading">
        <span className="section-icon" aria-hidden="true">
          {icon}
        </span>
        <Typography id={id} component="h2" className="section-title">
          {title}
        </Typography>
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
}

function CompactStats() {
  const allClasses = useTkbStore(selectFinalDataTkb);
  const selectedClasses = useTkbStore(selectSelectedClasses);
  const tongSoTC = useTkbStore(selectTongSoTcSelected);
  const judgement = getTongSoTcJudgement(tongSoTC);

  return (
    <div className="compact-stats" aria-label="Trạng thái xếp lớp">
      <span>{allClasses.length} dòng</span>
      <span>{selectedClasses.length} lớp chọn</span>
      <span className={judgement.isOk ? 'stat-ok' : 'stat-warn'}>{tongSoTC} tín chỉ</span>
    </div>
  );
}

function ImportSection() {
  return (
    <section id="import" className="task-section import-section" aria-labelledby="import-title">
      <SectionHeader id="import-title" icon={<FileUploadOutlinedIcon fontSize="small" />} title="Import Excel" />
      <SelectExcelButton />
    </section>
  );
}

function PlanSection() {
  const allClasses = useTkbStore(selectFinalDataTkb);

  return (
    <section id="plan" className="task-section plan-section" aria-labelledby="plan-title">
      <SectionHeader id="plan-title" icon={<TableChartOutlinedIcon fontSize="small" />} title="Xếp lớp" actions={<CompactStats />} />
      {allClasses.length ? (
        <TrungTkbDialogContext>
          <div className="grid-frame">
            <Suspense fallback={<LinearProgress className="inline-progress" />}>
              <AgGrid />
            </Suspense>
          </div>
          <TrungTkbDialog />
        </TrungTkbDialogContext>
      ) : (
        <div className="empty-inline">Nạp file Excel để xem danh sách lớp.</div>
      )}
    </section>
  );
}

function OutputSection() {
  const setIsChiVeTkb = useTkbStore((s) => s.setIsChiVeTkb);
  const khongXepLop = useTkbStore(selectIsChiVeTkb);
  const selectedClasses = useTkbStore(selectSelectedClassesOutput);
  const tongSoTC = useTkbStore(selectTongSoTcOutput);
  const judgement = useMemo(() => getTongSoTcJudgement(tongSoTC), [tongSoTC]);
  const hasSelection = selectedClasses.length > 0;

  return (
    <section id="output" className="task-section output-section" aria-labelledby="output-title">
      <SectionHeader
        id="output-title"
        icon={<PlayArrowOutlinedIcon fontSize="small" />}
        title="Mã lớp & script"
        actions={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <span className={judgement.isOk ? 'credit-pill ok' : 'credit-pill warn'}>{tongSoTC} tín chỉ</span>
            <Tooltip title="Bật khi chỉ muốn nhập mã lớp thủ công">
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

      {hasSelection ? (
        <div className="schedule-panel" aria-label="Thời khóa biểu">
          <Typography component="h3" className="subsection-title">
            Thời khóa biểu
          </Typography>
          <div id="thoi-khoa-bieu-wrapper">
            <ThoiKhoaBieuTable />
          </div>
        </div>
      ) : (
        <div className="empty-inline">Chưa có lớp để xuất script.</div>
      )}
    </section>
  );
}

function AppContent() {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Bỏ qua điều hướng
      </a>
      <TopBar />
      <main id="main-content" className="single-page-flow">
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
