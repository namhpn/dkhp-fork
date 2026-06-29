import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { PageShell, SectionCard, WorkflowProgress } from './PageLayout';

function NeedStep1Warning() {
  const location = useLocation();

  return (
    <PageShell
      eyebrow="Thiếu dữ liệu"
      title="Bạn cần nạp file Excel trước"
      description="Các bước xếp lớp và xuất kết quả phụ thuộc vào dữ liệu thời khóa biểu. Hãy quay lại bước 1 để chọn file Excel của UIT."
      meta={<WorkflowProgress />}
    >
      <SectionCard title="Chưa có dữ liệu để xử lý">
        <Typography className="page-description" style={{ marginTop: 0 }}>
          Sau khi nạp file, ứng dụng sẽ tự mở khóa bảng xếp lớp và màn hình xuất thời khóa biểu.
        </Typography>
        <Button
          component={Link}
          to={ROUTES._1ChonFileExcel.path + location.search}
          variant="contained"
          startIcon={<FileUploadOutlinedIcon />}
          style={{ marginTop: 18 }}
        >
          Về bước 1
        </Button>
      </SectionCard>
    </PageShell>
  );
}

export default NeedStep1Warning;
