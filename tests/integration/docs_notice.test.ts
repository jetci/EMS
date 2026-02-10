import fs from 'fs';
import path from 'path';

describe('README historical notice', () => {
  const readmePath = path.join(process.cwd(), 'README.md');
  let content = '';

  beforeAll(() => {
    content = fs.readFileSync(readmePath, 'utf-8');
  });

  test('contains historical notice section header', () => {
    expect(content).toMatch(/## ⚠️ หมายเหตุเอกสาร\/สคริปต์ประวัติ/);
  });

  test('lists archive folders', () => {
    expect(content).toMatch(/_archive_old_docs\//);
    expect(content).toMatch(/_legacy_python_backup\//);
    expect(content).toMatch(/dev-tools\/scripts\/archive\//);
  });

  test('mentions outdated examples and current standard', () => {
    expect(content).toMatch(/password123/);
    expect(content).toMatch(/admin@wecare\.ems/);
  });
});