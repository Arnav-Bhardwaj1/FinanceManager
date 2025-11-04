import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency.js';

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    expect(formatCurrency(1000)).toBe('₹1,000');
    expect(formatCurrency(100)).toBe('₹100');
    expect(formatCurrency(1234567)).toBe('₹12,34,567');
  });

  it('should format decimal numbers correctly', () => {
    expect(formatCurrency(100.50)).toBe('₹100.5');
    expect(formatCurrency(1234.56)).toBe('₹1,234.56');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-100)).toBe('₹-100');
    expect(formatCurrency(-1000)).toBe('₹-1,000');
  });
});
