// output/outdated.group.ts

import pc from 'picocolors';
import type { DependencyGroup } from 'deps-cli/utils/groups.utils.js';

import { LEFT_MARGIN } from './config.constants.js';
import { renderRow } from './table/row.js';

interface Column {
  width: number;
  align: 'left' | 'right';
}

export function renderOutdatedGroup(
  group: DependencyGroup,
  columns: Column[],
  dividerWidth: number,
): string[] {
  const lines: string[] = [];

  lines.push('');
  lines.push(`${LEFT_MARGIN}${pc.cyan(group.name)}`);
  lines.push(pc.cyan(pc.dim(`${LEFT_MARGIN}${'─'.repeat(dividerWidth)}`)));

  for (const entry of group.entries) {
    const next = entry.latest ? `${entry.prefix}${entry.latest}` : '';

    const row = renderRow(
      [entry.name, pc.dim(entry.current), entry.latest ? pc.green(next) : pc.dim('(private)')],
      columns,
    );

    const tag = entry.pinned ? pc.yellow('  ✦ pinned') : entry.outdated ? pc.yellow('  ✦') : '';

    const styled = entry.outdated ? pc.bold(row) : pc.dim(row);

    lines.push(LEFT_MARGIN + styled + tag);
  }

  return lines;
}
