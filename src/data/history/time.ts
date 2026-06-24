import { UNIVERSE_AGE_SECONDS } from '../../core/TimeSpace';

const YEAR_SECONDS = 365.25 * 24 * 3600;

/** Seconds after the Big Bang. */
export function yearsAfterBB(years: number): number {
  return years * YEAR_SECONDS;
}

/** Seconds since Big Bang for a moment N years before present. */
export function yearsAgo(years: number): number {
  return UNIVERSE_AGE_SECONDS - years * YEAR_SECONDS;
}

/** CE calendar year → sim time (approximate, mid-year). */
export function ceYear(year: number): number {
  const yearsBeforePresent = new Date().getFullYear() - year;
  return yearsAgo(yearsBeforePresent);
}

export { YEAR_SECONDS };
