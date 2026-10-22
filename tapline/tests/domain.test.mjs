import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, startSession, recordScan, closeSession, saveStudent, attendanceRows, attendanceSummary, normalizeUid, attendanceCsv, validateBackup, dateKey } from '../src/domain.mjs';

const time = '2026-10-23T00:00:00.000Z';
const at = seconds => new Date(Date.parse(time) + seconds * 1000);
const open = (grace = 15) => startSession(initialState(), { name: 'Demo class', section: 'C3A', graceMinutes: grace }, at(0));
test('starts with fictional roster and no fabricated attendance', () => {
  const state = initialState();
  assert.equal(state.students.length, 8); assert.equal(state.scans.length, 0); assert.equal(state.sessions.length, 0);
  assert.ok(state.students.every(s => s.demo));
});
test('normalizes reader formatting and records the correct student and time', () => {
  assert.equal(normalizeUid('04:a1-b2 01'), '04A1B201');
  const { state, scan, student } = recordScan(open(), '04:a1-b2 01', 'demo', at(1));
  assert.equal(student.name, 'Alex Reyes'); assert.equal(scan.scannedAt, at(1).toISOString()); assert.equal(scan.source, 'demo');
  assert.equal(attendanceRows(state, state.sessions[0])[0].status, 'Present');
});
test('rejects missing sessions, unknown cards, inactive cards, and the wrong section', () => {
  assert.throws(() => recordScan(initialState(), '04A1B201', 'demo', at(1)), /Start a session/);
  assert.throws(() => recordScan(open(), 'UNKNOWN99', 'demo', at(1)), /Unregistered/);
  assert.throws(() => recordScan(open(), '04A1B207', 'demo', at(1)), /roster/);
  const state = open(); state.students[0].active = false;
  assert.throws(() => recordScan(state, '04A1B201', 'demo', at(1)), /inactive/);
});
test('ignores rapid repeats but logs later taps without duplicating attendance', () => {
  let state = recordScan(open(), '04A1B201', 'demo', at(1)).state;
  assert.throws(() => recordScan(state, '04A1B201', 'demo', at(5.9)), /Repeated tap/);
  state = recordScan(state, '04A1B201', 'demo', at(6)).state;
  assert.equal(state.scans.length, 2);
  const rows = attendanceRows(state, state.sessions[0]);
  assert.equal(rows[0].taps, 2); assert.equal(rows[0].firstScan, at(1).toISOString());
  assert.equal(attendanceSummary(rows).checkedIn, 1); assert.equal(rows.length, 6);
});
test('late threshold is exact and later taps do not change an on-time arrival', () => {
  let state = open(1);
  state = recordScan(state, '04A1B201', 'demo', at(60)).state;
  state = recordScan(state, '04A1B202', 'demo', at(60.001)).state;
  state = recordScan(state, '04A1B201', 'demo', at(90)).state;
  const rows = attendanceRows(state, state.sessions[0]);
  assert.equal(rows[0].status, 'Present'); assert.equal(rows[1].status, 'Late');
  assert.equal(attendanceSummary(rows).late, 1);
});
test('only closing a session finalizes absences and prevents further scans', () => {
  let state = open(); assert.equal(attendanceRows(state, state.sessions[0])[0].status, 'Not scanned');
  state = closeSession(state, state.sessions[0].id, at(5));
  assert.equal(attendanceRows(state, state.sessions[0])[0].status, 'Absent');
  assert.throws(() => recordScan(state, '04A1B201', 'demo', at(6)), /Start a session/);
});
test('one active session; saved roster remains stable after profile changes', () => {
  let state = open();
  assert.throws(() => startSession(state, { name: 'Other', section: 'C3A', graceMinutes: 15 }, at(5)), /Close the current/);
  state = saveStudent(state, { ...state.students[0], name: 'Updated name' });
  state = saveStudent(state, { name: 'Avery Torres', studentNumber: 'NEW-009', section: 'C3A', cardUid: '04A1B209' });
  assert.equal(state.sessions[0].roster.length, 6); assert.equal(state.sessions[0].roster[0].name, 'Alex Reyes');
  assert.throws(() => recordScan(state, '04A1B209', 'demo', at(1)), /roster/);
});
test('card and student-number uniqueness is enforced, including inactive profiles', () => {
  const state = initialState();
  assert.throws(() => saveStudent(state, { name: 'Avery', studentNumber: 'NEW-009', section: 'C3A', cardUid: '04:a1:b2:01' }), /already assigned/);
  assert.throws(() => saveStudent(state, { name: 'Avery', studentNumber: 'demo-001', section: 'C3A', cardUid: '04A1B209' }), /already exists/);
  assert.throws(() => saveStudent(state, { name: 'Avery', studentNumber: 'NEW-009', section: 'C3A', cardUid: '<script>' }), /card ID/);
});
test('CSV contains timestamps and demo labels, escapes commas, and blocks formulas', () => {
  let state = open(); state = recordScan(state, '04A1B201', 'demo', at(1)).state;
  const csv = attendanceCsv(attendanceRows(state, state.sessions[0]));
  assert.ok(csv.includes('2026-10-23T00:00:01.000Z')); assert.ok(csv.includes('"demo"')); assert.ok(csv.includes('Asia/Manila'));
  const rows = attendanceRows(state, state.sessions[0]); rows[0].name = '=HYPERLINK("bad")';
  assert.ok(attendanceCsv(rows).includes('"\'=HYPERLINK(""bad"")"'));
});
test('backup restores complete valid data and rejects corrupt relationships', () => {
  let state = open(); state = recordScan(state, '04A1B201', 'demo', at(1)).state;
  const copy = JSON.parse(JSON.stringify(state)); assert.deepEqual(validateBackup(copy), state);
  const bad = structuredClone(state); bad.scans[0].studentId = 'not-in-roster';
  assert.throws(() => validateBackup(bad), /Invalid backup/);
  assert.throws(() => validateBackup({ version: 1, students: [], sessions: [], scans: [] }), /Invalid backup/);
  const duplicate = structuredClone(state); duplicate.students.push(duplicate.students[0]);
  assert.throws(() => validateBackup(duplicate), /Invalid backup/);
});
test('date filters use Philippine time even across a UTC date boundary', () => {
  assert.equal(dateKey('2026-10-22T16:30:00Z'), '2026-10-23');
});
