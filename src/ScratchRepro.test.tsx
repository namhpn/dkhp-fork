import { render } from '@testing-library/react';
import App from './views/App';
import { useTkbStore } from './zus';

// Repro: manual mode + ?self_selected= URL param + no file → "Maximum update depth exceeded"
test('full app with self_selected URL codes does not loop', () => {
  localStorage.clear();
  window.history.replaceState({}, '', '/?self_selected=EC201.Q21,IT003.O21');
  useTkbStore.setState({ dataExcel: null, isChiVeTkb: false, textareaChiVeTkb: '', manualResolvedMaLop: [] });
  render(<App />);
});
