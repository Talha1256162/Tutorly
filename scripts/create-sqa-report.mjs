import fs from 'node:fs/promises';
import path from 'node:path';
import docxPkg from '../frontend/tutorlypk-web/node_modules/docx/dist/index.cjs';

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
    area: 'Hosting Security',
    title: 'HTTPS is still a hosting-level launch blocker.',
    finding: 'The MonsterASP free production domain is currently served over HTTP, so login and JWT traffic do not have a browser SSL lock.',
    fix: 'Enable SSL/TLS for the production domain or move the app to hosting that supports HTTPS before inviting real users.',
  },
  {
    id: 'SQA-002',
    severity: 'Medium',
    area: 'Authentication Completeness',
    title: 'Google sign-in and password reset are intentionally incomplete.',
    finding: 'The login screen now marks Google sign-in as coming soon and gives a clear forgot-password message, but neither flow is implemented end to end.',
    fix: 'Add OAuth and password-reset email flows, or keep them disabled until product launch scope includes account recovery.',
  },
  {
    id: 'SQA-003',
    severity: 'Medium',
    area: 'Messages UX',
    title: 'Advanced messaging controls are disabled placeholders.',
    finding: 'Search works, but attachments, voice calls, video calls, and conversation options are disabled with honest titles because those backend features do not exist yet.',
    fix: 'Implement the matching messaging APIs or keep the controls disabled/hidden in the public launch build.',
  },
  {
    id: 'SQA-004',
    severity: 'Medium',
    area: 'Media Reliability',
    title: 'Tutor photos still depend on third-party image URLs.',
    finding: 'The UI now has avatar fallbacks, but seed data still references external images that can be blocked or rate-limited.',
    fix: 'Self-host tutor images or serve them through a controlled CDN/proxy before marketing traffic increases.',
  },
  {
    id: 'SQA-005',
    severity: 'Low',
    area: 'Database Operations',
    title: 'Database migrations are script-driven and not yet part of CI.',
    finding: 'A migration helper now tracks applied SQL files in dbo.schemaMigrations, but the release process still runs it manually.',
    fix: 'Wire the migration helper into a protected deployment workflow once production release automation is introduced.',
  },
  {
    id: 'SQA-006',
    severity: 'Low',
    area: 'Backend Test Coverage',
    title: 'No backend test project exists yet.',
    finding: 'Release builds pass, but backend validation/repository/auth behavior is not locked by automated unit or integration tests.',
    fix: 'Add xUnit or NUnit coverage for auth, bookings validation, saved tutors, Insight, and API fallback behavior.',
  },
  {
    id: 'SQA-007',
    severity: 'Low',
    area: 'Accessibility And Performance',
    title: 'Automated a11y and Lighthouse checks are not yet part of CI.',
    finding: 'Playwright smoke coverage exists, but axe/Lighthouse/Web Vitals style checks are not automated.',
    fix: 'Add axe-core checks and Lighthouse/Web Vitals budgets after HTTPS is enabled.',
  },
];

const tests = [
  ['dotnet build -c Release', 'PASS', '0 warnings, 0 errors.'],
  ['dotnet test -c Release --no-build', 'NOT APPLICABLE', 'No backend test projects exist yet.'],
  ['npm run build', 'PASS', 'Initial bundle is 365.89 kB, under the 500 kB warning budget.'],
  ['npm run smoke against production', 'PASS', '1 Playwright smoke test passed.'],
  ['npm test', 'PASS', 'Playwright smoke suite is now the default test command.'],
  ['SQA live audit', 'PASS WITH WATCHLIST', 'Public, student, tutor, API, and auth checks run across desktop/tablet/mobile.'],
];

const apiChecks = [
  ['Health', 'PASS', '/health returned 200 Healthy.'],
  ['Swagger', 'PASS', '/swagger/index.html returns 404 in production.'],
  ['Protected APIs', 'PASS', 'Dashboard, saved tutors, messages, and Insight setup returned 401 when unauthenticated.'],
  ['Invalid login', 'PASS', 'Invalid credentials returned 401.'],
  ['Authorized Insight setup', 'PASS', 'Student JWT returned child/setup data.'],
  ['Unknown API route', 'PASS', '/api/not-real returns JSON 404.'],
];

const sprintOrder = [
  ['1', 'Enable HTTPS/SSL for the production domain.', 'Required before real users.'],
  ['2', 'Move the migration helper into protected release automation.', 'Protects production deploys as schema evolves.'],
  ['3', 'Implement password reset and Google sign-in.', 'Completes account recovery and social auth expectations.'],
  ['4', 'Implement or hide advanced message controls.', 'Keeps the experience honest and complete.'],
  ['5', 'Self-host tutor media assets.', 'Improves reliability and brand control.'],
  ['6', 'Add backend automated tests.', 'Locks API behavior before more feature work.'],
  ['7', 'Add axe/Lighthouse checks.', 'Raises accessibility and performance confidence.'],
  ['8', 'Expand admin/reporting modules.', 'Useful after the learner/tutor flows stabilize.'],
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
  para('The current release resolves the major app-level blockers from the first audit: production Swagger is disabled, unknown API routes return JSON 404, booking validation is enforced, Saved Tutors has save/unsave actions, Tutorly Insight is reachable, mobile navigation includes logout, and npm test runs a real Playwright suite.'),
  para('The remaining highest-priority work is outside the core release code path: enable HTTPS on the production domain, complete optional auth/message features, self-host tutor media, and broaden backend/a11y/performance coverage.'),

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
  bullet('Keep disabled controls visibly disabled with tooltips until the backend feature exists.'),
  bullet('Continue verifying every dropdown/select on desktop and mobile after each UI change.'),
  bullet('Use owned image assets for tutors instead of remote stock URLs.'),
  bullet('Add trust polish before public launch: SSL lock, privacy/terms links, password reset, and consistent support actions.'),

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
