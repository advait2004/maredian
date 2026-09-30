import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const RECORDING_DURATION = 16000; // 16 seconds
const FPS = 60;
const TOTAL_FRAMES = (RECORDING_DURATION / 1000) * FPS;
const SERVER_URL = 'http://localhost:5173';
const FRAMES_DIR = path.join(process.cwd(), 'frames');
const OUTPUT_PATH = 'poster_hq.mp4';

(async () => {
  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(FRAMES_DIR);

  console.log('Launching browser on T4 for lossless rendering...');
  const browser = await puppeteer.launch({
    headless: false, // Must be false to guarantee hardware GPU on Linux (requires xvfb-run)
    args: [
      '--no-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--gpu-preference=high-performance',
      '--ignore-gpu-blocklist',
      '--use-gl=desktop',
      '--enable-gpu-rasterization',
      '--enable-zero-copy',
      '--window-size=1060,1500',
    ],
    defaultViewport: { width: 1060, height: 1500 }
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1060, height: 1500, deviceScaleFactor: 1 });

  // 1. INJECT DETERMINISTIC TIME ENGINE
  await page.evaluateOnNewDocument(`
    window.__timeMs = 0;
    const origRAF = window.requestAnimationFrame;
    
    // Freeze Native Time
    window.Date.now = () => window.__timeMs;
    window.performance.now = () => window.__timeMs;

    // Freeze SetInterval
    const intervals = new Map();
    let iid = 0;
    window.setInterval = (cb, ms) => {
      const id = ++iid;
      intervals.set(id, { cb, ms, last: window.__timeMs });
      return id;
    };
    window.clearInterval = (id) => intervals.delete(id);

    // Freeze SetTimeout
    const timeouts = new Map();
    let tid = 0;
    window.setTimeout = (cb, ms) => {
      const id = ++tid;
      timeouts.set(id, { cb, triggerAt: window.__timeMs + ms });
      return id;
    };
    window.clearTimeout = (id) => timeouts.delete(id);

    // Freeze rAF
    window.__rAFs = [];
    window.requestAnimationFrame = (cb) => {
      window.__rAFs.push(cb);
      return window.__rAFs.length;
    };

    window.__advanceTime = (newTime) => {
      window.__timeMs = newTime;

      // Process Timeouts
      for (const [id, t] of timeouts.entries()) {
        if (window.__timeMs >= t.triggerAt) {
          timeouts.delete(id);
          t.cb();
        }
      }

      // Process Intervals
      for (const [id, i] of intervals.entries()) {
        if ((window.__timeMs - i.last) >= i.ms) {
          i.last += i.ms; 
          i.cb();
        }
      }

      // Process rAF
      const rAFs = window.__rAFs;
      window.__rAFs = [];
      rAFs.forEach(cb => cb(window.__timeMs));

      // Process Video & CSS Animations
      document.querySelectorAll('video').forEach(v => {
        v.pause();
        const dur = (v.duration && v.duration > 0) ? v.duration : 999999;
        v.currentTime = (window.__timeMs / 1000) % dur;
      });
      if (document.getAnimations) {
        const delta = window.__timeMs - (window.__lastTimeMs || 0);
        document.getAnimations().forEach(a => {
          a.pause();
          a.currentTime = (a.currentTime || 0) + delta;
        });
      }
      window.__lastTimeMs = window.__timeMs;
    };
  `);

  console.log('Loading scaled iframe layout...');
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1060px; height: 1500px; overflow: hidden; background: #000; }
      iframe {
        width: 530px;
        height: 750px;
        border: none;
        transform: scale(2);
        transform-origin: top left;
        display: block;
      }
    </style>
    </head>
    <body>
      <iframe id="poster-frame" src="${SERVER_URL}"></iframe>
    </body>
    </html>
  `, { waitUntil: 'networkidle0' });

  const iframeHandle = await page.$('#poster-frame');
  const frame = await iframeHandle.contentFrame();

  console.log('Allowing app to load and mount (mocking 4 seconds of time)...');
  let currentSimTime = 0;
  for(let i=0; i<240; i++) {
     currentSimTime += (1000 / FPS);
     await frame.evaluate((time) => window.__advanceTime(time), currentSimTime);
     await new Promise(r => setTimeout(r, 10)); // Yield to network/React
  }

  console.log('Waiting for assets and fonts...');
  await frame.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 3000));

  console.log('Rendering frames deterministically...');
  
  for (let f = 1; f <= TOTAL_FRAMES; f++) {
    // Advance simulation continuously from where pre-warming left off!
    currentSimTime += (1000 / FPS);
    await frame.evaluate((t) => window.__advanceTime(t), currentSimTime);

    // Save lossless PNG
    const framePath = path.join(FRAMES_DIR, `frame_${f.toString().padStart(4, '0')}.png`);
    await page.screenshot({ path: framePath, type: 'png' });
    
    if (f % 60 === 0) {
      console.log(`Rendered ${f} / ${TOTAL_FRAMES} frames (${Math.floor((f/TOTAL_FRAMES)*100)}%)...`);
    }
  }

  await browser.close();

  console.log('Stitching frames into pristine MP4 using Kaggle T4 NVENC...');
  
  // Use NVENC if on T4, otherwise fallback to standard libx264
  try {
    execSync(
      `ffmpeg -y -framerate ${FPS} -i frames/frame_%04d.png -c:v h264_nvenc -preset p7 -qp 0 -pix_fmt yuv420p ${OUTPUT_PATH}`,
      { stdio: 'inherit' }
    );
  } catch (e) {
    console.log('NVENC failed, falling back to libx264...');
    execSync(
      `ffmpeg -y -framerate ${FPS} -i frames/frame_%04d.png -c:v libx264 -crf 12 -preset veryslow -pix_fmt yuv420p ${OUTPUT_PATH}`,
      { stdio: 'inherit' }
    );
  }

  // Cleanup
  console.log('Cleaning up frames...');
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });

  console.log(`\nSuccess! Highest quality render saved to ${OUTPUT_PATH}`);
})();
