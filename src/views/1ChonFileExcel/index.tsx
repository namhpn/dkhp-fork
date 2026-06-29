import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { selectDataExcel, useTkbStore } from '../../zus';
import { MetricCard, PageShell, SectionCard, WorkflowProgress } from '../components/PageLayout';
import SelectExcelButton from './SelectExcelButton';
import { getLastUpdateString } from './utils';

function Index() {
  const dataExcel = useTkbStore(selectDataExcel);
  const lastUpdateString = getLastUpdateString(dataExcel);

  return (
    <PageShell
      eyebrow="Bước 1"
      title="Chuẩn bị dữ liệu trước khi xếp lớp"
      description="Bắt đầu bằng file Excel thời khóa biểu của UIT. Ứng dụng sẽ đọc dữ liệu lý thuyết và thực hành ngay trên máy của bạn, sau đó chuyển sang bước chọn lớp."
      meta={<WorkflowProgress />}
      actions={
        <Button
          variant="outlined"
          endIcon={<OpenInNewOutlinedIcon />}
          href="https://github.com/loia5tqd001/Dang-Ky-Hoc-Phan-UIT?tab=readme-ov-file#c%C3%A1c-update-%E1%BB%9F-phi%C3%AAn-b%E1%BA%A3n-2024"
          target="_blank"
          rel="noreferrer"
        >
          Hướng dẫn
        </Button>
      }
    >
      <div className="metric-grid">
        <MetricCard
          label="Dữ liệu Excel"
          value={dataExcel?.data?.length ?? 0}
          helper="Dòng lịch học đã đọc"
          tone={dataExcel?.data?.length ? 'good' : 'warn'}
        />
        <MetricCard label="Cập nhật gần nhất" value={lastUpdateString ? 'Đã có' : 'Chưa có'} helper={lastUpdateString || 'Chọn file để bắt đầu'} tone="info" />
        <MetricCard label="Quy trình" value="3" helper="Bước: nạp file, xếp lớp, xuất kết quả" />
        <MetricCard label="Lưu trữ" value="Local" helper="Không cần backend cho dữ liệu TKB" />
      </div>

      <SectionCard title="Nạp file thời khóa biểu" eyebrow="Nguồn dữ liệu">
        <SelectExcelButton />
      </SectionCard>

      <SectionCard title="Cách dùng sau khi nạp file" eyebrow="Luồng thao tác">
        <div className="guidance-grid">
          <div className="guidance-item">
            <span className="guidance-kicker">1</span>
            <Typography className="guidance-title">Lọc môn cần học</Typography>
            <Typography className="guidance-text">
              Sang bước xếp lớp, dùng ô lọc theo mã môn, tên môn, giảng viên, thứ, tiết hoặc khoa quản lý.
            </Typography>
          </div>
          <div className="guidance-item">
            <span className="guidance-kicker">2</span>
            <Typography className="guidance-title">Chọn lớp không trùng lịch</Typography>
            <Typography className="guidance-text">
              Bảng sẽ ngăn các lớp bị trùng thời khóa biểu và giữ lại lựa chọn hợp lệ trong bộ nhớ trình duyệt.
            </Typography>
          </div>
          <div className="guidance-item">
            <span className="guidance-kicker">3</span>
            <Typography className="guidance-title">Xuất TKB và script</Typography>
            <Typography className="guidance-text">
              Kiểm tra thời khóa biểu cuối cùng, sao chép danh sách mã lớp hoặc script đăng ký nhanh.
            </Typography>
          </div>
        </div>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} mt={2}>
          <Button
            variant="text"
            href="https://github.com/loia5tqd001/Dang-Ky-Hoc-Phan-UIT/issues/21"
            target="_blank"
            rel="noreferrer"
            endIcon={<OpenInNewOutlinedIcon />}
          >
            Câu hỏi thường gặp
          </Button>
          <Button
            variant="text"
            href="https://www.youtube.com/watch?v=DsLUHgX_xzs"
            target="_blank"
            rel="noreferrer"
            endIcon={<OpenInNewOutlinedIcon />}
          >
            Video dùng script
          </Button>
        </Stack>
      </SectionCard>
    </PageShell>
  );
}

export default Index;
