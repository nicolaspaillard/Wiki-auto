function wikiAuto() {
  if (window._running) return window._stop();
  window._running = true;
  const selectors = {
    boosters: "div.text-lg>span:nth-child(1)",
    openBtn: "button.flex:nth-child(2)",
    nextBtn: "button.w-12:nth-child(3)",
    confirmBtn: "button.px-8",
    checkText: "p[class~='text-[var(--color-foreground)]/75']",
    checkInput: "input[class~='mt-0.5']",
    checkBtn: "button.w-full",
    rarity: "div.absolute:nth-child(4)",
  };
  const raritiesKeys = ["C", "PC", "R", "SR", "UR", "L"];
  let paused = false,
    on = true,
    running = false;
  const { confirm: origConfirm, alert: origAlert } = window;
  window.confirm = () => true;
  window.alert = () => {};
  const alive = () => on && !paused;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (min, max) => min + Math.random() * (max - min);
  const waitFor = async (sel, ready = () => true, timeout = 30000) => {
    const end = Date.now() + timeout;
    let element;
    while (alive() && Date.now() < end && !((element = document.querySelector(sel)) && ready(element))) await sleep(200);
    return element && ready(element) ? element : null;
  };
  const el = (tag, css, text) => {
    const e = document.createElement(tag);
    e.style.cssText = css;
    if (text != null) e.textContent = text;
    return e;
  };
  const btn = (text, title, bg, color) => Object.assign(el("button", "background:" + bg + ";border:none;color:" + color + ";font-size:13px;padding:3px 8px;border-radius:6px;cursor:pointer;font-weight:bold;", text), { title });
  const wrap = el("div", "position:fixed;bottom:18px;right:18px;z-index:999999;display:flex;flex-direction:column;align-items:stretch;gap:6px;");
  const logBox = el("div", "display:none;box-sizing:border-box;width:0;min-width:100%;background:rgba(10,10,20,0.93);border:1.5px solid #c9a84c;border-radius:12px;padding:6px 10px;font-family:monospace;font-size:11px;color:#ddd;max-height:200px;overflow-y:auto;box-shadow:0 4px 24px rgba(0,0,0,0.7);");
  const raritiesBox = el("div", "display:flex;gap:6px;background:rgba(10,10,20,0.93);border:1.5px solid #c9a84c;border-radius:12px;padding:5px 10px;box-shadow:0 4px 24px rgba(0,0,0,0.7);");
  const rarities = {};
  for (const key of raritiesKeys) {
    const cell = el("span", "display:flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;font-family:monospace;font-size:11px;font-weight:bold;background-color:var(--color-rarity-" + key.toLowerCase() + ");color:rgb(13,17,23);box-shadow:0 0 8px var(--color-rarity-" + key.toLowerCase() + ")99;", key + ":");
    const v = el("span", "font-size:12px;", "0");
    cell.append(v);
    raritiesBox.append(cell);
    rarities[key] = v;
  }
  const ui = el("div", "background:rgba(10,10,20,0.93);border:1.5px solid #c9a84c;border-radius:12px;padding:8px 12px;display:flex;align-items:center;gap:9px;font-family:monospace;font-size:13px;color:#c9a84c;box-shadow:0 4px 24px rgba(0,0,0,0.7);user-select:none;");
  const dot = el("span", "width:9px;height:9px;background:#4ade80;border-radius:50%;display:inline-block;flex-shrink:0;");
  const label = el("span", "color:#fff;font-size:12px;", "⚡ Wiki-Masters");
  const counter = el("span", "color:#f0c040;font-weight:bold;min-width:28px;text-align:center;font-size:12px;margin-right:auto", "0");
  const btnPause = btn("⏸", "Pause / Resume", "#c9a84c", "#000");
  const btnStop = btn("■", "Stop", "#ef4444", "#fff");
  ui.append(dot, label, counter, btnPause, btnStop);
  wrap.append(logBox, raritiesBox, ui);
  document.body.appendChild(wrap);
  const log = (msg) => {
    logBox.style.display = "block";
    logBox.append(el("div", "white-space:normal;word-break:break-word;", "[" + new Date().toTimeString().slice(0, 8) + "] " + msg));
    logBox.scrollTop = logBox.scrollHeight;
  };
  const handleError = (source) => {
    if (!alive()) return false;
    log(source + " error, retrying");
    return true;
  };
  const watchdog = setInterval(() => {
    if (!alive()) return;
    const checkText = document.querySelector(selectors.checkText);
    if (!checkText || !checkText.textContent.toLowerCase().includes("pour continuer à ouvrir des paquets, confirme que")) return;
    const checkInput = document.querySelector(selectors.checkInput);
    if (checkInput && !checkInput.checked) checkInput.click();
    const checkBtn = document.querySelector(selectors.checkBtn);
    if (checkBtn && !checkBtn.disabled) {
      checkBtn.click();
      log("Closed popup");
    }
  }, 5000);
  btnPause.onclick = () => {
    paused = !paused;
    dot.style.background = paused ? "#f59e0b" : "#4ade80";
    btnPause.textContent = paused ? "▶" : "⏸";
    btnPause.style.background = paused ? "#4ade80" : "#c9a84c";
    if (!paused) start();
  };
  btnStop.onclick = window._stop = () => {
    on = false;
    clearInterval(watchdog);
    window._running = false;
    window.confirm = origConfirm;
    window.alert = origAlert;
    dot.style.background = "#ef4444";
    label.textContent = "⚡ Stopped";
    btnPause.disabled = true;
    setTimeout(() => wrap.remove(), 2000);
  };
  async function start() {
    if (running) return;
    running = true;
    try {
      while (alive()) {
        const boosters = await waitFor(selectors.boosters);
        if (!boosters) {
          if (handleError("Boosters")) continue;
          break;
        } else if (boosters.textContent.trim() === "0") {
          const minutes = rand(10 * 5, 10 * 13);
          log("No booster left, waiting " + new Date(minutes * 60 * 1000).toISOString().slice(11, 19) + " for " + Math.min(Math.trunc(minutes / 10), 10) + " boosters");
          for (const end = Date.now() + minutes * 60 * 1000; alive() && Date.now() < end; ) await sleep(Math.min(500, end - Date.now()));
          continue;
        }
        log(boosters.textContent + " boosters left");
        const openBtn = await waitFor(selectors.openBtn, (b) => !b.disabled);
        if (!openBtn) {
          if (handleError("Open")) continue;
          break;
        }
        openBtn.click();
        log("Booster opened");
        const nextBtn = await waitFor(selectors.nextBtn);
        if (!nextBtn) {
          if (handleError("Next")) continue;
          break;
        }
        for (let i = 0; i < 5; i++) {
          await sleep(rand(300, 800));
          const rarity = document.querySelector(selectors.rarity);
          if (rarity) {
            const text = rarity.textContent.trim().toUpperCase();
            if (rarities[text]) rarities[text].textContent++;
          }
          if (i < 4) nextBtn.click();
        }
        log("Cards revealed");
        const confirmBtn = await waitFor(selectors.confirmBtn);
        if (!confirmBtn) {
          if (handleError("Confirm")) continue;
          break;
        }
        confirmBtn.click();
        log("Booster confirmed");
        counter.textContent++;
      }
    } catch (err) {
      console.error("Wiki-Masters loop error:", err);
    } finally {
      running = false;
    }
  }
  start();
}
