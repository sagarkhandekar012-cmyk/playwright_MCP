// Import Node's synchronous file-reading and file-writing functions.
import { readFileSync, writeFileSync } from 'fs';
// Import path helpers so CSV files can be located consistently on any operating system.
import path from 'path';

// Describe the fields that every test-case row must provide after parsing the CSV.
export type TestCaseRow = {
  // The unique ID assigned to the test case.
  ID: string;
  // The short name of the test scenario.
  Scenario: string;
  // The actions a tester should perform.
  Steps: string;
  // The result expected from the test.
  Expected: string;
  // Whether the test case passed or failed.
  'Pass/Fail': string;
  // The ID of a related bug, if one exists.
  'Bug ID': string;
};

// Resolve the source test-case CSV relative to this TypeScript file's folder.
const csvPath = path.resolve(__dirname, '..', 'AMOZ_Admin_Test_Cases.csv');
// Resolve the CSV file where the reporter will save test results.
const resultsCsvPath = path.resolve(__dirname, '..', 'AMOZ_Admin_Test_Results.csv');

// Split one CSV line into fields while preserving commas inside quoted fields.
function parseCsvRow(line: string): string[] {
  // Store each completed field from the row.
  const fields: string[] = [];
  // Accumulate characters for the field currently being read.
  let field = '';
  // Track whether the parser is currently inside a quoted field.
  let inQuotes = false;

  // Read each character so commas and quotes can be handled according to CSV rules.
  for (let index = 0; index < line.length; index++) {
    // Keep the current character for the checks below.
    const character = line[index];

    // A quote can start/end a quoted field or escape another quote.
    if (character === '"') {
      // Two quotes inside a quoted field represent one literal quote character.
      if (inQuotes && line[index + 1] === '"') {
        // Add the escaped quote to the field value.
        field += '"';
        // Skip the second quote because it was consumed as part of the escape.
        index++;
      } else {
        // Toggle whether subsequent commas should be treated as field separators.
        inQuotes = !inQuotes;
      }
    // A comma outside quotes ends the current field.
    } else if (character === ',' && !inQuotes) {
      // Save the completed field.
      fields.push(field);
      // Start collecting the next field.
      field = '';
    } else {
      // Add ordinary characters, and commas that are inside quoted fields.
      field += character;
    }
  }

  // Save the final field, which has no comma after it.
  fields.push(field);
  // Return all fields parsed from this CSV row.
  return fields;
}

// Quote a value when it contains characters that need CSV escaping.
function escapeCsvField(value: string): string {
  // Double any embedded quotes and wrap the value in quotes when necessary.
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

// Read the source CSV and return its rows as typed test-case objects.
export function readTestCases(): TestCaseRow[] {
  // Read UTF-8 text, remove a possible byte-order mark, split into lines, and discard blank lines.
  const lines = readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  // Remove the first line and parse it as the column names; use an empty header if the file is empty.
  const headers = parseCsvRow(lines.shift() ?? '');

  // Parse each remaining line and convert it into an object keyed by its column names.
  return lines.map((line) => {
    // Split the current CSV line into its individual values.
    const values = parseCsvRow(line);
    // Pair each header with its value, using an empty string if the row has fewer values.
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));

    // Return the fields required by TestCaseRow, trimming extra whitespace from each value.
    return {
      ID: row.ID.trim(),
      Scenario: row.Scenario.trim(),
      Steps: row.Steps.trim(),
      Expected: row.Expected.trim(),
      'Pass/Fail': row['Pass/Fail'].trim(),
      'Bug ID': row['Bug ID'].trim(),
    };
  // Ignore rows that do not contain either a test-case ID or a scenario name.
  }).filter((row) => Boolean(row.ID || row.Scenario));
}

// Write a results CSV using the test statuses collected by the reporter.
export function writeTestCaseResults(statuses: ReadonlyMap<string, 'Pass' | 'Fail'>): void {
  // Read and split the original CSV in the same way as readTestCases does.
  const lines = readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  // Parse and remove the header row so the remaining lines are test cases.
  const headers = parseCsvRow(lines.shift() ?? '');
  // Find the positions of the columns used to match and update each result.
  const idIndex = headers.indexOf('ID');
  const statusIndex = headers.indexOf('Pass/Fail');

  // Stop with a clear error if the source CSV is missing a required column.
  if (idIndex < 0 || statusIndex < 0) {
    throw new Error(`CSV must contain ID and Pass/Fail columns: ${csvPath}`);
  }

  // Update each source row with its recorded status and serialize it back to CSV.
  const updatedRows = lines.map((line) => {
    // Parse the current test-case row into its values.
    const values = parseCsvRow(line);
    // Look up this row's result by ID; write "Not Run" when no result was recorded.
    values[statusIndex] = statuses.get(values[idIndex] ?? '') ?? 'Not Run';

    // Escape every value and join them with commas to form a valid CSV row.
    return headers.map((_, index) => escapeCsvField(values[index] ?? '')).join(',');
  });

  // Save the header and updated rows to the results file as UTF-8 text.
  writeFileSync(
    resultsCsvPath,
    // Add a BOM for spreadsheet compatibility and use Windows-style CSV line endings.
    `\uFEFF${[headers.map(escapeCsvField).join(','), ...updatedRows, ''].join('\r\n')}`,
    'utf8',
  );
}

// Find and return one test case by its scenario name, ignoring case and surrounding whitespace.
export function getTestCaseByScenario(scenario: string): TestCaseRow {
  // Normalize the requested name so it can be compared consistently.
  const normalizedScenario = scenario.trim().toLowerCase();
  // Read the CSV and return the first row whose normalized scenario matches.
  const match = readTestCases().find((row) => row.Scenario.trim().toLowerCase() === normalizedScenario);

  // Report a missing scenario explicitly instead of returning an invalid or empty row.
  if (!match) {
    throw new Error(`No CSV test case found for scenario: ${scenario}`);
  }

  // Return the matching test-case row.
  return match;
}
