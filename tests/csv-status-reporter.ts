import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { writeTestCaseResults } from './excel-data';

class CsvStatusReporter implements Reporter {
  private readonly outcomes = new Map<string, Map<string, 'Pass' | 'Fail'>>();

  onTestEnd(test: TestCase, result: TestResult): void {
    const id = test.title.match(/\bAMOZ_ADM_TC_\d+\b/)?.[0];
    if (!id || result.status === 'skipped') {
      return;
    }

    let testOutcomes = this.outcomes.get(id);
    if (!testOutcomes) {
      testOutcomes = new Map();
      this.outcomes.set(id, testOutcomes);
    }

    testOutcomes.set(test.id, result.status === 'passed' ? 'Pass' : 'Fail');
  }

  onEnd(): void {
    const statuses = new Map<string, 'Pass' | 'Fail'>();
    for (const [id, outcomes] of this.outcomes) {
      statuses.set(id, [...outcomes.values()].every((status) => status === 'Pass') ? 'Pass' : 'Fail');
    }

    writeTestCaseResults(statuses);
  }
}

export default CsvStatusReporter;
