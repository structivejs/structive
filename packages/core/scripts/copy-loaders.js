// scripts/copy-loaders.js
// EasyLoadersとAutoLoadersをdist/にコピー

import { cpSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('Copying loaders to dist/...');

try {
	cpSync(
		join(rootDir, 'src', 'EasyLoaders'),
		join(rootDir, 'dist', 'EasyLoaders'),
		{ recursive: true, force: true }
	);
	console.log('✓ EasyLoaders copied');

	cpSync(
		join(rootDir, 'src', 'AutoLoaders'),
		join(rootDir, 'dist', 'AutoLoaders'),
		{ recursive: true, force: true }
	);
	console.log('✓ AutoLoaders copied');
} catch (error) {
	console.error('Error copying loaders:', error);
	process.exit(1);
}
