import { parseAndValidate, tokenise } from './manualInput';
import { SAMPLE_CLASSES } from './testFixtures';

describe('manualInput parser', () => {
  const allClasses = SAMPLE_CLASSES;

  describe('tokenise', () => {
    it('accepts comma-separated input', () => {
      expect(tokenise('EC201, IT003')).toEqual(['EC201', 'IT003']);
    });

    it('accepts newline-separated input', () => {
      expect(tokenise('EC201\nIT003')).toEqual(['EC201', 'IT003']);
    });
  });

  describe('parseAndValidate', () => {
    it('accepts course ID input', () => {
      const result = parseAndValidate('EC201', allClasses);

      expect(result.errors).toEqual([]);
      expect(result.tokens).toEqual([{ raw: 'EC201', type: 'courseId' }]);
    });

    it('accepts class code input', () => {
      const result = parseAndValidate('EC204.Q22', allClasses);

      expect(result.errors).toEqual([]);
      expect(result.tokens).toEqual([{ raw: 'EC204.Q22', type: 'baseClass' }]);
    });

    it('requires practice class to be paired with its base class', () => {
      const result = parseAndValidate('IT003.O21.1', allClasses);

      expect(result.errors).toEqual([
        {
          token: 'IT003.O21.1',
          message: 'Thiếu lớp lý thuyết IT003.O21 cho IT003.O21.1',
        },
      ]);
      expect(result.tokens).toEqual([]);
    });

    it('reports unknown course ID', () => {
      const result = parseAndValidate('ZZZZ99', allClasses);

      expect(result.errors).toEqual([
        {
          token: 'ZZZZ99',
          message: 'Không tìm thấy mã môn học',
        },
      ]);
      expect(result.tokens).toEqual([]);
    });

    it('reports unknown class code', () => {
      const result = parseAndValidate('IT003.ZZZZ', allClasses);

      expect(result.errors).toEqual([
        {
          token: 'IT003.ZZZZ',
          message: 'Không tìm thấy mã lớp',
        },
      ]);
      expect(result.tokens).toEqual([]);
    });

    it('rejects mixed course ID and class code for the same course', () => {
      const result = parseAndValidate('IT003, IT003.O21', allClasses);

      expect(result.errors).toEqual(
        expect.arrayContaining([
          {
            token: 'IT003.O21',
            message: 'Vừa nhập môn (IT003) vừa nhập lớp (IT003.O21)',
          },
          {
            token: 'IT003',
            message: 'Vừa nhập môn (IT003) vừa nhập lớp',
          },
        ]),
      );
      expect(result.tokens).toEqual([]);
    });
  });
});