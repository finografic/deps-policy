import pc from 'picocolors';

export function padRight(value: string, width: number): string {
  return value + ' '.repeat(Math.max(2, width - value.length));
}

export function createDivider(width: number): string {
  return pc.dim('  ' + '─'.repeat(width));
}
