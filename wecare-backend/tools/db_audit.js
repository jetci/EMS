const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.join(__dirname, '..', 'src', 'routes');
const SCHEMA_PATH = path.join(__dirname, '..', 'db', 'schema.sql');

function readSchema() {
  const text = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const indexLines = text.split(/\r?\n/).filter(l => /CREATE INDEX IF NOT EXISTS/i.test(l));
  const indexes = indexLines.map(l => {
    const m = l.match(/CREATE INDEX IF NOT EXISTS\s+(\S+)\s+ON\s+(\S+)\s*\(([^)]+)\)/i);
    if (m) return { name: m[1], table: m[2], cols: m[3].split(',').map(c => c.trim()) };
    return null;
  }).filter(Boolean);
  return { raw: text, indexes };
}

function scanRoutes() {
  const files = fs.readdirSync(ROUTES_DIR).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
  const results = [];

  for (const f of files) {
    const p = path.join(ROUTES_DIR, f);
    const content = fs.readFileSync(p, 'utf8');

    // Find SQL string literals and template usages
    const sqlMatches = [...content.matchAll(/(['`\"])(SELECT|INSERT|UPDATE|DELETE)[\s\S]*?\1/ig)];
    const templates = [...content.matchAll(/\${[^}]+}/g)];

    const findAllUses = [...content.matchAll(/findAll\s*\(/g)];
    const dangerousTemplate = [...content.matchAll(/\`[^`]*\${[^}]+}[^`]*\`/g)];

    results.push({ file: f, sqlCount: sqlMatches.length, templateCount: templates.length, findAllUses: findAllUses.length, dangerousTemplate: dangerousTemplate.length });
  }

  return results;
}

function analyze() {
  const schema = readSchema();
  const routes = scanRoutes();

  const issues = [];

  for (const r of routes) {
    if (r.dangerousTemplate > 0) {
      issues.push({ severity: 'High', file: r.file, issue: 'Template string with ${} detected in file that may be used to build SQL. Review parameterization.' });
    }
    if (r.findAllUses > 0) {
      issues.push({ severity: 'Medium', file: r.file, issue: 'Uses sqliteDB.findAll which accepts a raw WHERE string. Ensure where clause is parameterized and validated.' });
    }
  }

  const routeFiles = fs.readdirSync(ROUTES_DIR).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
  for (const f of routeFiles) {
    const p = path.join(ROUTES_DIR, f);
    const content = fs.readFileSync(p, 'utf8');
    const whereCols = [...content.matchAll(/WHERE\s+([a-zA-Z0-9_\.]+)\s*=\s*\?/ig)].map(m => m[1]);
    for (const col of whereCols) {
      const simpleCol = col.includes('.') ? col.split('.').pop() : col;
      const hasIndex = schema.indexes.some(idx => idx.cols.includes(simpleCol));
      if (!hasIndex) {
        issues.push({ severity: 'Medium', file: f, issue: `Column '${simpleCol}' used in WHERE but no schema index found. Consider adding an index for performance.` });
      }
    }
  }

  const sysPath = path.join(ROUTES_DIR, 'system.ts');
  if (fs.existsSync(sysPath)) {
    const sys = fs.readFileSync(sysPath, 'utf8');
    if (/DROP TABLE IF EXISTS \${/i.test(sys)) {
      issues.push({ severity: 'High', file: 'system.ts', issue: 'DROP TABLE uses dynamic table name interpolation. Validate or quote table names; limit to whitelist.' });
    }
  }

  const report = { generatedAt: new Date().toISOString(), issues, routesSummary: routes };
  fs.writeFileSync(path.join(__dirname, '..', 'db_audit_report.json'), JSON.stringify(report, null, 2));
  console.log('DB audit completed. Report written to wecare-backend/db_audit_report.json');
}

analyze();
