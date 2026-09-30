import puppeteer from 'puppeteer';

const SERVER_URL = 'http://localhost:5173';

(async () => {
  console.log('Launching Studio Player for manual recording...');
  
  const browser = await puppeteer.launch({
    headless: false,
    channel: 'chrome',
    // --app launches a clean window with no tabs, bookmarks, or URL bar
    args: [
      `--app=${SERVER_URL}`,
      '--no-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--gpu-preference=high-performance',
      '--enable-gpu-rasterization',
      '--enable-zero-copy',
      '--use-gl=desktop',
      // We set the window size to the target proportions. 
      // Note: Windows will shrink this if your monitor is smaller than 1500px tall.
      '--window-size=1060,1500'
    ],
  });

  const pages = await browser.pages();
  const page = pages[0];

  console.log('Window ready! Please prepare your screen recording software (OBS Studio, Windows Game Bar, or Nvidia ShadowPlay).');
  
  // Wait for the hackathena card to be active, then log a message
  console.log('\nWaiting for Hackathena card to appear...');
  
  await page.waitForFunction(
    () => {
      const card = document.querySelector('.deck-root .card-slot:nth-child(1)');
      return card && card.getAttribute('data-slot') === '0';
    },
    { timeout: 0 } // wait forever
  );

  console.log('\n>>> HACKATHENA CARD IS ACTIVE <<<');
  console.log('You can start/stop your recording now.');
  console.log('Press Ctrl+C in this terminal to close the window when you are done.');
})();
