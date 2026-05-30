import fs from 'node:fs/promises';
import path from 'node:path';
import docxPkg from '../artifacts/sqa-docx-work/node_modules/docx/dist/index.cjs';

const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  PageNumber,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} = docxPkg;

const root = process.cwd();
const reportDir = path.join(root, 'docs', 'sqa');
const outPath = path.join(reportDir, 'Mentora-SQA-Audit-Report.docx');

await fs.mkdir(reportDir, { recursive: true });

const colors = {
  heading: '2E74B5',
  headingDark: '1F4D78',
  body: '0B2545',
  muted: '56616F',
  border: 'DADFE7',
  headerFill: 'F2F4F7',
  calloutFill: 'F4F6F9',
  criticalFill: 'FDECEC',
  highFill: 'FFF4DE',
  mediumFill: 'EEF6FF',
  lowFill: 'F5F7FA',
};

const findings = [
  {
    id: 'SQA-001',
    severity: 'Critical',
    area: 'Security',
    title: 'HTTPS is not working on the production domain.',
    finding: 'https://mentora.tryasp.net/health fails, so login and JWT traffic are currently sent over HTTP.',
    fix: 'Enable SSL/TLS on MonsterASP or move the app/domain to hosting with HTTPS before inviting real users.',
  },
  {
    id: 'SQA-002',
    severity: 'High',
    area: 'API Routing',
    title: 'Unknown API endpoints return Angular index.html with HTTP 200.',
    finding: 'Example: /api/not-real returns text/html 200 instead of a JSON 404 response.',
    fix: 'Add an API fallback before the SPA fallback so /api/{**path} returns a JSON 404.',
  },
  {
    id: 'SQA-003',
    severity: 'High',
    area: 'Security',
    title: 'Swagger is publicly exposed in production.',
    finding: '/swagger/index.html is reachable without authentication.',
    fix: 'Disable Swagger after demo, or protect it with admin auth/IP restrictions.',
  },
  {
    id: 'SQA-004',
    severity: 'High',
    area: 'Bookings',
    title: 'Demo booking accepts incomplete data.',
    finding: 'Student name, parent phone, and learning goal are nullable in backend/data model and frontend required validation is missing.',
    fix: 'Add frontend validators, backend request validation, and DB constraints where appropriate.',
  },
  {
    id: 'SQA-005',
    severity: 'Medium',
    area: 'Authentication UX',
    title: 'Login helper actions look clickable but do nothing.',
    finding: 'Continue with Google and Forgot password stay on the same page and have no working handler.',
    fix: 'Implement OAuth/password reset or hide/disable these actions with an honest coming-soon state.',
  },
  {
    id: 'SQA-006',
    severity: 'Medium',
    area: 'Saved Tutors',
    title: 'Saved Tutors module has no save action.',
    finding: 'Saved Tutors page exists, but tutor cards/profile pages do not expose Save or Heart controls.',
    fix: 'Add save/unsave on cards and profiles, with signed-out redirect to login.',
  },
  {
    id: 'SQA-007',
    severity: 'Medium',
    area: 'Marketplace UX',
    title: 'Empty search state still claims AI recommendations.',
    finding: 'Filtered empty state shows 0 tutors while the UI still says 3 AI-recommended for you.',
    fix: 'Hide the recommendation badge on empty results or replace it with recovery actions.',
  },
  {
    id: 'SQA-008',
    severity: 'Medium',
    area: 'Media Reliability',
    title: 'External tutor photos are unreliable.',
    finding: 'Chromium blocked at least one external Unsplash tutor image with ERR_BLOCKED_BY_ORB.',
    fix: 'Self-host tutor images or serve them through a controlled CDN/proxy.',
  },
  {
    id: 'SQA-009',
    severity: 'Medium',
    area: 'Messages UX',
    title: 'Messages controls are decorative.',
    finding: 'Search, paperclip, phone, video, and more icons look actionable but are static.',
    fix: 'Convert them to real buttons with handlers/tooltips or remove them until available.',
  },
  {
    id: 'SQA-010',
    severity: 'Medium',
    area: 'Accessibility',
    title: 'Several form controls rely on placeholders.',
    finding: 'Booking form fields and message input lack durable programmatic labels.',
    fix: 'Add label, aria-label, or aria-labelledby for every input/control.',
  },
  {
    id: 'SQA-011',
    severity: 'Medium',
    area: 'Mobile UX',
    title: 'Some mobile tap targets are below 44 px.',
    finding: 'Small menu/logout/link-style controls and chips are difficult to tap reliably.',
    fix: 'Increase hit areas with min-height/padding without making the UI visually bulky.',
  },
  {
    id: 'SQA-012',
    severity: 'Low',
    area: 'Routing UX',
    title: 'Unknown web routes have no proper 404 state.',
    finding: 'Invalid website routes render/redirect to the Angular shell/home with HTTP 200.',
    fix: 'Add a not-found route with helpful recovery links.',
  },
  {
    id: 'SQA-013',
    severity: 'Low',
    area: 'Test Infrastructure',
    title: 'npm test is configured but broken.',
    finding: 'angular.json has no test target, so npm test cannot determine what to run.',
    fix: 'Add Vitest/Karma or replace the script with a real test command.',
  },
  {
    id: 'SQA-014',
    severity: 'Low',
    area: 'Performance',
    title: 'Angular initial bundle exceeds warning budget.',
    finding: 'Build succeeds, but initial bundle is 616.68 kB against a 500 kB warning budget.',
    fix: 'Lazy-load feature routes and trim dependencies before scaling the product.',
  },
  {
    id: 'SQA-015',
    severity: 'Low',
    area: 'Dev Workflow',
    title: 'Debug build can fail while the local API is running.',
    finding: 'Tutorly.Api.exe locks Debug output if the local dev server is still active.',
    fix: 'Stop the dev server before Debug builds or use Release for CI/publish workflows.',
  },
];

const tests = [
  ['dotnet build -c Release', 'PASS', '0 warnings, 0 errors.'],
  ['dotnet test -c Release --no-build', 'PASS / NO TEST PROJECTS', 'No backend test projects exist yet.'],
  ['npm run build', 'PASS WITH WARNING', 'Initial bundle is 616.68 kB vs 500 kB warning budget.'],
  ['npm run smoke against production', 'PASS', '1 Playwright smoke test passed.'],
  ['npm test', 'FAIL', 'No Angular test target is configured.'],
  ['SQA live audit', 'PASS WITH FINDINGS', '48 page/viewport checks, 6 API checks, 3 auth checks.'],
];

const apiChecks = [
  ['Health', 'PASS', '/health returned 200 Healthy.'],
  ['Swagger', 'SECURITY REVIEW', '/swagger/index.html returned 200 and is public.'],
  ['Protected APIs', 'PASS', 'Dashboard, saved tutors, messages, and Insight setup returned 401 when unauthenticated.'],
  ['Invalid login', 'PASS', 'Invalid credentials returned 401.'],
  ['Authorized Insight setup', 'PASS', 'Student JWT returned child/setup data.'],
  ['Unknown API route', 'FAIL', '/api/not-real returned text/html 200 instead of JSON 404.'],
];

const sprintOrder = [
  ['1', 'Enable HTTPS and decide Swagger exposure policy.', 'Required before real users.'],
  ['2', 'Fix API 404 fallback and add a real web 404 page.', 'Prevents confusing client behavior.'],
  ['3', 'Complete auth utility actions.', 'Visible dead controls hurt trust.'],
  ['4', 'Add booking validation and labels.', 'Protects data quality and accessibility.'],
  ['5', 'Implement save/unsave tutor flow.', 'Completes an existing module.'],
  ['6', 'Wire or remove placeholder message controls.', 'Reduces confusion in a key feature.'],
  ['7', 'Add frontend and backend regression tests.', 'Locks quality before more feature work.'],
  ['8', 'Performance pass and route lazy loading.', 'Keeps the premium UI fast on mobile.'],
];

function run(text, options = {}) {
  return new TextRun({
    text,
    bold: options.bold,
    italics: options.italics,
    color: options.color ?? colors.body,
    size: options.size ?? 22,
    font: options.font ?? 'Calibri',
  });
}

function para(children, options = {}) {
  return new Paragraph({
    spacing: { before: options.before ?? 0, after: options.after ?? 120, line: options.line ?? 264 },
    alignment: options.alignment,
    children: Array.isArray(children) ? children : [run(children, options)],
  });
}

function heading(text, level = 1) {
  return new Paragraph({
    text,
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    spacing: { before: level === 1 ? 320 : 240, after: level === 1 ? 160 : 120 },
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 120, line: 280 },
    children: [run(text)],
  });
}

function table(headers, rows, widths) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: colors.border };
  const cell = (text, index, isHeader = false) => new TableCell({
    width: { size: widths[index], type: WidthType.DXA },
    shading: isHeader ? { fill: colors.headerFill } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    borders: { top: border, bottom: border, left: border, right: border },
    children: [
      new Paragraph({
        spacing: { after: 0, line: 260 },
        children: [run(String(text), { bold: isHeader, size: isHeader ? 20 : 19 })],
      }),
    ],
  });

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((header, index) => cell(header, index, true)) }),
      ...rows.map(row => new TableRow({ children: headers.map((_, index) => cell(row[index] ?? '', index)) })),
    ],
  });
}

function issueBlock(issue) {
  const fillBySeverity = {
    Critical: colors.criticalFill,
    High: colors.highFill,
    Medium: colors.mediumFill,
    Low: colors.lowFill,
  };
  const border = { style: BorderStyle.SINGLE, size: 1, color: colors.border };

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: fillBySeverity[issue.severity] },
            margins: { top: 140, bottom: 140, left: 160, right: 160 },
            borders: { top: border, bottom: border, left: border, right: border },
            children: [
              para([
                run(`${issue.id}  ${issue.severity}  `, { bold: true, color: colors.headingDark }),
                run(`${issue.area}: ${issue.title}`, { bold: true }),
              ], { after: 80 }),
              para([run('Finding: ', { bold: true }), run(issue.finding)], { after: 60 }),
              para([run('Recommended fix: ', { bold: true }), run(issue.fix)], { after: 0 }),
            ],
          }),
        ],
      }),
    ],
  });
}

function spacer(size = 120) {
  return new Paragraph({ spacing: { after: size }, children: [] });
}

const children = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [run('Mentora / Tutorly Senior SQA Audit Report', { bold: true, color: colors.body, size: 34, font: 'Calibri Light' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 280 },
    children: [run('Live production audit, automated regression results, UI/UX findings, and next-sprint backlog', { color: colors.muted, size: 22 })],
  }),
  para([run('Audit date: ', { bold: true }), run('May 30, 2026')]),
  para([run('Environment: ', { bold: true }), run('http://mentora.tryasp.net')]),
  para('Scope: production smoke testing, API behavior checks, responsive UI review, accessibility heuristics, and test infrastructure review.'),

  heading('Executive Summary'),
  para('The deployed application is live and the core marketplace journey works. Smoke coverage passed for landing, tutor browsing, login, learner dashboard, booking, Tutorly Insight setup/report/matched tutors, tutor dashboard, messages, and logout.'),
  para('The highest-priority work is production hardening and product completeness: HTTPS is missing, unknown API routes return HTTP 200 HTML, Swagger is public, visible controls are not wired, Saved Tutors has no save action, and forms need validation/accessibility polish.'),

  heading('Automated Verification Results'),
  table(['Check', 'Result', 'Notes'], tests, [3100, 1700, 4560]),
  spacer(),

  heading('Live API And Behavior Checks'),
  table(['Area', 'Result', 'Evidence'], apiChecks, [1900, 1900, 5560]),
  spacer(),

  heading('Prioritized Defect Backlog'),
  ...findings.flatMap(issue => [issueBlock(issue), spacer(80)]),

  heading('UI / Premium Polish Recommendations'),
  bullet('Keep the current premium dark glass direction; it is cohesive and generally strong across desktop and mobile.'),
  bullet('Make every visible control honest: if it looks clickable, it needs hover/focus/active states and a real action.'),
  bullet('Add a proper mobile menu drawer behind the hamburger so navigation feels complete.'),
  bullet('Improve marketplace empty states with clear filters, popular tutors, or suggested subjects.'),
  bullet('Add trust polish before public launch: SSL lock, privacy/terms links, password reset, and consistent support actions.'),
  bullet('Use owned image assets for tutors instead of remote stock URLs.'),

  heading('Recommended Next Sprint Order'),
  table(['Priority', 'Work Item', 'Why'], sprintOrder, [900, 5200, 3260]),
  spacer(),

  heading('Test Coverage Gaps'),
  bullet('No backend unit/integration test projects are currently present.'),
  bullet('No Angular unit test target is configured.'),
  bullet('Smoke test covers the happy path only; add negative tests for validation, unauthorized access, bad API routes, empty states, and broken media.'),
  bullet('Accessibility checks are heuristic only; add axe-core or Playwright accessibility checks.'),
  bullet('Performance testing is limited to build budget; add Lighthouse/Web Vitals checks after HTTPS is enabled.'),

  heading('Evidence Artifact Paths'),
  para('Live audit JSON: logs/sqa-live-audit/live-audit.json'),
  para('Screenshots: logs/sqa-live-audit/*.png'),
  para('Smoke test: frontend/tutorlypk-web/tests/tutorly-smoke.spec.ts'),
];

const doc = new Document({
  creator: 'OpenAI Codex',
  title: 'Mentora SQA Audit Report',
  description: 'Senior SQA audit report for Mentora/Tutorly production deployment.',
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 22, color: colors.body },
        paragraph: { spacing: { after: 120, line: 264 } },
      },
    },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 32, bold: true, color: colors.heading, font: 'Calibri' },
        paragraph: { spacing: { before: 320, after: 160, line: 264 } },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 26, bold: true, color: colors.heading, font: 'Calibri' },
        paragraph: { spacing: { before: 240, after: 120, line: 264 } },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840, orientation: PageOrientation.PORTRAIT },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [run('Page ', { color: colors.muted, size: 18 }), new TextRun({ children: [PageNumber.CURRENT], color: colors.muted, size: 18 })],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
await fs.writeFile(outPath, buffer);
console.log(`DOCX: ${outPath}`);
