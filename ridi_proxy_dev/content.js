// extension/content.js

window.addEventListener("message", function (e) {
  if (e.source !== window) return;
  if (!e.data || e.data.type !== "RIDI_REQUEST") return;

  chrome.runtime.sendMessage(e.data, function (res) {
    window.postMessage(
      {
        type: "RIDI_RESPONSE",
        requestId: e.data.requestId,
        success: res.success,
        data: res.data,
        error: res.error
      },
      "*"
    );
  });
});
