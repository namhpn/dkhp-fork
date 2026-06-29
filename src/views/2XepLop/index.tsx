import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import Typography from '@mui/material/Typography';
import { getTongSoTcJudgement } from '../../utils';
import {
  selectFinalDataTkb,
  selectSelectedClasses,
  selectTongSoTcSelected,
  useTkbStore,
} from '../../zus';
import { MetricCard, PageShell, SectionCard, WorkflowProgress } from '../components/PageLayout';
import AgGrid from './AgGrid';
import TrungTkbDialog, { TrungTkbDialogContext } from './TrungTkbDialog';

function Index() {
  const allClasses = useTkbStore(selectFinalDataTkb);
  const selectedClasses = useTkbStore(selectSelectedClasses);
  const tongSoTC = useTkbStore(selectTongSoTcSelected);
  const judgement = getTongSoTcJudgement(tongSoTC);
  const selectedUniqueSubjects = new Set(selectedClasses.map((item) => item.MaMH)).size;

  return (
    <div className="grid-page-shell">
      <PageShell
        eyebrow="Bước 2"
        title="Lọc, so sánh và chọn lớp"
        description="Bảng dữ liệu được tối ưu cho việc lọc nhanh theo môn học, giảng viên, lịch học và khoa quản lý. Lớp bị trùng thời khóa biểu sẽ được chặn trước khi vào danh sách chọn."
        meta={<WorkflowProgress />}
      >
        <div className="metric-grid">
          <MetricCard label="Tổng lịch học" value={allClasses.length} helper="Dòng từ file Excel" tone="info" />
          <MetricCard label="Đã chọn" value={selectedClasses.length} helper={`${selectedUniqueSubjects} mã môn duy nhất`} tone={selectedClasses.length ? 'good' : 'warn'} />
          <MetricCard label="Số tín chỉ" value={tongSoTC} helper={judgement.text} tone={judgement.isOk ? 'good' : 'warn'} />
          <MetricCard label="Công cụ" value={<TuneOutlinedIcon fontSize="large" />} helper="Filter, group, pin, preview" />
        </div>
      </PageShell>

      <TrungTkbDialogContext>
        <SectionCard
          className="ag-grid-card"
          eyebrow="Bảng lớp"
          title="Dữ liệu xếp lớp"
          actions={
            <Typography className="metric-helper">
              Chọn nhiều dòng bằng click. Dùng menu chuột phải để lọc nhanh theo giá trị.
            </Typography>
          }
        >
          <AgGrid />
        </SectionCard>
        <TrungTkbDialog />
      </TrungTkbDialogContext>
    </div>
  );
}

export default Index;
