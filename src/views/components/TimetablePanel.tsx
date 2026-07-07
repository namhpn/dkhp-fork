import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { enqueueSnackbar } from 'notistack';
import React, { useCallback, useMemo, useRef } from 'react';
import { extractListMaLop, getTongSoTcJudgement } from '../../utils';
import {
  selectActiveTimetableClasses,
  selectDataExcel,
  selectIsChiVeTkb,
  selectTongSoTcOutput,
  useTkbStore,
} from '../../zus';
import { getScriptDkhp } from '../3KetQua/utils';
import ThoiKhoaBieuTable, { TkbTableHandle } from './ThoiKhoaBieuTable';

type PanelState = 'no-file' | 'no-grid-selection' | 'no-manual-classes' | 'has-classes';

function getPanelState(
  hasFile: boolean,
  isChiVeTkb: boolean,
  activeClassesCount: number,
): PanelState {
  if (!hasFile) return 'no-file';
  if (activeClassesCount > 0) return 'has-classes';
  if (isChiVeTkb) return 'no-manual-classes';
  return 'no-grid-selection';
}

const EMPTY_STATE_MESSAGES: Record<Exclude<PanelState, 'has-classes'>, string> = {
  'no-file': 'Chưa có file',
  'no-grid-selection': 'Chưa chọn lớp',
  'no-manual-classes': 'Chưa có lớp',
};

function TimetablePanel() {
  const tkbRef = useRef<TkbTableHandle>(null);
  const dataExcel = useTkbStore(selectDataExcel);
  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);
  const activeClasses = useTkbStore(selectActiveTimetableClasses);
  const tongSoTC = useTkbStore(selectTongSoTcOutput);
  const creditJudgement = useMemo(() => getTongSoTcJudgement(tongSoTC), [tongSoTC]);

  const listMaLop = useMemo(() => extractListMaLop(activeClasses), [activeClasses]);
  const script = useMemo(() => getScriptDkhp(listMaLop), [listMaLop]);
  const hasClasses = listMaLop.length > 0;

  const panelState = getPanelState(!!dataExcel, isChiVeTkb, activeClasses.length);

  const shareUrl = useMemo(() => {
    if (!hasClasses) return '';
    return `${window.location.origin}${window.location.pathname}?self_selected=${listMaLop.join(',')}`;
  }, [hasClasses, listMaLop]);

  const copyText = useCallback(async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      enqueueSnackbar(successMessage, { variant: 'success' });
    } catch {
      enqueueSnackbar('Không thể sao chép', { variant: 'error' });
    }
  }, []);

  const handleCopyMaLop = useCallback(() => {
    if (!hasClasses) return;
    void copyText(listMaLop.join(','), 'Đã sao chép mã lớp');
  }, [copyText, hasClasses, listMaLop]);

  const handleCopyScript = useCallback(() => {
    if (!hasClasses) return;
    void copyText(script, 'Đã sao chép script');
  }, [copyText, hasClasses, script]);

  const handleShare = useCallback(async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({ url: shareUrl });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }

    void copyText(shareUrl, 'Đã sao chép link');
  }, [copyText, shareUrl]);

  const handleSaveImage = useCallback(() => {
    tkbRef.current?.saveTkbImage();
  }, []);

  return (
    <div className="schedule-panel timetable-panel">
      <div className="schedule-panel-header">
        <div className="timetable-panel-title-row">
          <Typography component="h2" className="subsection-title">
            Thời khóa biểu
          </Typography>
          {panelState === 'has-classes' && (
            <div className="timetable-panel-stats" aria-label="Thống kê lớp đã chọn">
              <span className="timetable-stat">
                <span className="timetable-stat-value">{listMaLop.length}</span>
                <span className="timetable-stat-label">Lớp đã chọn</span>
              </span>
              <span
                className={
                  'timetable-stat' + (creditJudgement.isOk ? '' : ' timetable-stat--warn')
                }
              >
                <span className="timetable-stat-value">{tongSoTC}</span>
                <span className="timetable-stat-label">Số tín chỉ</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="timetable-toolbar" role="toolbar" aria-label="Thao tác thời khóa biểu">
        <Button
          size="small"
          variant="outlined"
          className="timetable-toolbar-btn"
          disabled={!hasClasses}
          onClick={handleCopyMaLop}
        >
          Sao chép mã lớp
        </Button>
        <Button
          size="small"
          variant="outlined"
          className="timetable-toolbar-btn"
          disabled={!hasClasses}
          onClick={handleCopyScript}
        >
          Sao chép script
        </Button>
        <Button
          size="small"
          variant="outlined"
          className="timetable-toolbar-btn"
          disabled={!hasClasses}
          onClick={() => void handleShare()}
        >
          Chia sẻ
        </Button>
        <Button
          size="small"
          variant="outlined"
          className="timetable-toolbar-btn"
          disabled={!hasClasses}
          onClick={handleSaveImage}
          startIcon={<FileDownloadIcon fontSize="small" />}
        >
          Tải ảnh TKB
        </Button>
      </div>

      {panelState === 'has-classes' ? (
        <div id="thoi-khoa-bieu-wrapper">
          <ThoiKhoaBieuTable ref={tkbRef} />
        </div>
      ) : (
        <div className="timetable-empty-state" role="status">
          {EMPTY_STATE_MESSAGES[panelState]}
        </div>
      )}
    </div>
  );
}

export default TimetablePanel;