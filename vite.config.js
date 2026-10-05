import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

// 出力するCSSの名前を sass/ 直下のscss（style.scss）から決める → style.css
const cssName = (() => {
  try {
    const entry = fs
      .readdirSync(path.resolve(__dirname, 'sass'))
      .sort((a, b) => (a === 'style.scss' ? -1 : b === 'style.scss' ? 1 : 0)) // 下層用の lower.scss より style.scss を優先
      .find((f) => f.endsWith('.scss') && !f.startsWith('_'));
    return entry ? path.basename(entry, '.scss') : 'style';
  } catch {
    return 'style';
  }
})();

// dev中に画像が追加・変更されたらWebPを自動生成するプラグイン
function autoWebp() {
  const run = (file) => {
    if (/images\/.*\.(jpe?g|png)$/i.test(file)) {
      exec('node scripts/generate-webp.js', (err, stdout) => {
        if (stdout) console.log(stdout.trim());
      });
    }
  };
  return {
    name: 'auto-webp',
    configureServer(server) {
      server.watcher.on('add', run);
      server.watcher.on('change', run);
    },
  };
}

// 静的ページ（index.html と同階層）
const pages = [
  'index',
  'about',
  'service',
  'case',
  'news',
  'news-category',
  'news-detail',
  'download',
  'download-thanks',
  'contact',
  'contact-thanks',
  'privacy-policy', // 制作前チェック No.33（デザインなし・下層ページの形）
];

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    cssMinify: false, // CSSは非圧縮で納品
    minify: false, // JSも非圧縮
    assetsInlineLimit: 0, // 小さい画像もファイルとして書き出す
    rollupOptions: {
      input: Object.fromEntries(
        pages
          .filter((name) => fs.existsSync(path.resolve(__dirname, `${name}.html`)))
          .map((name) => [name === 'index' ? 'main' : name, path.resolve(__dirname, `${name}.html`)])
      ),
      output: {
        entryFileNames: 'js/[name].bundle.js',
        chunkFileNames: 'js/[name].bundle.js',
        assetFileNames: (info) => {
          const src = (info.originalFileNames?.[0] || info.originalFileName || '').replace(/\\/g, '/');
          const name = info.names?.[0] || info.name || '';

          // CSS → css/style.css（元の .scss の名前を引き継ぐ）
          if (name.endsWith('.css')) {
            // 元の .scss が分からないときは、読み込んだ JS の名前（script → style.css、lower → lower.css）で決める
            const chunkBase = name.replace(/\.css$/, '');
            const base = /\.(scss|sass|css)$/i.test(src)
              ? path.basename(src).replace(/\.[^.]+$/, '')
              : chunkBase && chunkBase !== 'script'
                ? chunkBase
                : cssName;
            return `css/${base}.css`;
          }

          // 画像 → images/（サブフォルダも維持）
          if (src.startsWith('images/')) return src;

          return '[name][extname]';
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  plugins: [
    autoWebp(),
    ViteImageOptimizer({
      // WebPは generate-webp.js で生成済み、SVGはviewBox保持のため除外
      exclude: /\.(webp|svg)$/,
      jpg: { quality: 80 },
      jpeg: { quality: 80 },
      png: { palette: false, compressionLevel: 9 },
    }),
  ],
});
