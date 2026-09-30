import { launch, getStream } from 'puppeteer-stream';
import { execSync } from 'child_process';
import fs from 'fs';

const RECORDING_DURATION = 16000; // 16 seconds
const SERVER_URL = 'http://localhost:5173';
const WEBM_PATH = 'poster_raw.webm';
const OUTPUT_PATH = 'poster.mp4';

(async () => {
  console.log('Launching browser with hardware acceleration forced...');
  const browser = await launch({
    headless: false, // Force hardware GPU
    channel: 'chrome',
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
    defaultViewport: {
      width: 1060,
      height: 1500
    }
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 1060,
    height: 1500,
    deviceScaleFactor: 1,
  });

  // Re-add the iframe trick because deviceScaleFactor doesn't affect window size
  // and we need the layout to render exactly as a 530x750 poster.
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

  console.log('Waiting for fonts inside iframe...');
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

  // ── RECORD ──
  const CAPTURE_DURATION = RECORDING_DURATION + 1000;
  console.log(`Recording ${CAPTURE_DURATION / 1000}s using native WebRTC Tab Capture...`);

  // WebRTC tab capture will grab the physical pixels (1060x1500)
  const stream = await getStream(page, { 
    audio: false, 
    video: true,
    videoConstraints: {
      mandatory: {
        minFrameRate: 30,
        maxFrameRate: 30
      }
    }
  });
  
  const fileStream = fs.createWriteStream(WEBM_PATH);
  stream.pipe(fileStream);

  await new Promise((r) => setTimeout(r, CAPTURE_DURATION));

  console.log('Stopping recording...');
  await stream.destroy();
  
  await new Promise((r) => {
    fileStream.on('close', r);
    fileStream.close();
  });
  await browser.close();

  // ── CONVERT ──
  console.log('Converting stream to MP4 via NVENC...');
  execSync(
    `ffmpeg -y -hwaccel auto -i "${WEBM_PATH}" -t ${RECORDING_DURATION / 1000} -vf "fps=30" -c:v h264_nvenc -preset p7 -qp 0 -pix_fmt yuv420p "${OUTPUT_PATH}"`,
    { stdio: 'inherit' }
  );

  const probeOutput = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_frames -of default=noprint_wrappers=1 "${OUTPUT_PATH}"`
  ).toString().trim();
  console.log(`\nOutput info:\n${probeOutput}`);

  if (fs.existsSync(WEBM_PATH)) fs.unlinkSync(WEBM_PATH);

  console.log(`Done! Saved to ${OUTPUT_PATH}`);
})();
