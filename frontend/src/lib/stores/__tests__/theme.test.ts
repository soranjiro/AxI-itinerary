import { describe, it, expect } from 'vitest';

// 簡単なユーティリティの純関数テスト（Node環境で動作）
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(amount);
}

describe('utils formatCurrency', () => {
  it('formats yen correctly', () => {
    expect(formatCurrency(0)).toBe('￥0');
    expect(formatCurrency(1234)).toBe('￥1,234');
  });
});
