import {
  getUrlResolvedMaLop,
  selectActiveTimetableClasses,
  selectIsChiVeTkb,
  useTkbStore,
} from './index';
import { SAMPLE_CLASSES, SAMPLE_DATA_EXCEL } from '../testFixtures';
import { ClassModel } from '../types';

const initialState = useTkbStore.getState();

function resetStore() {
  localStorage.clear();
  useTkbStore.setState({
    ...initialState,
    dataExcel: null,
    selectedClasses: [],
    agGridColumnState: null,
    agGridFilterModel: null,
    isChiVeTkb: true,
    textareaChiVeTkb: '',
    manualResolvedMaLop: [],
  });
}

function setLocationSearch(search: string) {
  const url = `http://localhost/${search.startsWith('?') ? search : `?${search}`}`;
  window.history.replaceState({}, '', url);
}

describe('useTkbStore', () => {
  beforeEach(() => {
    setLocationSearch('');
    resetStore();
  });

  describe('setDataExcel', () => {
    it('clears selectedClasses and manualResolvedMaLop on file replacement', () => {
      const selectedClass = SAMPLE_CLASSES[0];
      useTkbStore.getState().setSelectedClasses([selectedClass]);
      useTkbStore.getState().setManualResolvedMaLop(['EC201.Q21', 'EC201.Q21.1']);
      useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);

      const state = useTkbStore.getState();
      expect(state.selectedClasses).toEqual([]);
      expect(state.manualResolvedMaLop).toEqual([]);
      expect(state.dataExcel?.fileName).toBe('test.xlsx');
    });

    it('preserves textareaChiVeTkb and isChiVeTkb on file replacement', () => {
      useTkbStore.getState().setIsChiVeTkb(false);
      useTkbStore.getState().setTextareChiVeTkb('ec201, it003.o21');

      useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);

      const state = useTkbStore.getState();
      expect(state.isChiVeTkb).toBe(false);
      expect(state.textareaChiVeTkb).toBe('EC201, IT003.O21');
    });
  });

  describe('setTextareChiVeTkb', () => {
    it('uppercases input and clears manualResolvedMaLop', () => {
      useTkbStore.getState().setManualResolvedMaLop(['EC201.Q21']);
      useTkbStore.getState().setTextareChiVeTkb('ec201.q21, it003');

      const state = useTkbStore.getState();
      expect(state.textareaChiVeTkb).toBe('EC201.Q21, IT003');
      expect(state.manualResolvedMaLop).toEqual([]);
    });
  });

  describe('shared URL', () => {
    it('getUrlResolvedMaLop parses and normalizes codes from ?self_selected=', () => {
      setLocationSearch('?self_selected=ec201.q21,%20it003.o21');

      expect(getUrlResolvedMaLop()).toEqual(['EC201.Q21', 'IT003.O21']);
    });

    it('selectIsChiVeTkb is true when self_selected is present in URL', () => {
      setLocationSearch('?self_selected=EC201.Q21');

      expect(selectIsChiVeTkb(useTkbStore.getState())).toBe(true);
    });

    it('populates manual textarea and resolved output like ScriptDangKyInput on load', () => {
      setLocationSearch('?self_selected=EC201.Q21,EC201.Q21.1');
      useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);

      const urlCodes = getUrlResolvedMaLop();
      expect(urlCodes).toEqual(['EC201.Q21', 'EC201.Q21.1']);

      const { setTextareChiVeTkb, setManualResolvedMaLop } = useTkbStore.getState();
      setTextareChiVeTkb(urlCodes!.join(', '));
      setManualResolvedMaLop(urlCodes!);

      const state = useTkbStore.getState();
      expect(selectIsChiVeTkb(state)).toBe(true);
      expect(state.textareaChiVeTkb).toBe('EC201.Q21, EC201.Q21.1');
      expect(state.manualResolvedMaLop).toEqual(['EC201.Q21', 'EC201.Q21.1']);

      const output = selectActiveTimetableClasses(state);
      expect(output.map((row) => row.MaLop).sort()).toEqual(['EC201.Q21', 'EC201.Q21.1']);
    });
  });

  describe('selectActiveTimetableClasses', () => {
    it('returns grid selectedClasses in Xếp lớp mode', () => {
      const gridSelection: ClassModel[] = [SAMPLE_CLASSES[3], SAMPLE_CLASSES[5]];
      useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
      useTkbStore.getState().setIsChiVeTkb(false);
      useTkbStore.getState().setSelectedClasses(gridSelection);
      useTkbStore.getState().setManualResolvedMaLop(['EC201.Q21']);

      const output = selectActiveTimetableClasses(useTkbStore.getState());
      expect(output).toEqual(gridSelection);
    });

    it('returns manual resolved output in Nhập mã lớp mode', () => {
      useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
      useTkbStore.getState().setIsChiVeTkb(true);
      useTkbStore.getState().setSelectedClasses([SAMPLE_CLASSES[0]]);
      useTkbStore.getState().setManualResolvedMaLop(['IT003.O21', 'IT003.O21.1']);

      const output = selectActiveTimetableClasses(useTkbStore.getState());
      expect(output.map((row) => row.MaLop).sort()).toEqual(['IT003.O21', 'IT003.O21.1']);
    });
  });
});