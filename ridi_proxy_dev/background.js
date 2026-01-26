// extension/background.js

function request(callUrl, body, option) {
  option = option || {};
  return new Promise(function (resolve, reject) {
    _request(callUrl, body, function (response) {
      response && response.success
        ? resolve(response.data)
        : reject(response.error);
    }, option);
  });
}

function _request(callUrl, body, sendResponse, option) {
  var method = body != null ? "POST" : "GET";

  fetch(callUrl, {
    method: method,
    credentials: "include",
    headers: {
      "Content-Type": option.isResultJson
        ? "application/json"
        : "application/x-www-form-urlencoded"
    },
    body: method === "POST" ? JSON.stringify(body) : undefined
  })
    .then(function (res) {
      return option.isResultJson ? res.json() : res.text();
    })
    .then(function (data) {
      sendResponse({ success: true, data: data });
    })
    .catch(function (err) {
      sendResponse({ success: false, error: err.toString() });
    });
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (!msg || msg.type !== "RIDI_REQUEST") return;

  request(msg.callUrl, msg.body, msg.option)
    .then(function (data) {
      sendResponse({ success: true, data: data });
    })
    .catch(function (error) {
      sendResponse({ success: false, error: error });
    });

  return true; // async
});
