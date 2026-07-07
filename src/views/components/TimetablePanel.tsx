import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ImageIcon from '@mui/icons-material/Image';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useMemo, useRef } from 'react';
import { getTongSoTcJudgement } from '../../utils';
import { selectSelectedClassesOutput, selectTongSoTcOutput, useTkbStore } from '../../zus';
import ThoiKhoaBieuTable, { TkbTableHandle } from './ThoiKhoaBieuTable';

function TimetablePanel() {
  const tkbRef = useRef<TkbTableHandle>(null);
  const selectedClasses = useTkbStore(selectSelectedClassesOutput);
  const selectedCount = useTkbStore(selectSelectedClassesOutput);
  const tongSoTC = useTkbStore(selectTongSoTcOutput);
  const creditJudgement = useMemo(() => getTongSoTcJudgement(tongSoTC), [tongSoTC]);

  if (!selectedClasses.length) {
    return null;
  }

  return (
    <div className="schedule-panel timetable-panel">
      <div className="schedule-panel-header">
        <Typography component="h2" className="subsection-title">
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

export default TimetablePanel;