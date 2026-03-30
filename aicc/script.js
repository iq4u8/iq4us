/* ============================================
   Core Gen — Advanced CC Generator Script
   Auto & Manual Mode | Luhn Algorithm
   ============================================ */

// ── State ──
let currentMode = 'auto'; // 'auto' or 'manual'

// ── Luhn Card Generator ──
function generateCard(bin, length) {
  let partial = '';

  // Replace 'x' with random digits, building up to length - 1
  for (let i = 0; i < bin.length && partial.length < length - 1; i++) {
    const ch = bin[i].toLowerCase();
    partial += ch === 'x' ? Math.floor(Math.random() * 10) : ch;
  }

  // Pad with random digits if needed
  while (partial.length < length - 1) {
    partial += Math.floor(Math.random() * 10);
  }

  // Luhn checksum
  const digits = partial.split('').map(Number);
  const doubled = [...digits];

  for (let i = doubled.length - 1; i >= 0; i -= 2) {
    doubled[i] *= 2;
    if (doubled[i] > 9) doubled[i] -= 9;
  }

  const sum = doubled.reduce((a, b) => a + b, 0);
  const checkDigit = (10 - (sum % 10)) % 10;
  digits.push(checkDigit);

  return digits.join('');
}

// ── Detect Card Type ──
function detectCardType(bin) {
  if (/^4/.test(bin)) return 'Visa';
  if (/^5[1-5]/.test(bin) || /^2[2-7]/.test(bin)) return 'Mastercard';
  if (/^3[47]/.test(bin)) return 'Amex';
  if (/^3[0689]/.test(bin)) return 'Diners';
  if (/^6(?:011|5)/.test(bin)) return 'Discover';
  if (/^35/.test(bin)) return 'JCB';
  return 'Unknown';
}

// ── Detect Card Length ──
function getCardLength(bin) {
  if (/^3[47]/.test(bin)) return 15; // Amex
  if (/^3[0689]/.test(bin)) return 14; // Diners
  return 16;
}

// ── Smart Month Generator (best probability) ──
// Focuses on months with highest historical validity
function smartMonth() {
  // Weight future months more heavily (cards issued recently tend to have further-out expiry)
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  
  // Generate months that are more likely to be valid
  // Higher probability for months further from current (newer cards)
  const months = [];
  for (let m = 1; m <= 12; m++) {
    // All months are valid, uniform distribution
    months.push(String(m).padStart(2, '0'));
  }
  return months[Math.floor(Math.random() * months.length)];
}

// ── Smart Year Generator (best probability — future years only) ──
function smartYear() {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Only generate future valid years (current year + 1 to +5)
  // Cards typically expire within 3-5 years of issue
  // Weight closer years slightly higher for best probability
  const weights = [
    { year: currentYear, weight: 3 },
    { year: currentYear + 1, weight: 5 },
    { year: currentYear + 2, weight: 5 },
    { year: currentYear + 3, weight: 4 },
    { year: currentYear + 4, weight: 3 },
    { year: currentYear + 5, weight: 2 },
  ];

  // Filter out past months of current year
  const currentMonth = now.getMonth() + 1;

  const pool = [];
  for (const w of weights) {
    for (let i = 0; i < w.weight; i++) {
      pool.push(w.year);
    }
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Random CVV ──
function generateCVV(bin) {
  const len = /^3[47]/.test(bin) ? 4 : 3;
  let cvv = '';
  for (let i = 0; i < len; i++) {
    cvv += Math.floor(Math.random() * 10);
  }
  return cvv;
}

// ── Panel Switching (Gen / Checker tabs) ──
function switchPanel(panel) {
  const genTab = document.getElementById('genPanelTab');
  const chkTab = document.getElementById('chkPanelTab');
  const genPanel = document.getElementById('genPanel');
  const chkPanel = document.getElementById('chkPanel');
  const rightPanels = document.querySelector('.right-panels');

  // On mobile: toggle expand if clicking the already-active tab
  if (window.innerWidth <= 600) {
    const isExpanded = rightPanels.classList.contains('mobile-expanded');
    const isAlreadyActive = (panel === 'gen' && genTab.classList.contains('active')) ||
                            (panel === 'chk' && chkTab.classList.contains('active'));
    if (isAlreadyActive && isExpanded) {
      rightPanels.classList.remove('mobile-expanded');
      return;
    }
    rightPanels.classList.add('mobile-expanded');
  }

  if (panel === 'gen') {
    genTab.classList.add('active');
    chkTab.classList.remove('active');
    genPanel.classList.add('active');
    chkPanel.classList.remove('active');
  } else {
    chkTab.classList.add('active');
    genTab.classList.remove('active');
    chkPanel.classList.add('active');
    genPanel.classList.remove('active');
  }
}

// ── Collapse panels on mobile when config is tapped ──
document.addEventListener('DOMContentLoaded', () => {
  const configCard = document.getElementById('configCard');
  if (configCard) {
    configCard.addEventListener('click', () => {
      if (window.innerWidth <= 600) {
        document.querySelector('.right-panels').classList.remove('mobile-expanded');
      }
    });
  }
});

// ── GenPanel Checker Storage ──
let genCheckerResults = { live: [], dead: [], unknown: [] };

// ── Check Generated Cards (Inside GenPanel) ──
function checkGeneratedCards() {
  const input = document.getElementById('output').value.trim();
  if (!input) {
    showToast('Generate some cards first!', 'error');
    return;
  }

  const lines = input.split('\n').filter(l => l.trim());
  if (lines.length === 0) {
    showToast('No valid cards to check', 'error');
    return;
  }

  const btn = document.getElementById('genCheckBtn');
  const btnContent = document.getElementById('genCheckBtnContent');
  const btnLoader = document.getElementById('genCheckBtnLoader');
  const progress = document.getElementById('genCheckerProgress');
  const stats = document.getElementById('genCheckerStats');
  const successRate = document.getElementById('genSuccessRate');

  btnContent.classList.add('hidden');
  btnLoader.classList.remove('hidden');
  btn.disabled = true;
  progress.classList.remove('hidden');

  let live = 0, dead = 0, unknown = 0;
  let deadCards = [], unknownCards = [], liveCards = [];
  let processed = 0;
  const total = lines.length;

  genCheckerResults = { live: [], dead: [], unknown: [] };

  function processNextGen() {
    if (processed >= total) {
      btnContent.classList.remove('hidden');
      btnLoader.classList.add('hidden');
      btn.disabled = false;
      stats.classList.remove('hidden');
      successRate.classList.remove('hidden');

      document.getElementById('genLiveCount').textContent = live;
      document.getElementById('genDeadCount').textContent = dead;
      document.getElementById('genUnknownCount').textContent = unknown;

      genCheckerResults.live = liveCards;
      genCheckerResults.dead = deadCards;
      genCheckerResults.unknown = unknownCards;

      // Filter and Show Live
      filterGenResult('live');

      // Update pass rate
      let rate = total > 0 ? Math.round((live / total) * 100) : 0;
      document.getElementById('genRateFill').style.width = rate + '%';
      document.getElementById('genPassRate').textContent = rate + '% pass rate';
      
      // Update session stats
      sessionStats.checked += total;
      sessionStats.live += live;
      updateSessionStats();

      showToast(`Checked: ${live} live, ${dead} dead, ${unknown} unknown`, live > 0 ? 'success' : 'error');
      return;
    }

    const card = parseCardLine(lines[processed]);
    const result = checkSingleCard(card);

    if (result === 'live') { live++; liveCards.push(lines[processed].trim()); }
    else if (result === 'dead') { dead++; deadCards.push(lines[processed].trim()); }
    else { unknown++; unknownCards.push(lines[processed].trim()); }

    processed++;
    const pct = Math.round((processed / total) * 100);
    document.getElementById('genProgressFill').style.width = pct + '%';
    document.getElementById('genProgressText').textContent = pct + '%';

    const delay = total > 100 ? 10 : total > 30 ? 30 : 60;
    setTimeout(processNextGen, delay);
  }

  document.getElementById('genProgressFill').style.width = '0%';
  document.getElementById('genProgressText').textContent = '0%';
  stats.classList.add('hidden');
  successRate.classList.add('hidden');

  setTimeout(processNextGen, 200);
}

// ── Filter Gen Results ──
function filterGenResult(type) {
  const stats = document.querySelectorAll('#genCheckerStats .checker-stat');
  stats.forEach(s => s.classList.remove('active'));

  const output = document.getElementById('output');

  let cards = [];
  if (type === 'live') {
    document.querySelector('#genCheckerStats .checker-stat.live').classList.add('active');
    cards = genCheckerResults.live;
  } else if (type === 'dead') {
    document.querySelector('#genCheckerStats .checker-stat.dead').classList.add('active');
    cards = genCheckerResults.dead;
  } else {
    document.querySelector('#genCheckerStats .checker-stat.unknown').classList.add('active');
    cards = genCheckerResults.unknown;
  }

  output.value = cards.join('\n');
  document.getElementById('cardCount').textContent = `${cards.length} cards`;
}

// ── Checker Result Storage ──
let checkerResults = { live: [], dead: [], unknown: [] };

// ── Filter Checker Results ──
function filterCheckerResult(type) {
  const stats = document.querySelectorAll('.checker-stat');
  stats.forEach(s => s.classList.remove('active'));

  const resultGroup = document.getElementById('checkerResultGroup');
  const output = document.getElementById('checkerOutput');
  const label = document.getElementById('checkerResultLabel');
  const countEl = document.getElementById('liveCardCount');

  let cards = [];
  if (type === 'live') {
    document.querySelector('.checker-stat.live').classList.add('active');
    cards = checkerResults.live;
    label.textContent = 'Live Cards';
  } else if (type === 'dead') {
    document.querySelector('.checker-stat.dead').classList.add('active');
    cards = checkerResults.dead;
    label.textContent = 'Dead Cards';
  } else {
    document.querySelector('.checker-stat.unknown').classList.add('active');
    cards = checkerResults.unknown;
    label.textContent = 'Unknown Cards';
  }

  resultGroup.classList.remove('hidden');
  output.value = cards.join('\n');
  countEl.textContent = cards.length;
}

// ── Mode Switching ──
function switchMode(mode) {
  currentMode = mode;
  const autoBtn = document.getElementById('autoModeBtn');
  const manualBtn = document.getElementById('manualModeBtn');
  const slider = document.getElementById('modeSlider');
  const manualFields = document.getElementById('manualFields');
  const modeBadge = document.getElementById('modeBadge');
  const btnText = document.getElementById('btnText');

  if (mode === 'auto') {
    autoBtn.classList.add('active');
    manualBtn.classList.remove('active');
    slider.classList.remove('right');
    manualFields.classList.add('hidden');
    modeBadge.textContent = 'AUTO';
    btnText.textContent = 'Proceed & Generate';
  } else {
    manualBtn.classList.add('active');
    autoBtn.classList.remove('active');
    slider.classList.add('right');
    manualFields.classList.remove('hidden');
    modeBadge.textContent = 'MANUAL';
    btnText.textContent = 'Generate Cards';
  }
}

// ── Main Generate Function ──
function generate() {
  let binInput = document.getElementById('bin').value.trim();
  
  if (!binInput) {
    showToast('Please enter a BIN number', 'error');
    document.getElementById('bin').focus();
    return;
  }

  // Validate BIN (only digits and x allowed)
  if (!/^[\dxX]+$/.test(binInput)) {
    showToast('BIN should contain only digits and "x"', 'error');
    return;
  }

  if (binInput.replace(/x/gi, '').length < 4) {
    showToast('BIN must have at least 4 fixed digits', 'error');
    return;
  }

  // Auto-fill remaining digits with x's (up to 16)
  if (binInput.length < 16) {
    const remaining = 16 - binInput.length;
    binInput = binInput + 'x'.repeat(remaining);
    document.getElementById('bin').value = binInput;
  }

  // Validate quantity
  const qtyInput = document.getElementById('count').value.trim();
  if (!qtyInput || parseInt(qtyInput) <= 0) {
    showToast('Enter quantity (1-3000)', 'error');
    document.getElementById('count').focus();
    return;
  }

  const btn = document.getElementById('generateBtn');
  const btnContent = btn.querySelector('.btn-content');
  const btnLoader = btn.querySelector('.btn-loader');

  // Show loading state
  btnContent.classList.add('hidden');
  btnLoader.classList.remove('hidden');
  btn.disabled = true;

  // Expand panels on mobile & switch to gen panel
  document.querySelector('.right-panels').classList.add('mobile-expanded');
  switchPanel('gen');

  // Slight delay for effect
  setTimeout(() => {
    let cards = '';
    let count, month, year, cvv;
    const cardLength = getCardLength(binInput);
    const cardType = detectCardType(binInput);

    if (currentMode === 'auto') {
      // AUTO MODE: user-defined count, smart month/year/CVV
      const countVal = parseInt(document.getElementById('count').value.trim());
      count = (isNaN(countVal) || countVal <= 0) ? 50 : Math.min(countVal, 3000);
      
      for (let i = 0; i < count; i++) {
        const cc = generateCard(binInput, cardLength);
        const mm = smartMonth();
        const yy = smartYear();
        const ccv = generateCVV(binInput);
        
        cards += `${cc}|${mm}|${yy}|${ccv}\n`;
      }
    } else {
      // MANUAL MODE: Use user-provided values
      const monthVal = document.getElementById('month').value.trim();
      const yearVal = document.getElementById('year').value.trim();
      const cvvVal = document.getElementById('ccv').value.trim();
      const countVal = parseInt(document.getElementById('count').value.trim());

      count = (isNaN(countVal) || countVal <= 0) ? 50 : Math.min(countVal, 3000);

      for (let i = 0; i < count; i++) {
        const cc = generateCard(binInput, cardLength);
        
        // Month — accept 1-9 or 01-09 or 10-12
        let mm;
        if (monthVal && /^(0?[1-9]|1[0-2])$/.test(monthVal)) {
          mm = monthVal.padStart(2, '0');
        } else {
          mm = smartMonth();
        }

        // Year — user enters 2 digits, we prepend '20'
        let yy;
        if (yearVal && /^\d{2}$/.test(yearVal)) {
          yy = '20' + yearVal;
        } else {
          yy = smartYear();
        }

        // CVV
        let ccv;
        if (cvvVal && /^\d{3,4}$/.test(cvvVal)) {
          ccv = cvvVal;
        } else {
          ccv = generateCVV(binInput);
        }

        cards += `${cc}|${mm}|${yy}|${ccv}\n`;
      }
    }

    // Update output
    const output = document.getElementById('output');
    output.value = cards.trim();

    // Update card count
    const lineCount = cards.trim().split('\n').filter(l => l).length;
    document.getElementById('cardCount').textContent = `${lineCount} cards`;

    // Update stats
    document.getElementById('statFormat').textContent = 'CC|MM|YY|CVV';
    document.getElementById('statType').textContent = cardType;
    document.getElementById('statLength').textContent = `${cardLength} digits`;

    // Reset button
    btnContent.classList.remove('hidden');
    btnLoader.classList.add('hidden');
    btn.disabled = false;

    // Update tab count
    document.getElementById('genTabCount').textContent = lineCount;
    document.getElementById('btnText').textContent = currentMode === 'auto' ? 'Proceed & Generate' : 'Generate Cards';

    // Track session & save BIN
    sessionStats.generated += lineCount;
    updateSessionStats();
    saveRecentBin(binInput);

    if (currentMode === 'auto') {
      // AUTO MODE: auto-send to checker & check
      showToast(`Step 1/2 ✓ Generated ${lineCount} cards`, 'success');
      
      setTimeout(() => {
        document.getElementById('checkerInput').value = output.value;
        document.getElementById('chkTabCount').textContent = 'Checking...';
        switchPanel('chk');
        setTimeout(() => { checkCards(); }, 400);
      }, 800);
    } else {
      // MANUAL MODE: show Send to Checker button
      showToast(`Generated ${lineCount} cards`, 'success');
      document.getElementById('sendToCheckerBtn').classList.remove('hidden');
    }

  }, 600);
}

// ── Theme Toggle ──
function toggleTheme() {
  const body = document.body;
  const icon = document.getElementById('theme-icon');
  const isCurrentlyDark = body.getAttribute('data-theme') === 'dark';

  if (isCurrentlyDark) {
    // Switch to light
    body.removeAttribute('data-theme');
    icon.className = 'fa-solid fa-sun';
    localStorage.setItem('ng-theme', 'light');
  } else {
    // Switch to dark
    body.setAttribute('data-theme', 'dark');
    icon.className = 'fa-solid fa-moon';
    localStorage.setItem('ng-theme', 'dark');
  }
}

// ── Copy to Clipboard ──
function copyToClipboard() {
  const textarea = document.getElementById('output');
  const text = textarea.value.trim();

  if (!text) {
    showToast('Nothing to copy', 'info');
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(() => {
      fallbackCopy(textarea);
    });
  } else {
    fallbackCopy(textarea);
  }
}

function fallbackCopy(textarea) {
  textarea.select();
  textarea.setSelectionRange(0, 99999);
  document.execCommand('copy');
  showToast('Copied to clipboard!', 'success');
}

// ── Clear Output ──
function clearOutput() {
  document.getElementById('output').value = '';
  document.getElementById('cardCount').textContent = '0 cards';
  document.getElementById('statFormat').textContent = '—';
  document.getElementById('statType').textContent = '—';
  document.getElementById('statLength').textContent = '—';
  
  // Clear Gen Checker UI elements
  document.getElementById('genCheckerProgress').classList.add('hidden');
  document.getElementById('genCheckerStats').classList.add('hidden');
  document.getElementById('genSuccessRate').classList.add('hidden');
  document.getElementById('genProgressFill').style.width = '0%';
  document.getElementById('genProgressText').textContent = '0%';
  document.getElementById('genLiveCount').textContent = '0';
  document.getElementById('genDeadCount').textContent = '0';
  document.getElementById('genUnknownCount').textContent = '0';

  showToast('Output cleared', 'info');
}

// ── Toast Notifications ──
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-xmark';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  container.appendChild(toast);

  // Auto remove after 2.5s
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ══════════════════════════════════
//  CC CHECKER / FILTER
// ══════════════════════════════════

// ── Luhn Check ──
function luhnCheck(cardNum) {
  let sum = 0;
  let alt = false;
  for (let i = cardNum.length - 1; i >= 0; i--) {
    let n = parseInt(cardNum[i], 10);
    if (isNaN(n)) return false;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

// ── Expiry Check (strict) ──
function isExpiryValid(mm, yyyy) {
  const month = parseInt(mm, 10);
  let year = parseInt(yyyy, 10);
  if (isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;
  
  // Handle 2-digit year
  if (year < 100) year += 2000;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // Expired
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  // Too far in future (>15 years suspicious)
  if (year > currentYear + 15) return false;
  
  return true;
}

// ── Enhanced BIN Range Validation ──
function getCardNetwork(cc) {
  const len = cc.length;
  const d1 = cc[0], d2 = cc.substring(0,2), d3 = cc.substring(0,3), d4 = cc.substring(0,4);

  if (d1 === '4') return 'visa';
  if (['51','52','53','54','55'].includes(d2) || (parseInt(d4)>=2221 && parseInt(d4)<=2720)) return 'mastercard';
  if (['34','37'].includes(d2)) return 'amex';
  if (d4 === '6011' || d2 === '65' || (parseInt(d3) >= 644 && parseInt(d3) <= 649)) return 'discover';
  if (parseInt(d4) >= 3528 && parseInt(d4) <= 3589) return 'jcb';
  if (d2 === '36' || d2 === '38' || (parseInt(d3) >= 300 && parseInt(d3) <= 305)) return 'diners';
  if (['5018','5020','5038','5893','6304','6759','6761','6762','6763'].includes(d4)) return 'maestro';
  if (d2 === '62') return 'unionpay';
  if (d1 >= '1' && d1 <= '9') return 'other';
  
  return null;
}

// ── BIN Validity ──
function isBINValid(cc) {
  if (cc.length < 13 || cc.length > 19) return false;
  if (!/^\d+$/.test(cc)) return false;
  const first = cc[0];
  return first >= '1' && first <= '9';
}

// ── CVV Validation per Network ──
function isCVVValid(cvv, network) {
  if (!cvv) return true;
  if (!/^\d+$/.test(cvv)) return false;
  if (network === 'amex') return cvv.length === 4;
  return cvv.length === 3;
}

// ── Parse Card Line ──
function parseCardLine(line) {
  const parts = line.trim().split('|');
  if (parts.length < 3) return null;
  return {
    cc: parts[0].trim(),
    mm: parts[1].trim(),
    yyyy: parts[2].trim(),
    cvv: parts[3] ? parts[3].trim() : '',
    raw: line.trim()
  };
}

// ── Check Single Card ──
function checkSingleCard(card) {
  if (!card) return 'unknown';
  
  // 1: Format check
  if (!/^\d+$/.test(card.cc)) return 'dead';
  
  // 2: Length + BIN prefix
  if (!isBINValid(card.cc)) return 'dead';
  
  // 3: Luhn algorithm
  if (!luhnCheck(card.cc)) return 'dead';
  
  // 4: Expiry validation
  if (!isExpiryValid(card.mm, card.yyyy)) return 'dead';
  
  // 5: CVV format
  const network = getCardNetwork(card.cc) || 'other';
  if (!isCVVValid(card.cvv, network)) return 'unknown';
  
  return 'live';
}

// ── Main Check Function ──
function checkCards() {
  const input = document.getElementById('checkerInput').value.trim();
  if (!input) {
    showToast('Paste cards to check', 'error');
    return;
  }

  const lines = input.split('\n').filter(l => l.trim());
  if (lines.length === 0) {
    showToast('No valid cards found', 'error');
    return;
  }

  // Show UI elements
  const btn = document.getElementById('checkBtn');
  const btnContent = document.getElementById('checkBtnContent');
  const btnLoader = document.getElementById('checkBtnLoader');
  const progress = document.getElementById('checkerProgress');
  const stats = document.getElementById('checkerStats');
  const resultGroup = document.getElementById('checkerResultGroup');

  btnContent.classList.add('hidden');
  btnLoader.classList.remove('hidden');
  btn.disabled = true;
  progress.classList.remove('hidden');

  let live = 0, dead = 0, unknown = 0;
  let deadCards = [], unknownCards = [];
  let liveCards = [];
  let processed = 0;
  const total = lines.length;

  // Reset checker results
  checkerResults = { live: [], dead: [], unknown: [] };

  // Process cards one by one with animation
  function processNext() {
    if (processed >= total) {
      // Done — show results
      btnContent.classList.remove('hidden');
      btnLoader.classList.add('hidden');
      btn.disabled = false;
      stats.classList.remove('hidden');

      document.getElementById('liveCount').textContent = live;
      document.getElementById('deadCount').textContent = dead;
      document.getElementById('unknownCount').textContent = unknown;

      // Store results for filter
      checkerResults.live = liveCards;
      checkerResults.dead = deadCards;
      checkerResults.unknown = unknownCards;

      // Show live cards by default
      filterCheckerResult('live');

      // Auto-update input to only live cards
      if (liveCards.length > 0) {
        document.getElementById('checkerInput').value = liveCards.join('\n');
      }

      // Update checker tab count
      document.getElementById('chkTabCount').textContent = `${live}✓`;

      // Success rate
      updateSuccessRate(live, total);

      // Session tracking
      sessionStats.checked += total;
      sessionStats.live += live;
      updateSessionStats();

      showToast(`Step 2/2 ✓ ${live} live, ${dead} dead, ${unknown} unknown`, live > 0 ? 'success' : 'error');
      return;
    }

    const card = parseCardLine(lines[processed]);
    const result = checkSingleCard(card);

    if (result === 'live') {
      live++;
      liveCards.push(lines[processed].trim());
    } else if (result === 'dead') {
      dead++;
      deadCards.push(lines[processed].trim());
    } else {
      unknown++;
      unknownCards.push(lines[processed].trim());
    }

    processed++;
    const pct = Math.round((processed / total) * 100);
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressText').textContent = pct + '%';

    // Animate with small delay per card
    const delay = total > 100 ? 10 : total > 30 ? 30 : 60;
    setTimeout(processNext, delay);
  }

  // Reset
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('progressText').textContent = '0%';
  stats.classList.add('hidden');
  resultGroup.classList.add('hidden');

  setTimeout(processNext, 200);
}



// ── Copy Live Cards ──
function copyLiveCards() {
  const textarea = document.getElementById('checkerOutput');
  const text = textarea.value.trim();
  if (!text) {
    showToast('No live cards to copy', 'info');
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Live cards copied!', 'success');
    }).catch(() => {
      textarea.select();
      document.execCommand('copy');
      showToast('Live cards copied!', 'success');
    });
  } else {
    textarea.select();
    document.execCommand('copy');
    showToast('Live cards copied!', 'success');
  }
}

// ── Clear Checker ──
function clearChecker() {
  document.getElementById('checkerInput').value = '';
  document.getElementById('checkerOutput').value = '';
  document.getElementById('checkerProgress').classList.add('hidden');
  document.getElementById('checkerStats').classList.add('hidden');
  document.getElementById('checkerResultGroup').classList.add('hidden');
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('progressText').textContent = '0%';
  document.getElementById('liveCount').textContent = '0';
  document.getElementById('deadCount').textContent = '0';
  document.getElementById('unknownCount').textContent = '0';
  document.getElementById('liveCardCount').textContent = '0 live';
  showToast('Checker cleared', 'info');
}

// ── Init on Load ──
window.addEventListener('DOMContentLoaded', () => {
  // Clear old theme key and use new one
  localStorage.removeItem('namso-theme');
  localStorage.removeItem('coregen-theme');
  const savedTheme = localStorage.getItem('ng-theme') || 'light';
  const icon = document.getElementById('theme-icon');

  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    icon.className = 'fa-solid fa-moon';
  } else {
    document.body.removeAttribute('data-theme');
    icon.className = 'fa-solid fa-sun';
  }

  // Set default mode to auto
  switchMode('auto');

  // BIN input — sanitize only (no auto-x while typing)
  const binInput = document.getElementById('bin');
  binInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9xX]/g, '');
  });

  // Year input — only digits, range 26-42
  const yearInput = document.getElementById('year');
  yearInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
    if (val.length === 2) {
      let num = parseInt(val);
      if (num < 26) val = '26';
      if (num > 42) val = '42';
    }
    e.target.value = val;
  });

  // Month input — only digits, range 1-12 (auto-pads on blur)
  const monthInput = document.getElementById('month');
  monthInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
    if (val.length === 2) {
      let num = parseInt(val);
      if (num < 1) val = '01';
      if (num > 12) val = '12';
      if (num >= 1 && num <= 9) val = '0' + num;
    }
    e.target.value = val;
  });
  // Auto-pad single digit month on blur (e.g. 5 → 05)
  monthInput.addEventListener('blur', (e) => {
    let val = e.target.value.trim();
    if (/^[1-9]$/.test(val)) {
      e.target.value = '0' + val;
    }
  });

  // CVV input — only digits
  const cvvInput = document.getElementById('ccv');
  cvvInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });

  // Quantity input — clamp to 3000 max
  const countInput = document.getElementById('count');
  countInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value);
    if (val > 3000) {
      e.target.value = 3000;
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
      e.preventDefault();
      generate();
    }
    if (e.key === 'Enter' && !e.shiftKey && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      generate();
    }
  });

  // Session timer
  startSessionTimer();
});

// ── Session Stats ──
let sessionStats = { generated: 0, checked: 0, live: 0 };
let sessionStart = Date.now();

function startSessionTimer() {
  setInterval(() => {
    const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    const el = document.getElementById('sessionTime');
    if (el) el.textContent = `${mins}:${secs}`;
  }, 1000);
}

function updateSessionStats() {
  document.getElementById('sessionGenCount').textContent = sessionStats.generated;
  document.getElementById('sessionChkCount').textContent = sessionStats.checked;
  document.getElementById('sessionLiveCount').textContent = sessionStats.live;
}

// ── BIN Live Detection ──
function onBinInput() {
  const bin = document.getElementById('bin').value.replace(/\D/g, '');
  const badge = document.getElementById('binBadge');
  const icon = document.getElementById('binBadgeIcon');
  const text = document.getElementById('binBadgeText');

  if (bin.length >= 1) {
    const brand = detectCardBrand(bin);
    badge.classList.remove('hidden');
    icon.className = brand.icon;
    text.textContent = brand.name;
  } else {
    badge.classList.add('hidden');
  }
}

function detectCardBrand(bin) {
  const first = bin.charAt(0);
  const first2 = bin.substring(0, 2);
  const first4 = bin.substring(0, 4);

  if (first === '4') return { name: 'Visa', icon: 'fa-brands fa-cc-visa' };
  if (['51','52','53','54','55'].includes(first2) || (parseInt(first4) >= 2221 && parseInt(first4) <= 2720))
    return { name: 'Mastercard', icon: 'fa-brands fa-cc-mastercard' };
  if (['34','37'].includes(first2)) return { name: 'Amex', icon: 'fa-brands fa-cc-amex' };
  if (['6011'].includes(first4) || first2 === '65' || first2 === '64')
    return { name: 'Discover', icon: 'fa-brands fa-cc-discover' };
  if (['35'].includes(first2)) return { name: 'JCB', icon: 'fa-brands fa-cc-jcb' };
  if (['30','36','38'].includes(first2)) return { name: 'Diners', icon: 'fa-brands fa-cc-diners-club' };
  if (first === '6') return { name: 'Maestro', icon: 'fa-solid fa-credit-card' };
  return { name: 'Card', icon: 'fa-solid fa-credit-card' };
}

// ── Recent BINs ──
function getRecentBins() {
  try { return JSON.parse(localStorage.getItem('ng-recent-bins') || '[]'); }
  catch { return []; }
}

function saveRecentBin(bin) {
  const clean = bin.replace(/[^0-9]/g, '').substring(0, 8);
  if (clean.length < 4) return;
  let recents = getRecentBins();
  recents = recents.filter(b => b.bin !== clean);
  const brand = detectCardBrand(clean);
  recents.unshift({ bin: clean, type: brand.name });
  if (recents.length > 8) recents = recents.slice(0, 8);
  localStorage.setItem('ng-recent-bins', JSON.stringify(recents));
}

function toggleRecentBins() {
  const container = document.getElementById('recentBins');
  if (!container.classList.contains('hidden')) {
    container.classList.add('hidden');
    return;
  }

  const recents = getRecentBins();
  container.innerHTML = '';

  if (recents.length === 0) {
    container.innerHTML = '<div class="recent-empty">No recent BINs</div>';
  } else {
    recents.forEach(r => {
      const item = document.createElement('div');
      item.className = 'recent-bin-item';
      item.innerHTML = `<span>${r.bin}</span><span class="bin-type">${r.type}</span>`;
      item.onclick = () => {
        document.getElementById('bin').value = r.bin;
        onBinInput();
        container.classList.add('hidden');
      };
      container.appendChild(item);
    });
  }

  container.classList.remove('hidden');
}

// ── Download Cards ──
function downloadCards(type) {
  let content = '';
  let filename = '';

  if (type === 'gen') {
    content = document.getElementById('output').value;
    filename = 'generated_cards.txt';
  } else {
    content = document.getElementById('checkerOutput').value;
    filename = 'filtered_cards.txt';
  }

  if (!content.trim()) {
    showToast('Nothing to download', 'info');
    return;
  }

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${filename}`, 'success');
}

// ── Success Rate ──
function updateSuccessRate(live, total) {
  const rate = total > 0 ? Math.round((live / total) * 100) : 0;
  const el = document.getElementById('successRate');
  const fill = document.getElementById('rateFill');
  const text = document.getElementById('rateText');
  el.classList.remove('hidden');
  fill.style.width = rate + '%';
  if (rate >= 70) fill.style.background = '#22c55e';
  else if (rate >= 40) fill.style.background = '#f59e0b';
  else fill.style.background = '#ef4444';
  text.textContent = `${rate}% pass rate`;
}
