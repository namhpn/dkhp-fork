import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { getTongSoTcJudgement } from '../../utils';
import {
  selectIsChiVeTkb,
  selectSelectedClassesBuoc3,
  selectTongSoTcBuoc3,
  useTkbStore,
} from '../../zus';
import { MetricCard, PageShell, SectionCard, WorkflowProgress } from '../components/PageLayout';
import ThoiKhoaBieuTable from '../components/ThoiKhoaBieuTable';
import ScriptDangKyInput, { DanhSachLopInput } from './ScriptDangKyInput';

function Index() {
  const setIsChiVeTkb = useTkbStore((s) => s.setIsChiVeTkb);
  const khongXepLop = useTkbStore(selectIsChiVeTkb);
  const tongSoTC = useTkbStore(selectTongSoTcBuoc3);
  const selectedClasses = useTkbStore(selectSelectedClassesBuoc3);
  const judgement = getTongSoTcJudgement(tongSoTC);
  const selectedUniqueSubjects = new Set(selectedClasses.map((item) => item.MaMH)).size;

  return (
    <PageShell
      eyebrow="Bước 3"
      title="Kiểm tra thời khóa biểu và xuất script"
      description="Đây là màn hình xác nhận cuối: xem lại TKB, nhập danh sách mã lớp thủ công nếu cần, rồi sao chép script đăng ký nhanh."
      meta={<WorkflowProgress />}
    >
      <div className="metric-grid">
        <MetricCard label="Lớp trong kết quả" value={selectedClasses.length} helper={`${selectedUniqueSubjects} mã môn duy nhất`} tone="info" />
        <MetricCard label="Tổng tín chỉ" value={tongSoTC} helper={judgement.text} tone={judgement.isOk ? 'good' : 'warn'} />
        <MetricCard label="Chế độ" value={khongXepLop ? 'Tự nhập' : 'Từ bước 2'} helper="Nguồn danh sách mã lớp" />
        <MetricCard label="Đầu ra" value="TKB + JS" helper="Ảnh thời khóa biểu và script" tone="good" />
      </div>

      <SectionCard
        eyebrow="Đầu ra đăng ký"
        title="Danh sách mã lớp và script"
        actions={
          <Tooltip
            title={
              window.location.search.includes('self_selected')
                ? 'Đang dùng tính năng chia sẻ TKB ?self_selected='
                : 'Tick chọn khi bạn không dùng chức năng Xếp Lớp ở Bước 2 và nhập danh sách lớp tự chuẩn bị'
            }
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={khongXepLop}
                  onChange={(e) => {
                    setIsChiVeTkb(e.target.checked);
                  }}
                  name="chiVeTkb"
                  color="primary"
                  size="small"
                />
              }
              label={<Typography className="metric-helper">Tự chuẩn bị danh sách mã lớp</Typography>}
            />
          </Tooltip>
        }
      >
        <Grid container spacing={2} className="script-grid">
          <DanhSachLopInput />
          <ScriptDangKyInput />
        </Grid>
      </SectionCard>

      <SectionCard eyebrow="Thời khóa biểu" title="Lịch học trực quan">
        <div id="thoi-khoa-bieu-wrapper">
          <ThoiKhoaBieuTable />
        </div>
      </SectionCard>
    </PageShell>
  );
}

export default Index;
