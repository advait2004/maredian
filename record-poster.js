import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import fs from 'fs';

const RECORDING_DURATION = 16000; // 16 seconds
const SERVER_URL = 'http://localhost:5173';
const OUTPUT_PATH = 'poster.mp4';

(async () => {
  console.log('Launching browser with hardware acceleration forced...');
  const browser = await puppeteer.launch({
    headless: false,
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

  console.log('Loading poster in scaled iframe...');
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

  console.log('Waiting for iframe to fully load...');
  await frame.waitForFunction(() => document.readyState === 'complete', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000));
  await frame.evaluateHandle('document.fonts.ready');

  console.log('Forcing videos to play...');
  await frame.evaluate(() => {
    document.querySelectorAll('video').forEach((v) => {
      v.muted = true;
      v.play().catch(() => {});
    });
  });

  console.log('Waiting 8 seconds for media to settle...');
  await new Promise((r) => setTimeout(r, 8000));

  console.log('Waiting for Hackathena card...');
  await frame.waitForFunction(
    () => {
      const card = document.querySelector('.deck-root .card-slot:nth-child(1)');
      return card && card.getAttribute('data-slot') === '0';
    },
    { timeout: 30000 }
  );

  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 60,
    videoFrame: { width: 1060, height: 1500 },
    videoCrf: 10,  // Visually lossless
    videoCodec: 'libx264',
    videoPreset: 'veryslow',
    recordDurationLimit: RECORDING_DURATION / 1000
  });

  console.log('Recording pristine quality at 60fps using native screencast...');
  await recorder.start(OUTPUT_PATH);
  await new Promise(r => setTimeout(r, RECORDING_DURATION + 1000));
  await recorder.stop();

  await browser.close();
  console.log(`Done! Saved to ${OUTPUT_PATH}`);
})();
