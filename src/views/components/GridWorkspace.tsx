import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import LinearProgress from '@mui/material/LinearProgress';
import React, { Suspense, lazy } from 'react';
import { selectFinalDataTkb, useTkbStore } from '../../zus';
import TrungTkbDialog, { TrungTkbDialogContext } from '../2XepLop/TrungTkbDialog';

const AgGrid = lazy(() => import('../2XepLop/AgGrid'));

function GridWorkspace() {
  const allClasses = useTkbStore(selectFinalDataTkb);

  if (!allClasses.length) {
    return (
      <div className="empty-inline">
        <SearchOffOutlinedIcon fontSize="small" aria-hidden="true" />
        <span>Nạp file Excel từ thanh tiêu đề để xem danh sách lớp.</span>
      </div>
    );
  }

  return (
    <TrungTkbDialogContext>
      <div className="grid-frame">
        <Suspense fallback={<LinearProgress className="inline-progress" />}>
          <AgGrid />
        </Suspense>
      </div>
      <TrungTkbDialog />
    </TrungTkbDialogContext>
  );
}

export default GridWorkspace;