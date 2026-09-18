/**
 * Mock API Interceptor — provides fallback data when Python backend is unavailable.
 * This allows the dashboard UI to render on static hosts like Lovable.
 * All API calls return empty/default data so the UI shows its structure without errors.
 */
(function () {
  "use strict";

  var BANNER_ID = "demo-mode-banner";

  function showBanner() {
    if (document.getElementById(BANNER_ID)) return;
    var b = document.createElement("div");
    b.id = BANNER_ID;
    b.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:99999;background:#f59e0b;color:#1a1a1a;font-size:13px;font-weight:600;text-align:center;padding:6px 12px;font-family:system-ui,sans-serif;box-shadow:0 1px 3px rgba(0,0,0,.3)";
    b.textContent =
      "Mode Demo — Backend Python tidak tersedia. Menampilkan UI tanpa data real. Jalankan server Python untuk data lengkap.";
    document.body ? document.body.appendChild(b) : document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(b); });
    document.body.style.marginTop = "32px";
  }

  var MOCK = {
    "/api/overview": {
      tickets: [], initiatives: [], waiting: [], decisions: [],
      today: { items: [], date: new Date().toISOString().slice(0, 10) },
    },
    "/api/progress": null,
    "/api/briefing": null,
    "/api/ai-task": { tasks: [] },
    "/api/ai-task?list=1": { tasks: [] },
    "/api/command-queue": { items: [] },
    "/api/command-queue-ack": { ok: true },
    "/api/calendar": { events: [] },
    "/api/activity-spark": { html: "" },
    "/api/waiting-close": { ok: true },
    "/api/commitment-link": { ok: true },
    "/api/commitment-close": { ok: true },
    "/api/inbox": { items: [] },
    "/api/inbox-action": { ok: true },
    "/api/inbox-send": { ok: true },
    "/api/inbox-send-token": { ok: true },
    "/api/inbox-sweep": { ok: true },
    "/api/commitments": { items: [] },
    "/api/decisions": { items: [] },
    "/api/meetings": { items: [] },
    "/api/metrics": { items: [] },
    "/api/portfolio": { items: [] },
    "/api/harness": { name: "demo", status: "offline" },
    "/api/harness-map": { map: {} },
    "/api/heartbeat": { status: "offline", last: null },
    "/api/agy-cost": { entries: [] },
  };

  function matchMock(url) {
    var path = url.split("?")[0];
    var key = url;
    if (MOCK.hasOwnProperty(key)) return MOCK[key];
    if (MOCK.hasOwnProperty(path)) return MOCK[path];
    for (var k in MOCK) {
      if (path === k.split("?")[0]) return MOCK[k];
    }
    return {};
  }

  var origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function (input, init) {
      var url = typeof input === "string" ? input : (input && input.url) || "";
      if (url.indexOf("/api/") !== -1 || url.indexOf("api/") !== -1) {
        showBanner();
        return Promise.resolve(
          new Response(JSON.stringify(matchMock(url)), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }
      return origFetch.apply(this, arguments);
    };
  }

  console.log("[Mock API] Active — all /api/* calls return demo data");
})();
