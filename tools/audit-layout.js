// Renders the end of every scene of every lesson in headless Chrome and reports content that
// overflows the stage, runs into the captions, or spills out of a diagram box / card / table cell.
// Usage:  npm i --no-save playwright-core && node tools/audit-layout.js [lang] [lessonId]
// Chrome: set CHROME=/path/to/chrome if it isn't at /usr/bin/google-chrome.
const path = require('path');
const { chromium } = require('playwright-core');
const lang = process.argv[2] || 'en', only = process.argv[3];
const url = 'file://' + path.join(__dirname, '..', 'index.html');

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome' });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript((l) => localStorage.setItem('r4r-lang', l), lang);
  await page.goto(url); await page.waitForTimeout(300);
  let ids = await page.$$eval('.tl[href^="#/lesson/"]', (as) => as.map((a) => a.getAttribute('href').split('/').pop()));
  if (only) ids = ids.filter((id) => id === only);
  const problems = [];
  for (const id of ids) {
    await page.goto(url + '#/lesson/' + id); await page.waitForTimeout(250);
    const n = await page.evaluate(() => __player.scenes.length);
    for (let i = 0; i < n; i++) {
      await page.evaluate((i) => __player.seek(__player.scenes[i].end - 0.05), i);
      await page.waitForTimeout(900); // let reveal transitions finish
      const r = await page.evaluate(() => {
        const st = document.querySelector('.stage'), sr = st.getBoundingClientRect(), k = sr.width / 1280;
        const sc = st.querySelector('.scene:not(.leaving)');
        let bottom = 0, right = 0;
        sc.querySelectorAll('.in, .ln:not(.hidden), .cp-opt, .stitle').forEach((e) => {
          if (e.closest('[data-key]:not(.in)')) return;
          const rc = e.getBoundingClientRect();
          bottom = Math.max(bottom, (rc.bottom - sr.top) / k); right = Math.max(right, (rc.right - sr.left) / k);
        });
        const cap = document.querySelector('.captions span');
        const capTop = 720 - 26 - (cap ? cap.getBoundingClientRect().height / k : 0);
        // badges like "moved"/"dropped" sit outside their box on purpose, so only check content width/height
        const spill = [...sc.querySelectorAll('.dbox .dl, .dbox .ds, .card, .cp-opt, .tr > div')]
          .filter((e) => e.scrollWidth > e.clientWidth + 2 || (e.closest('.dbox') && e.closest('.dbox').scrollHeight > e.closest('.dbox').clientHeight + 14))
          .map((e) => e.textContent.trim().slice(0, 40));
        return { title: __player.scenes[__player.cur].title || __player.scenes[__player.cur].type, bottom, right, capTop, spill };
      });
      const where = `${id} scene ${i} "${r.title.replace(/<[^>]+>/g, '')}"`;
      if (r.bottom > r.capTop - 4) problems.push(`${where}: content reaches y=${Math.round(r.bottom)}, captions start at ${Math.round(r.capTop)}`);
      if (r.right > 1250) problems.push(`${where}: content reaches x=${Math.round(r.right)} (stage is 1280 wide)`);
      if (r.spill.length) problems.push(`${where}: text spills out of: ${r.spill.join(' | ')}`);
    }
    process.stdout.write('.');
  }
  console.log(`\n${lang}: ${ids.length} lessons checked`);
  console.log(problems.length ? problems.join('\n') : 'no layout problems');
  if (errors.length) console.log('page errors:\n' + errors.join('\n'));
  await browser.close();
  process.exit(problems.length || errors.length ? 1 : 0);
})();
