const UTIL = {
	isObject: function(object) {
		return object !== null && "object" === typeof object;
	},
	isDate: function(object) {
		return UTIL.isObject(object) && typeof object.getTime === "function";
	},
	isFunction: function(object) {
		return "function" === typeof object;
	},
	isString: function(object) {
		return "string" === typeof object;
	},
	isArray: function(object) {
		return Array.isArray(object);
	},
	isNumber: function(object) {
		return "number" === typeof object;
	},

	toString: function(v) {
		if(UTIL.isNumber(v)) {
			return v.toString();
		}
		return v;
	},
	toNumber: function(s) {
		if(UTIL.isString(s)) {
			s = s.replace(/[\,]/g, "");
		}
		return isNaN(s) ? 0 : Number(s);
	},
	getNumber: function(s) {
		var n = s.match(/[0-9]+/g);
		if(UTIL.isNotEmpty(n) && n.length>0) {
			var nn = UTIL.toNumber(n.join(""));
			if(UTIL.isNumber(nn)) return nn;
		}
		return null;
	},

	isEmpty: function(object) {
		return object === null
			 || "undefined" === typeof object
			 || (UTIL.isObject(object) && !Object.keys(object).length && !UTIL.isDate(object))
			 || (UTIL.isString(object) && object.trim() === "")
			 || (UTIL.isArray(object) && object.length === 0);
	},
	isNotEmpty: function(obj) {
		return !UTIL.isEmpty(obj);
	},

	request: function(callUrl, body, option) {
		option = option || {};
		return new Promise((resolve, reject) => {
		this._request(callUrl, body, function (response) {
			response && response.success
			? resolve(response.data)
			: reject(response.error);
		}, option);
		});
	},

	_request: function (callUrl, body, sendResponse, option) {
		var requestId = crypto.randomUUID();
		window.postMessage({
			type: "RIDI_REQUEST",
			requestId: requestId,
			callUrl: callUrl,
			body: body,
			option: option
		},"*");
		function handler(e) {
			if (e.data && e.data.type === "RIDI_RESPONSE" && e.data.requestId === requestId) {
				window.removeEventListener("message", handler);
				sendResponse(e.data);
			}
		}
		window.addEventListener("message", handler);
	},

	request_old: function(callUrl, body, options) {
		var optionObj = options || {};
		optionObj.isResultJson = optionObj.isResultJson || false;
		return new Promise((resolve, reject) => {
			try {
				this._request(callUrl, body, function (response) {
					(response?.success) ? resolve(response.data) : reject(response.error);
				}, optionObj);
			} catch (e) {
				reject("BG.request failed: " + e.toString());
			}
		});
	},

	_request_old: function(callUrl, body, sendResponse, option) {
		console.debug("callUrl: ", callUrl);
		option = option || {};
		var mtd = (body != null && typeof body != 'undefined') ? "POST" : "GET";
		fetch(callUrl, {
			method: mtd,
			credentials: 'include',
			headers: {
				"Content-Type": (option.isResultJson)?"application/json":'application/x-www-form-urlencoded'
			},
			body: mtd === "POST" ? JSON.stringify(body) : undefined
		})
		.then(async (res) => {
			try {
				if(option.isResultJson) {
					const result = await res.json();
					console.debug("result: ",result);
					sendResponse({ success: true, data: result });
				}
				else {
					const json = await res.text();
					console.debug("json: ",json);
					sendResponse({ success: true, data: json });
				}
			} catch (parseErr) {
				sendResponse({ success: false, error: "Response parsing error: " + parseErr.toString() });
			}
		})
		.catch((err) => {
			sendResponse({ success: false, error: err.toString() });
		});
	},
	runWithConcurrencyLimit: async function(tasks, limit) {
		const results = [];
		let running = [];
		for (const task of tasks) {
			const p = task().finally(() => {
				running = running.filter(r => r !== p);
			});
			results.push(p);
			running.push(p);
			// 동시 실행 개수 초과 시 하나 끝날 때까지 대기
			if (running.length >= limit) {
				await Promise.race(running);
			}
		}
		return Promise.all(results);
	},

	jsObjectToJson: function(str) {
		return str
			.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
			.replace(/'([^']*)'/g, function(_, val) {
				return '"' + val.replace(/"/g, '\\"') + '"';
			})
			.replace(/,\s*}/g, '}')
	}
};
export default UTIL;
//
//// 단일 변수 (string 등) 추출
//function extractVar(script, varName) {
//    const regex = new RegExp(`var\\s+${varName}\\s*=\\s*['"]([^'"]+)['"]`, 'm');
//    const match = script.match(regex);
//    return match ? match[1] : null;
//}
//
//// 객체형 변수 추출
//function extractObject(script, varName) {
//    const regex = new RegExp(`var\\s+${varName}\\s*=\\s*(\\{[\\s\\S]*?\\});`);
//    const match = script.match(regex);
//    if (match && match[1]) {
//        try {
//            return JSON.parse(match[1]
//                .replace(/(\r\n|\n|\r)/gm, '')             // 줄바꿈 제거
//                .replace(/,(\s*})/g, '$1')                 // 마지막 콤마 제거
//                .replace(/([a-zA-Z0-9_]+):/g, '"$1":')     // 키에 따옴표 추가
//                .replace(/'/g, '"')                        // 작은따옴표를 큰따옴표로
//            );
//        } catch (e) {
//            console.error('JSON 파싱 오류:', e);
//        }
//    }
//    return null;
//}
//
