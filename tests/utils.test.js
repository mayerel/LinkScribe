import { formatUrl } from '../js/utils.js';

describe('formatUrl', () => {
  test('adds https:// to URLs without scheme', () => {
    expect(formatUrl('example.com')).toBe('https://example.com');
  });

  test('returns http URL unchanged', () => {
    expect(formatUrl('http://example.com')).toBe('http://example.com');
  });

  test('returns https URL unchanged', () => {
    expect(formatUrl('https://example.com')).toBe('https://example.com');
  });
});
