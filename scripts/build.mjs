import { mkdirSync, rmSync, readFileSync } from 'node:fs';
import { build } from 'esbuild';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const banner = `/*! ${pkg.name} v${pkg.version} */`;

const entries = [
  { name: 'dworks', entry: 'src/index.js', globalName: 'DWorks' },
  { name: 'dworks-video', entry: 'src/modules/video.js', globalName: 'DWorksVideo' },
];

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

const builds = [];
for (const target of entries) {
  builds.push(
    build({
      entryPoints: [target.entry],
      outfile: `dist/${target.name}.js`,
      bundle: true,
      format: 'iife',
      globalName: target.globalName,
      platform: 'browser',
      target: ['es2017'],
      sourcemap: true,
      banner: { js: banner },
    }),
    build({
      entryPoints: [target.entry],
      outfile: `dist/${target.name}.min.js`,
      bundle: true,
      format: 'iife',
      globalName: target.globalName,
      platform: 'browser',
      target: ['es2017'],
      minify: true,
      sourcemap: true,
      banner: { js: banner },
    }),
    build({
      entryPoints: [target.entry],
      outfile: `dist/${target.name}.esm.js`,
      bundle: true,
      format: 'esm',
      platform: 'browser',
      target: ['es2017'],
      sourcemap: true,
      banner: { js: banner },
    }),
    build({
      entryPoints: [target.entry],
      outfile: `dist/${target.name}.esm.min.js`,
      bundle: true,
      format: 'esm',
      platform: 'browser',
      target: ['es2017'],
      minify: true,
      sourcemap: true,
      banner: { js: banner },
    })
  );
}

await Promise.all(builds);
console.log('Built dist artifacts for dworks and dworks-video');
