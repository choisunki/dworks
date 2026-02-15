import { mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';
import { compile } from 'sass';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const defaultBanner = `/*! ${pkg.name} v${pkg.version} */`;
const videoBanner = `/*!
 * @name dworks-video
 * @version v1.0.0
 * @author Choi Sunki <sk@daltan.net>
 * @description Operational Video Engine for DALTAN WORKS
 * @repository https://github.com/choisunki/dworks
 * @license MIT
 * @preserve
 */`;

const entries = [
  { name: 'dworks', entry: 'src/index.js', globalName: 'DWorks', banner: defaultBanner },
  { name: 'dworks-video', entry: 'src/modules/video.js', globalName: 'DWorksVideo', banner: videoBanner },
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
      banner: { js: target.banner },
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
      banner: { js: target.banner },
    }),
    build({
      entryPoints: [target.entry],
      outfile: `dist/${target.name}.esm.js`,
      bundle: true,
      format: 'esm',
      platform: 'browser',
      target: ['es2017'],
      sourcemap: true,
      banner: { js: target.banner },
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
      banner: { js: target.banner },
    })
  );
}

await Promise.all(builds);

const expandedVideoCss = compile('src/scss/video.scss', {
  style: 'expanded',
  sourceMap: false,
});
writeFileSync('dist/dworks-video.css', `${videoBanner}\n${expandedVideoCss.css}`);

const compressedVideoCss = compile('src/scss/video.scss', {
  style: 'compressed',
  sourceMap: false,
});
writeFileSync('dist/dworks-video.min.css', `${videoBanner}\n${compressedVideoCss.css}`);

console.log('Built dist artifacts for dworks/dworks-video JS and dworks-video CSS');
