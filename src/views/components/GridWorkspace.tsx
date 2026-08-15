import LinearProgress from '@mui/material/LinearProgress';
import React, { Suspense, lazy } from 'react';
import { selectDataExcel, useTkbStore } from '../../zus';

const AgGrid = lazy(() => import('../2XepLop/AgGrid'));

function GridWorkspace() {
  const dataExcel = useTkbStore(selectDataExcel);

  if (!dataExcel) {
    return (
      <div className="empty-inline">
        <span>Chưa có file</span>
      </div>
    );
  }

  return (
    <div className="grid-frame">
      <Suspense fallback={<LinearProgress className="inline-progress" />}>
        <AgGrid />
      </Suspense>
    </div>
  );
}

export default GridWorkspace;
