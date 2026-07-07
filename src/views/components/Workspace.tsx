import clsx from 'clsx';
import React, { useRef } from 'react';
import { selectIsChiVeTkb, useTkbStore } from '../../zus';
import GridWorkspace from './GridWorkspace';
import ManualWorkspace from './ManualWorkspace';
import TimetablePanel from './TimetablePanel';
import { useWorkspaceLayout } from './useWorkspaceLayout';

function Workspace() {
  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);
  const timetableRef = useRef<HTMLDivElement>(null);
  const { isStacked, isCompact } = useWorkspaceLayout(timetableRef);

  return (
    <main
      id="main-workspace"
      className={clsx('workspace', isStacked && 'workspace--stacked')}
      tabIndex={-1}
    >
      <section className="workspace-main" aria-label="Khu vực làm việc">
        {isChiVeTkb ? <ManualWorkspace /> : <GridWorkspace />}
      </section>
      <TimetablePanel ref={timetableRef} compact={isCompact} />
    </main>
  );
}

export default Workspace;