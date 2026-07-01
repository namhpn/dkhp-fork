import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ImageIcon from '@mui/icons-material/Image';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { Suspense, lazy, useMemo, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { getTongSoTcJudgement } from '../utils';
import {
  getUrlResolvedMaLop,
  selectFinalDataTkb,
  selectIsChiVeTkb,
  selectSelectedClassesOutput,
  selectTextareaChiVeTkb,
  selectTongSoTcOutput,
  useTkbStore,
} from '../zus';
import SelectExcelButton from './1ChonFileExcel/SelectExcelButton';
import TrungTkbDialog, { TrungTkbDialogContext } from './2XepLop/TrungTkbDialog';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import ThoiKhoaBieuTable, { TkbTableHandle } from './components/ThoiKhoaBieuTable';
import ScriptDangKyInput, { DanhSachLopInput, SuggestionPanel } from './3KetQua/ScriptDangKyInput';
import './App.css';

const AgGrid = lazy(() => import('./2XepLop/AgGrid'));

function PageHeader() {
  const setIsChiVeTkb = useTkbStore((s) => s.setIsChiVeTkb);
  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);

  return (
    <div className="header-minimal">
      <Typography component="h1" className="app-title">
        Courses
      </Typography>


      <div className="mode-toggle-centered">
        <div className="mtc-root">
          <button className={`mtc-btn${!isChiVeTkb ? ' mtc-active' : ''}`} onClick={() => setIsChiVeTkb(false)}>Xếp lớp</button>
          <button className={`mtc-btn${isChiVeTkb ? ' mtc-active' : ''}`} onClick={() => setIsChiVeTkb(true)}>Nhập mã lớp</button>
        </div>
      </div>


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
  const tkbRef = useRef<TkbTableHandle>(null);
  const selectedClasses = useTkbStore(selectSelectedClassesOutput);
  const selectedCount = useTkbStore(selectSelectedClassesOutput);
  const tongSoTC = useTkbStore(selectTongSoTcOutput);
  const creditJudgement = useMemo(() => getTongSoTcJudgement(tongSoTC), [tongSoTC]);

  if (!selectedClasses.length) return null;

  return (
    <div className="schedule-panel" aria-label="Thời khóa biểu">
      <div className="schedule-panel-header">
        <Typography component="h3" className="subsection-title">
          Thời khóa biểu
        </Typography>
        <div className="schedule-panel-actions">
          <Tooltip title="Tải hình ảnh TKB về máy">
            <IconButton onClick={() => tkbRef.current?.saveTkbImage()} size="small" className="panel-action-btn">
              <FileDownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sao chép hình ảnh TKB vào clipboard">
            <IconButton onClick={() => tkbRef.current?.copyTkbImage()} size="small" className="panel-action-btn">
              <ImageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <div className="grid-statusbar-v2">
        <div className="sb2-stat">
          <span className="sb2-value">{selectedCount.length}</span>
          <span className="sb2-label">Lớp đã chọn</span>
        </div>
        <div className={'sb2-stat' + (creditJudgement.isOk ? ' ok' : ' warn')}>
          <span className="sb2-value">{tongSoTC}</span>
          <span className="sb2-label">Số tín chỉ</span>
        </div>
      </div>
      <div id="thoi-khoa-bieu-wrapper">
        <ThoiKhoaBieuTable ref={tkbRef} />
      </div>
    </div>
  );
}

function PlanSection() {
  const allClasses = useTkbStore(selectFinalDataTkb);
  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);
  const textareaChiVeTkb = useTkbStore(selectTextareaChiVeTkb);
  const hasUrlResolved = getUrlResolvedMaLop() !== null;

  if (isChiVeTkb) {
    return (
      <section id="plan" className="task-section plan-section" aria-labelledby="plan-title">
        <SectionHeader id="plan-title" title="Xếp lớp" />
        {!textareaChiVeTkb && !hasUrlResolved && (
          <div className="manual-input-notice">
            <span>Hãy nhập vào ô Danh sách mã lớp để xếp thời khoá biểu</span>
          </div>
        )}
        <SchedulePanel />
      </section>
    );
  }

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
  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);

  return (
    <section id="output" className="task-section output-section" aria-labelledby="output-title">
      <SectionHeader
        id="output-title"
        title="Mã lớp & script"
      />

      <div className="output-panel">
        <div className="output-fields-row">
          <DanhSachLopInput />
          {isChiVeTkb ? <SuggestionPanel /> : <ScriptDangKyInput />}
        </div>
      </div>
    </section>
  );
}

function AppContent() {
  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Bỏ qua điều hướng
      </a>
      <main id="main-content" className="single-page-flow">
        <PageHeader />
        <ImportSection />
        {isChiVeTkb ? (
          <>
            <OutputSection />
            <PlanSection />
          </>
        ) : (
          <>
            <PlanSection />
            <OutputSection />
          </>
        )}
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
