export const STORAGE_KEY = 'tapline.workspace.v1';
export const TIME_ZONE = 'Asia/Manila';
export const uid = () => crypto.randomUUID();
export const normalizeUid = value => String(value ?? '').replace(/[\s:\-]/g, '').toUpperCase();
export const validUid = value => /^[A-Z0-9]{4,32}$/.test(normalizeUid(value));
export const dateKey = date => new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));
export const formatDate = (date, options = {}) => new Intl.DateTimeFormat('en-PH', { timeZone: TIME_ZONE, month: 'short', day: 'numeric', ...options }).format(new Date(date));
export const formatTime = date => date ? new Intl.DateTimeFormat('en-PH', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(new Date(date)) : '—';
export const initials = name => name.split(/\s+/).filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();

export function initialState() {
  const names = ['Alex Reyes', 'Jamie Santos', 'Sam Rivera', 'Casey Cruz', 'Taylor Garcia', 'Morgan Flores', 'Riley Mendoza', 'Jordan Ramos'];
  return {
    version: 1,
    students: names.map((name, i) => ({ id: `demo-student-${i + 1}`, name, studentNumber: `DEMO-${String(i + 1).padStart(3, '0')}`, section: i < 6 ? 'C3A' : 'C3B', cardUid: `04A1B2${String(i + 1).padStart(2, '0')}`, active: true, demo: true })),
    sessions: [], scans: [], settings: { workspace: 'Campus workspace', defaultGrace: 15 },
  };
}

export function saveStudent(state, input) {
  const name = String(input.name || '').trim();
  const studentNumber = String(input.studentNumber || '').trim().toUpperCase();
  const section = String(input.section || '').trim().toUpperCase();
  const cardUid = normalizeUid(input.cardUid);
  if (!name || name.length > 80 || !studentNumber || studentNumber.length > 32 || !section || section.length > 32) throw new Error('Enter a name, student number, and section within the field limits.');
  if (!validUid(cardUid)) throw new Error('Use a card ID of 4–32 letters or numbers. Spaces, colons, and hyphens are ignored.');
  if (state.students.some(s => s.id !== input.id && s.cardUid === cardUid)) throw new Error('This RFID card is already assigned to another student.');
  if (state.students.some(s => s.id !== input.id && s.studentNumber.toUpperCase() === studentNumber)) throw new Error('This student number already exists.');
  const previous = state.students.find(s => s.id === input.id);
  const student = { id: previous?.id || uid(), name, studentNumber, section, cardUid, active: previous?.active ?? true, demo: previous?.demo ?? false };
  return { ...state, students: previous ? state.students.map(s => s.id === student.id ? student : s) : [...state.students, student] };
}

export function startSession(state, input, now = new Date()) {
  if (state.sessions.some(s => s.status === 'open')) throw new Error('Close the current session before starting another.');
  const name = String(input.name || '').trim();
  const section = String(input.section || '').trim().toUpperCase();
  const graceMinutes = Number(input.graceMinutes);
  if (!name || name.length > 80) throw new Error('Enter a session name (up to 80 characters).');
  if (!Number.isInteger(graceMinutes) || graceMinutes < 0 || graceMinutes > 180) throw new Error('The late threshold must be a whole number from 0 to 180 minutes.');
  const roster = state.students.filter(s => s.active && s.section === section).map(s => ({ ...s }));
  if (!roster.length) throw new Error('This section has no active registered students.');
  const session = { id: uid(), name, section, startedAt: now.toISOString(), closedAt: null, status: 'open', graceMinutes, roster };
  return { ...state, sessions: [...state.sessions, session] };
}

export function closeSession(state, sessionId, now = new Date()) {
  const session = state.sessions.find(s => s.id === sessionId);
  if (!session || session.status !== 'open') throw new Error('This session is already closed.');
  return { ...state, sessions: state.sessions.map(s => s.id === sessionId ? { ...s, status: 'closed', closedAt: now.toISOString() } : s) };
}

export function recordScan(state, rawUid, source = 'demo', now = new Date()) {
  if (!['demo', 'keyboard', 'serial'].includes(source)) throw new Error('Unknown scan source.');
  const cardUid = normalizeUid(rawUid);
  if (!validUid(cardUid)) throw new Error('Enter a valid RFID card ID.');
  const session = state.sessions.find(s => s.status === 'open');
  if (!session) throw new Error('Start a session before scanning a card.');
  const student = state.students.find(s => s.active && s.cardUid === cardUid);
  if (!student) throw new Error('Unregistered or inactive card. Register this card before scanning.');
  if (!session.roster.some(s => s.id === student.id)) throw new Error(`${student.name} is not on this session’s roster. Start a new session to include roster changes.`);
  if (now.getTime() < Date.parse(session.startedAt)) throw new Error('The scan time cannot be earlier than the session start.');
  const previous = state.scans.filter(s => s.sessionId === session.id && s.studentId === student.id).sort((a, b) => Date.parse(b.scannedAt) - Date.parse(a.scannedAt))[0];
  if (previous && now.getTime() - Date.parse(previous.scannedAt) < 5000) throw new Error('Repeated tap ignored. Please wait 5 seconds between taps.');
  const scan = { id: uid(), sessionId: session.id, studentId: student.id, cardUid, scannedAt: now.toISOString(), source };
  return { state: { ...state, scans: [...state.scans, scan] }, scan, student, repeat: !!previous };
}

// One attendance row per roster student; later accepted taps remain in the tap log.
export function attendanceRows(state, session) {
  if (!session) return [];
  return session.roster.map(student => {
    const scans = state.scans.filter(e => e.sessionId === session.id && e.studentId === student.id).sort((a,b) => Date.parse(a.scannedAt) - Date.parse(b.scannedAt));
    const first = scans[0];
    const status = first ? (Date.parse(first.scannedAt) > Date.parse(session.startedAt) + session.graceMinutes * 60000 ? 'Late' : 'Present') : session.status === 'closed' ? 'Absent' : 'Not scanned';
    return { ...student, firstScan: first?.scannedAt || null, source: first?.source || null, taps: scans.length, status, sessionName: session.name, sessionId: session.id, sessionDate: dateKey(session.startedAt) };
  });
}

export function attendanceSummary(rows) {
  const present = rows.filter(r => r.status === 'Present').length;
  const late = rows.filter(r => r.status === 'Late').length;
  return { total: rows.length, present, late, checkedIn: present + late, remaining: rows.length - present - late, rate: rows.length ? Math.round((present + late) / rows.length * 100) : 0 };
}

const csvCell = value => {
  let text = String(value ?? '');
  // Prevent spreadsheet formula execution when CSVs contain user-supplied values.
  if (/^[\s]*[=+@\-\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};
export function makeCsv(headers, rows) { return '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n'); }
export function attendanceCsv(rows) {
  return makeCsv(['Session', 'Session date (Asia/Manila)', 'Student number', 'Name', 'Section', 'Status', 'First scan (ISO UTC)', 'First scan (Asia/Manila)', 'Source', 'Accepted taps'], rows.map(r => [r.sessionName, r.sessionDate, r.studentNumber, r.name, r.section, r.status, r.firstScan, r.firstScan ? formatTime(r.firstScan) : '', r.source, r.taps]));
}

export function validateBackup(value) {
  const fail = () => { throw new Error('Invalid backup. Use an unmodified Tapline JSON backup.'); };
  const text = (v, max = 100) => typeof v === 'string' && v.length > 0 && v.length <= max;
  const validDate = v => typeof v === 'string' && Number.isFinite(Date.parse(v));
  const isStudent = s => s && text(s.id) && text(s.name, 80) && text(s.studentNumber, 32) && text(s.section, 32) && validUid(s.cardUid) && s.cardUid === normalizeUid(s.cardUid) && typeof s.active === 'boolean';
  const unique = values => new Set(values).size === values.length;
  if (!value || value.version !== 1 || !Array.isArray(value.students) || !Array.isArray(value.sessions) || !Array.isArray(value.scans)) fail();
  if (value.students.length > 10000 || value.sessions.length > 10000 || value.scans.length > 100000) fail();
  if (!value.students.every(isStudent) || !unique(value.students.map(s => s.id)) || !unique(value.students.map(s => s.cardUid)) || !unique(value.students.map(s => s.studentNumber.toUpperCase()))) fail();
  if (!value.sessions.every(s => s && text(s.id) && text(s.name, 80) && text(s.section, 32) && validDate(s.startedAt) && ['open', 'closed'].includes(s.status) && Number.isInteger(s.graceMinutes) && s.graceMinutes >= 0 && s.graceMinutes <= 180 && Array.isArray(s.roster) && s.roster.length > 0 && s.roster.every(isStudent) && unique(s.roster.map(r => r.id)) && s.roster.every(r => r.section === s.section) && (s.status === 'open' ? s.closedAt === null : validDate(s.closedAt) && Date.parse(s.closedAt) >= Date.parse(s.startedAt)))) fail();
  if (!unique(value.sessions.map(s => s.id)) || value.sessions.filter(s => s.status === 'open').length > 1) fail();
  if (!value.scans.every(e => {
    const session = value.sessions.find(s => s.id === e?.sessionId);
    return e && text(e.id) && session && session.roster.some(r => r.id === e.studentId) && validUid(e.cardUid) && validDate(e.scannedAt) && Date.parse(e.scannedAt) >= Date.parse(session.startedAt) && (!session.closedAt || Date.parse(e.scannedAt) <= Date.parse(session.closedAt)) && ['demo', 'keyboard', 'serial'].includes(e.source);
  }) || !unique(value.scans.map(s => s.id))) fail();
  if (!value.settings || !text(value.settings.workspace, 60) || !Number.isInteger(value.settings.defaultGrace) || value.settings.defaultGrace < 0 || value.settings.defaultGrace > 180) fail();
  return value;
}
