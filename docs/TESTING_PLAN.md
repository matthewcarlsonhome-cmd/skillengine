# Test Coverage Improvement Plan

> Current Coverage: ~0.1% (133 tests / 136,671 LOC)
> Target Coverage: 70%+ on critical paths
> Timeline: 4-6 weeks

---

## Current State

```
Test Files:  4 files
Tests:       133 passing
Coverage:    Not measured (too low to report)
```

### Existing Test Files

| File | Tests | Coverage Area |
|------|-------|---------------|
| `tests/lib/workflows.test.ts` | 45 | Workflow structure validation |
| `tests/lib/emailSegmentation.test.ts` | 42 | Filter logic |
| `tests/lib/admin.test.ts` | 30 | Admin utilities |
| `tests/lib/apiKeyStorage.test.ts` | 16 | API key management |

---

## Testing Strategy

### Layer 1: Unit Tests (Target: 500+ tests)

Test pure functions and utilities in isolation.

**Priority Files:**

```
lib/skills/registry.ts           # Skill lookup & execution
lib/storage/indexeddb.ts         # Data persistence
lib/skillLibrary/index.ts        # Library filtering
lib/workflows/index.ts           # Workflow engine
lib/emailSegmentation/filters.ts # Already tested, expand
lib/usageLedger.ts               # Usage tracking
lib/theme.ts                     # Theme utilities
```

**Example Test Pattern:**

```typescript
// tests/lib/skillLibrary.test.ts
import { describe, it, expect } from 'vitest';
import { filterSkills, sortSkills, getAllLibrarySkills } from '../lib/skillLibrary';

describe('Skill Library', () => {
  describe('filterSkills', () => {
    it('filters by search term', () => {
      const skills = getAllLibrarySkills();
      const filtered = filterSkills(skills, { search: 'resume' });
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(s =>
        s.name.toLowerCase().includes('resume') ||
        s.description.toLowerCase().includes('resume')
      )).toBe(true);
    });

    it('filters by category', () => {
      const skills = getAllLibrarySkills();
      const filtered = filterSkills(skills, { categories: ['analysis'] });
      expect(filtered.every(s => s.tags.category === 'analysis')).toBe(true);
    });

    it('returns all skills with empty filter', () => {
      const all = getAllLibrarySkills();
      const filtered = filterSkills(all, {});
      expect(filtered.length).toBe(all.length);
    });
  });
});
```

### Layer 2: Integration Tests (Target: 100+ tests)

Test component interactions and hooks.

**Priority Areas:**

```
hooks/useDebounce.ts        # Debounce timing
hooks/useAuth.tsx           # Auth flow
hooks/useStorage.ts         # Storage operations
hooks/useEmailSegments.ts   # Email filtering
```

**Example Test Pattern:**

```typescript
// tests/hooks/useDebounce.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 100));
    expect(result.current).toBe('initial');
  });

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Still old value

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('updated'); // Now updated
  });
});
```

### Layer 3: Component Tests (Target: 50+ tests)

Test React components in isolation.

**Priority Components:**

```
components/SkillCard.tsx
components/EmailSegmentationPanel.tsx
components/Header.tsx
components/ui/Button.tsx
```

**Example Test Pattern:**

```typescript
// tests/components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../components/ui/Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Layer 4: E2E Tests (Target: 20+ flows)

Test critical user journeys with Playwright.

**Priority Flows:**

1. User authentication (sign in, sign out)
2. Run a skill with AI response
3. Create and save a custom skill
4. Job tracker CRUD operations
5. Admin email targeting flow

**Setup Required:**

```bash
npm install -D @playwright/test
npx playwright install
```

**Example E2E Test:**

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign in with Google', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign In');
    // Would need mock auth provider for CI
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('unauthenticated user sees sign in prompt', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Sign in to continue')).toBeVisible();
  });
});
```

---

## Implementation Plan

### Week 1: Foundation

- [ ] Configure Vitest coverage reporting
- [ ] Add coverage thresholds to CI (start at 5%, increase weekly)
- [ ] Write tests for `lib/skillLibrary` (30 tests)
- [ ] Write tests for `lib/storage/indexeddb.ts` (20 tests)

### Week 2: Core Logic

- [ ] Write tests for `hooks/useDebounce.ts` (10 tests)
- [ ] Write tests for `lib/workflows` edge cases (20 tests)
- [ ] Write tests for `lib/usageLedger.ts` (15 tests)
- [ ] Increase coverage threshold to 15%

### Week 3: Components

- [ ] Set up React Testing Library
- [ ] Write tests for UI components (30 tests)
- [ ] Write tests for EmailSegmentationPanel (20 tests)
- [ ] Increase coverage threshold to 30%

### Week 4: Integration

- [ ] Write hook integration tests (30 tests)
- [ ] Write tests for skill execution flow (20 tests)
- [ ] Increase coverage threshold to 45%

### Week 5: E2E

- [ ] Set up Playwright
- [ ] Write E2E tests for critical flows (20 tests)
- [ ] Configure E2E in CI (run on PRs to main)

### Week 6: Hardening

- [ ] Achieve 70% coverage on lib/ directory
- [ ] Add mutation testing (Stryker)
- [ ] Document testing patterns
- [ ] Set up coverage badge in README

---

## Coverage Configuration

Add to `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        statements: 5,  // Start low, increase weekly
        branches: 5,
        functions: 5,
        lines: 5,
      },
    },
  },
});
```

---

## Test Quality Metrics

Track these over time:

| Metric | Current | Week 2 | Week 4 | Week 6 |
|--------|---------|--------|--------|--------|
| Total Tests | 133 | 250 | 400 | 600+ |
| Line Coverage | ~0% | 15% | 45% | 70% |
| Branch Coverage | ~0% | 10% | 35% | 60% |
| E2E Flows | 0 | 0 | 5 | 20 |
| CI Pass Rate | N/A | 95% | 98% | 99% |

---

## Testing Principles

1. **Test behavior, not implementation** - Tests should survive refactoring
2. **One assertion per test** - Makes failures easier to diagnose
3. **Descriptive test names** - `it('filters skills by category when category is selected')`
4. **No flaky tests** - Fix or delete tests that fail intermittently
5. **Fast tests** - Unit tests should complete in < 1 second each
6. **Independent tests** - No test should depend on another test's state
