import { CertificateParticipant } from '../interfaces/certificates.interfaces';

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

/** 'yyyy-mm-dd' -> partes, sin pasar por Date para no correr el día por zona horaria. */
function dateParts(value: string): { day: number; month: string; year: number } {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return { day, month: MONTHS[month - 1], year };
}

/** "el 25 de noviembre de 2023", "del 3 al 5 de noviembre de 2023", etc. */
export function eventDateText(startDate: string, endDate: string): string {
  const start = dateParts(startDate);
  const end = dateParts(endDate);

  if (startDate.slice(0, 10) === endDate.slice(0, 10)) {
    return `el ${end.day} de ${end.month} de ${end.year}`;
  }
  if (start.year !== end.year) {
    return `del ${start.day} de ${start.month} de ${start.year} al ${end.day} de ${end.month} de ${end.year}`;
  }
  if (start.month !== end.month) {
    return `del ${start.day} de ${start.month} al ${end.day} de ${end.month} de ${end.year}`;
  }
  return `del ${start.day} al ${end.day} de ${end.month} de ${end.year}`;
}

/**
 * Texto apto para nombre de archivo en Windows, macOS y Linux: sin tildes,
 * sin caracteres reservados y con espacios simples.
 */
export function safeFileName(value: string, maxLength = 80): string {
  const clean = value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
    .replace(/[. ]+$/, '');

  return clean || 'certificado';
}

/** "Certificado - Yorbis Aragon Bedoya - CC 1038103291.pdf" */
export function certificateFileName(participant: CertificateParticipant): string {
  return `${safeFileName(
    `Certificado - ${participant.fullName} - ${participant.documentType} ${participant.documentNumber}`,
    150
  )}.pdf`;
}

/** "Certificados - Power BI desde cero" (sin extensión). */
export function eventFileName(eventName: string): string {
  return safeFileName(`Certificados - ${eventName}`, 120);
}

/** Evita que dos archivos del ZIP se pisen si el nombre coincide: agrega " (2)", " (3)"... */
export function uniqueFileNames(names: string[]): string[] {
  const used = new Map<string, number>();

  return names.map(name => {
    const key = name.toLowerCase();
    const count = (used.get(key) ?? 0) + 1;
    used.set(key, count);

    return count === 1 ? name : name.replace(/(\.[^.]+)?$/, ` (${count})$1`);
  });
}
