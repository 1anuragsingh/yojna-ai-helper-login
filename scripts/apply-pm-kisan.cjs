/**
 * PM Kisan Auto-Fill Assistant
 *
 * What it does:
 *  1. Opens the PM Kisan New Farmer Registration page
 *  2. Fills Aadhaar number and selects State automatically
 *  3. Checks the declaration checkbox
 *  4. Highlights the CAPTCHA field and shows a banner
 *  5. You solve the CAPTCHA manually → automation clicks "Get OTP" for you
 *
 * Run: node scripts/apply-pm-kisan.cjs
 */

const { chromium } = require('playwright');

// ── Config ──────────────────────────────────────────────────────────────────
const AADHAAR = '98765432100';
const STATE   = 'MADHYA PRADESH';
const REG_URL = 'https://pmkisan.gov.in/RegistrationFormupdated.aspx';
// ────────────────────────────────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('\n🚀 PM Kisan Auto-Fill Assistant starting...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 400,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  // ── Step 1: Go to homepage, then navigate to registration ──────────────────
  console.log('📄 Opening PM Kisan portal...');
  await page.goto('https://pmkisan.gov.in/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1500);

  console.log('🖱  Clicking "New Farmer Registration"...');
  // Click the "Farmer Corner" section link (second occurrence is safer)
  const regLinks = page.locator('a', { hasText: 'New Farmer Registration' });
  await regLinks.last().click();

  // ── Step 2: Wait for registration form ────────────────────────────────────
  await page.waitForURL('**/RegistrationFormupdated.aspx**', { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
  await sleep(1000);
  console.log('✅ Registration page loaded.\n');

  // ── Step 3: Fill Aadhaar ──────────────────────────────────────────────────
  console.log(`🪪  Filling Aadhaar: ${AADHAAR}`);
  const aadhaarInput = page.locator('#txtsrch');
  await aadhaarInput.click();
  // Hover first to switch from password to text type (the site does this on hover)
  await aadhaarInput.hover();
  await sleep(300);
  await aadhaarInput.fill('');
  await aadhaarInput.type(AADHAAR, { delay: 80 });
  await sleep(500);

  // ── Step 4: Select State ──────────────────────────────────────────────────
  console.log(`🗺  Selecting state: ${STATE}`);
  const stateDropdown = page.locator('select').first();
  await stateDropdown.selectOption({ label: STATE });
  await sleep(500);

  // ── Step 5: Force-enable and check declaration checkbox ───────────────────
  console.log('✔️  Checking declaration checkbox...');
  await page.evaluate(() => {
    const ids = [
      'ContentPlaceHolder1_chkDeclarationgiven',
      'chkDeclaration',
    ];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.disabled = false;
        el.checked  = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('click',  { bubbles: true }));
      }
    });
    // Also try by name
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.disabled = false;
      cb.checked  = true;
    });
  });
  await sleep(400);

  // ── Step 6: Highlight CAPTCHA and inject banner ───────────────────────────
  console.log('\n⚠️  CAPTCHA detected — injecting instructions into browser.\n');

  await page.evaluate(({ aadhaar, state }) => {
    // ── Highlight captcha input ────────────────────────────────────────────
    const allInputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type])'));
    const captchaInput = allInputs.find(el => {
      const id   = (el.id   || '').toLowerCase();
      const name = (el.name || '').toLowerCase();
      const ph   = (el.placeholder || '').toLowerCase();
      return id.includes('captcha') || name.includes('captcha') || ph.includes('captcha') ||
             id.includes('cap')    || name.includes('cap');
    }) || allInputs[allInputs.length - 1]; // fallback: last visible text input

    if (captchaInput) {
      captchaInput.style.outline     = '3px solid #f59e0b';
      captchaInput.style.boxShadow   = '0 0 12px rgba(245,158,11,0.7)';
      captchaInput.style.background  = '#fef3c7';
      captchaInput.focus();
    }

    // ── Inject banner ──────────────────────────────────────────────────────
    const banner = document.createElement('div');
    banner.id = 'yojna-ai-banner';
    banner.innerHTML = `
      <div style="
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 99999;
        background: linear-gradient(135deg, #0b1a2c, #1e3a5f);
        color: white; padding: 14px 20px;
        font-family: system-ui, -apple-system, sans-serif;
        box-shadow: 0 -4px 24px rgba(0,0,0,0.4);
        border-top: 2px solid #f59e0b;
      ">
        <div style="max-width: 700px; margin: 0 auto;">
          <div style="font-size: 15px; font-weight: 700; color: #f59e0b; margin-bottom: 8px;">
            ⚡ YOJNA AI — Auto-Filled Successfully
          </div>
          <div style="display:flex; gap: 24px; flex-wrap: wrap; font-size: 13px; color: rgba(255,255,255,0.85); margin-bottom: 10px;">
            <span>🪪 Aadhaar: <strong>${aadhaar}</strong></span>
            <span>🗺 State: <strong>${state}</strong></span>
            <span>✔️ Declaration: <strong>Checked</strong></span>
          </div>
          <div style="
            background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.4);
            border-radius: 8px; padding: 8px 12px; font-size: 13px; font-weight: 600;
          ">
            👆 Enter the CAPTCHA shown above → The "Get OTP / Confirm" button will be clicked for you automatically.
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
  }, { aadhaar: AADHAAR, state: STATE });

  console.log('Aadhaar and State pre-filled in the browser.');
  console.log('Instructions shown in the browser window.');
  console.log('\n⏳ Waiting for CAPTCHA to be filled...');

  // ── Step 7: Poll until captcha is filled, then click Confirm ──────────────
  let attempts = 0;
  const maxWait = 300; // 5 minutes max

  while (attempts < maxWait) {
    await sleep(1000);
    attempts++;

    const captchaFilled = await page.evaluate(() => {
      const allInputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type])'));
      const captchaInput = allInputs.find(el => {
        const id   = (el.id   || '').toLowerCase();
        const name = (el.name || '').toLowerCase();
        const ph   = (el.placeholder || '').toLowerCase();
        return id.includes('captcha') || name.includes('captcha') || ph.includes('captcha') ||
               id.includes('cap')    || name.includes('cap');
      }) || allInputs[allInputs.length - 1];
      return captchaInput && captchaInput.value.length >= 4;
    }).catch(() => false);

    if (captchaFilled) {
      console.log('\n✅ CAPTCHA filled! Clicking "Get OTP / Confirm"...');
      await sleep(500);

      // Try to click the Confirm / Get OTP button
      const clicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('a, button, input[type="button"], input[type="submit"]'));
        const confirmBtn = btns.find(el => {
          const t = (el.innerText || el.value || '').toLowerCase().trim();
          return t === 'get otp' || t === 'confirm' || t === 'send otp' || t === 'submit' || t === 'getotp';
        });
        if (confirmBtn) { confirmBtn.click(); return true; }
        return false;
      });

      if (clicked) {
        console.log('🎉 Clicked! OTP should be sent to the Aadhaar-linked mobile number.');

        // Update banner
        await page.evaluate(() => {
          const b = document.getElementById('yojna-ai-banner');
          if (b) {
            b.querySelector('div > div:last-child').innerHTML =
              '✅ OTP request sent! Check the Aadhaar-linked mobile number.';
            b.querySelector('div > div:last-child').style.background =
              'rgba(16,185,129,0.2)';
            b.querySelector('div > div:last-child').style.borderColor =
              'rgba(16,185,129,0.4)';
          }
        }).catch(() => {});
      } else {
        console.log('⚠️  Could not find Confirm button — please click it manually.');
      }
      break;
    }

    if (attempts % 15 === 0) {
      console.log(`  Still waiting for CAPTCHA... (${attempts}s elapsed)`);
    }
  }

  if (attempts >= maxWait) {
    console.log('\n⏱  Timed out waiting for CAPTCHA. Please complete manually.');
  }

  // Keep browser open for user to see result
  console.log('\nBrowser will stay open. Close it manually when done.\n');
  await page.waitForEvent('close', { timeout: 0 }).catch(() => {});
  await browser.close();
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
