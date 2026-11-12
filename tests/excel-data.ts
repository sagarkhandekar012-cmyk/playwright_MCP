import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

export type TestCaseRow = {
  ID: string;
  Scenario: string;
  Steps: string;
  Expected: string;
  'Pass/Fail': string;
  'Bug ID': string;
};

const csvPath = path.resolve(__dirname, '..', 'AMOZ_Admin_Test_Cases.csv');
const resultsCsvPath = path.resolve(__dirname, '..', 'AMOZ_Admin_Test_Results.csv');

function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const character = line[index];

    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        field += '"';
        index++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === ',' && !inQuotes) {
      fields.push(field);
      field = '';
    } else {
      field += character;
    }
  }

  fields.push(field);
  return fields;
}

function escapeCsvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function readTestCases(): TestCaseRow[] {
  const lines = readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  const headers = parseCsvRow(lines.shift() ?? '');

  return lines.map((line) => {
    const values = parseCsvRow(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));

    return {
      ID: row.ID.trim(),
      Scenario: row.Scenario.trim(),
      Steps: row.Steps.trim(),
      Expected: row.Expected.trim(),
      'Pass/Fail': row['Pass/Fail'].trim(),
      'Bug ID': row['Bug ID'].trim(),
    };
  }).filter((row) => Boolean(row.ID || row.Scenario));
}

export function writeTestCaseResults(statuses: ReadonlyMap<string, 'Pass' | 'Fail'>): void {
  const lines = readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  const headers = parseCsvRow(lines.shift() ?? '');
  const idIndex = headers.indexOf('ID');
  const statusIndex = headers.indexOf('Pass/Fail');

  if (idIndex < 0 || statusIndex < 0) {
    throw new Error(`CSV must contain ID and Pass/Fail columns: ${csvPath}`);
  }

  const updatedRows = lines.map((line) => {
    const values = parseCsvRow(line);
    values[statusIndex] = statuses.get(values[idIndex] ?? '') ?? 'Not Run';

    return headers.map((_, index) => escapeCsvField(values[index] ?? '')).join(',');
  });

  writeFileSync(
    resultsCsvPath,
    `\uFEFF${[headers.map(escapeCsvField).join(','), ...updatedRows, ''].join('\r\n')}`,
    'utf8',
  );
}

export function getTestCaseByScenario(scenario: string): TestCaseRow {
  const normalizedScenario = scenario.trim().toLowerCase();
  const match = readTestCases().find((row) => row.Scenario.trim().toLowerCase() === normalizedScenario);

  if (!match) {
    throw new Error(`No CSV test case found for scenario: ${scenario}`);
  }

  return match;
}
