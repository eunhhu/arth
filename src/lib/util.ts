import { readFileSync } from 'fs';
import { join } from 'path';
import * as os from 'os';

export function getConfig(): Record<string, string>;
export function getConfig(property: string): string;
export function getConfig(property?: string): string | Record<string, string> {
  const content = readFileSync(join(process.cwd(), 'dir', '.config'), 'utf-8');
  const config: Record<string, string> = {};
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const eqIndex = line.indexOf('=');
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    if (!key) continue;
    config[key] = join(process.cwd(), 'dir', value);
  }
  return property ? config[property] : config;
}

type Color =
  | 'reset'
  | 'black'
  | 'red'
  | 'green'
  | 'orange'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'silver'
  | 'gray'
  | 'crimson'
  | 'lime'
  | 'yellow'
  | 'sky'
  | 'pink'
  | 'aqua'
  | 'white';

export const colormap: Record<Color, string> = {
  reset: '\x1b[0m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  orange: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  silver: '\x1b[37m',
  gray: '\x1b[90m',
  crimson: '\x1b[91m',
  lime: '\x1b[92m',
  yellow: '\x1b[93m',
  sky: '\x1b[94m',
  pink: '\x1b[95m',
  aqua: '\x1b[96m',
  white: '\x1b[97m',
};

export const c = (color: Color, text: string) => {
  return `${colormap[color]}${text}${colormap['reset']}`;
};

export const isAndroid = () => {
  return (
    os.platform() === 'android' &&
    (os.arch().startsWith('arm') || os.arch().startsWith('aarch64')) &&
    os.type() === 'Linux'
  );
};

export const splitPath = (path: string): string[] =>
  path.replaceAll('\\', '/').split('/').filter(Boolean);
