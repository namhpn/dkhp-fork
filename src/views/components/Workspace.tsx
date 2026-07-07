import React from 'react';
import { selectIsChiVeTkb, useTkbStore } from '../../zus';
import GridWorkspace from './GridWorkspace';
import ManualWorkspace from './ManualWorkspace';
import TimetablePanel from './TimetablePanel';

function Workspace() {
  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);

  return (
    <main id="main-workspace" className="workspace" tabIndex={-1}>
      <section className="workspace-main" aria-label="Khu vực làm việc">
        {isChiVeTkb ? <ManualWorkspace /> : <GridWorkspace />}
      </section>
      <aside className="workspace-timetable" aria-label="Thời khóa biểu">
        <TimetablePanel />
      </aside>
    </main>
  );
}

export default Workspace;