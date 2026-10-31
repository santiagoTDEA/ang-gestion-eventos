import {
  certificateFileName,
  eventDateText,
  eventFileName,
  safeFileName,
  uniqueFileNames
} from './certificate-text';

describe('certificate-text', () => {
  describe('eventDateText', () => {
    it('un solo día', () => {
      expect(eventDateText('2023-11-25', '2023-11-25')).toBe('el 25 de noviembre de 2023');
    });

    it('varios días del mismo mes', () => {
      expect(eventDateText('2023-11-03', '2023-11-05')).toBe('del 3 al 5 de noviembre de 2023');
    });

    it('meses distintos del mismo año', () => {
      expect(eventDateText('2023-10-28', '2023-11-04')).toBe('del 28 de octubre al 4 de noviembre de 2023');
    });

    it('años distintos', () => {
      expect(eventDateText('2023-12-30', '2024-01-02')).toBe('del 30 de diciembre de 2023 al 2 de enero de 2024');
    });

    it('acepta fechas con hora sin correr el día por zona horaria', () => {
      expect(eventDateText('2023-11-25T00:00:00.000Z', '2023-11-25T23:00:00-05:00')).toBe('el 25 de noviembre de 2023');
    });
  });

  describe('safeFileName', () => {
    it('quita tildes y caracteres no permitidos en Windows', () => {
      expect(safeFileName('Aragón: "Bedoya" / ñandú?*')).toBe('Aragon Bedoya nandu');
    });

    it('no deja puntos ni espacios al final', () => {
      expect(safeFileName('Evento final. ')).toBe('Evento final');
    });

    it('corta los nombres largos', () => {
      expect(safeFileName('a'.repeat(200), 50).length).toBe(50);
    });

    it('usa un nombre por defecto si queda vacío', () => {
      expect(safeFileName('???')).toBe('certificado');
    });
  });

  it('certificateFileName arma el nombre con persona y documento', () => {
    expect(certificateFileName({
      id: 1,
      documentType: 'CC',
      documentNumber: '1038103291',
      fullName: 'Yorbis Aragón Bedoya'
    })).toBe('Certificado - Yorbis Aragon Bedoya - CC 1038103291.pdf');
  });

  it('eventFileName arma el nombre del ZIP o del PDF combinado', () => {
    expect(eventFileName('Power BI: desde cero')).toBe('Certificados - Power BI desde cero');
  });

  it('uniqueFileNames numera los repetidos sin importar mayúsculas', () => {
    expect(uniqueFileNames(['a.pdf', 'b.pdf', 'A.pdf', 'a.pdf'])).toEqual(['a.pdf', 'b.pdf', 'A (2).pdf', 'a (3).pdf']);
  });
});
