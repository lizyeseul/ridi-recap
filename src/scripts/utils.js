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

	request: function(callUrl, body, options) {
		//TEMP
		// callUrl = callUrl.replaceAll("https://ridibooks.com","/base_url");
		// callUrl = callUrl.replaceAll("https://library-api.ridibooks.com/","/library_api");
		// callUrl = callUrl.replaceAll("https://book-api.ridibooks.com/","/book_api");
		//TEMP END

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

	_request: function(callUrl, body, sendResponse, option) {
		console.debug("callUrl: ", callUrl);
		option = option || {};
		var mtd = (body != null && typeof body != 'undefined') ? "POST" : "GET";
		fetch(callUrl, {
			method: mtd,
			credentials: 'include',
			headers: {
				"Content-Type": (option.isResultJson)?"application/json":'application/x-www-form-urlencoded',
				"Cookie":"user_device_type=PC; user_device_type=PC; ridibooks.connect.sid=s%3ADSUiTpB2GXJqPWAxXb2WmmJIsmRTXtvD.pU37fRksTjDJLPNzW%2FQiKq2%2BAZ%2BKOmC87GFWLrrQPsI; ruid=070672b0-ruid-4b40-b008-b644d8a07a36; fingerprint=a93ec4e8f3b0551c612f17dec73d8aa0; _fwb=138ry109NnbUO7Ns1U2uRUq.1757946211867; _gcl_au=1.1.396343091.1757946212; _fbp=fb.1.1757946212099.87467799537813605; _ga=GA1.1.1915132387.1757946212; _tt_enable_cookie=1; _ttp=01K56W4VZV0FX1B4VB2PXM2XZ6_.tt.1; airbridge_migration_metadata__ridi=%7B%22version%22%3A%221.10.77%22%7D; ab180ClientId=a196b621-7571-4a1d-b01c-b017f3e9408f; PHPSESSID=3254926e-7067-4955-9e2d-82651b8908cf; ridi-al=1; ridi-at=eyJhbGciOiJSUzI1NiIsInR5cCI6ImF0K0pXVCIsImtpZCI6IlJTMDAwIn0.eyJjbGllbnRfaWQiOiJlUGdiS0tSeVB2ZEFGelR2RmcyRHZyUzdHZW5mc3RIZGtRMnV2Rk5kIiwiZXhwIjoxNzU4NTUxMDE3LCJzY29wZSI6ImFsbCIsInN1YiI6Imx5czBzdGFyIiwidV9pZHgiOjQ1NDM3OTYsInVzZXJfdG9rZW5fdXVpZCI6IjQ2ZDZkZWQyLTgzOTMtNDRhMi1iNmIxLWEzZDNkYmQxMzFiMiIsImlhdCI6MTc1Nzk0NjIxNywiaXNzIjoiaHR0cHM6Ly9yaWRpLmNvbS8ifQ.AMQ0GVefTJjiRYA-aQ0cQS4Lmz_iDWRNTAAcHKO40ooTFa7OV_C18CNYN84IhcreAYac0CH39LPN0Yh7JU8A8mjQGkNWmOoWLvs2mlHGOkZyS_EhPQN0xQeasPEJ03xqyoMFrumKZx0u27PCABOgQ1ll5_Qyx_2jX8U0Nv6vppMjJ-plkWfHFJe9M4iXmthEnFKnNdjY6X_SZFyQDJJBtl7NWeQl_L-E-ZAdvi3UDCX059TtrAlEceKEfXZvJ7os1WhCuGp8KgGeHS5LQSpoqArB4D_9UkRd4mYVYXWTeY7rbPXAmwgKwH0GccJLxsY5T8WsxZowv3yNJlBz2e_x6q4UgN4B9Ub_4p3G7ATQ98V18uD9bwqMOba6EbZW9-QI_fiSowu0__evy12lxVzQU-hkq7taO529kDdF2t_z_fmi4INUTzhXXDdk8C04nA84qxWQsj35HwJyumqtpA-t3qicqMpLlpUgE_W6CbFJaTd9HZV_neZl56ZWBLwSZHnS68gu9U3qP-skMTQ6EdvQ5ZdY_rOF1qDAn5bctCajTURNFjtpa7Yjlc02uBNr40DhcEg6snd_CxhFn0UCCsFXJNi82xlGRz-vSc0AguHhW3XDvj9ywN_NMQLm1E3nCAZianHDmMLnVEZVgecl1RL6z4FTgHYrU8Ghi4JCoiJ3FOM; ridi-rt=eyJhbGciOiJSUzI1NiIsInR5cCI6InJ0K0pXVCIsImtpZCI6IlJTMDAwIn0.eyJ2IjoyLCJyaWRpLmNvbS9hbCI6dHJ1ZSwicmlkaS5jb20vdXVpZCI6IjQ2ZDZkZWQyLTgzOTMtNDRhMi1iNmIxLWEzZDNkYmQxMzFiMiIsImlhdCI6MTc1Nzk0NjIxN30.HsxM7j7QaZC2hV0-Wxt9nQ4U4A1cBPFla6rtk7Qb3-LZO43ehk-ooSNYAQf54ek17NgDzKLmnYm4O9SCIlyEe65UDAi2QuJnfqzra36GWtMIhJLQUiUt2gc5dyvTTc-JEroxz_dGGMinV7fnik5YTyDe_pzlzUQEGT7Ir_M0dcA6BJieOMrFcfnis_KP88yVgQuJhclRBhfC6j5GnZRa2Az8wFCU6_h0JqmrXux5SlDu7mnSoY5kpti-eOxlO7wvXMEqKIk421udsPmsdhdaCs2ZY8pt7UlqRW8ajAPcD_yKOBw-n_eI9Wna06aqEecPrIGJH0xeTYhTlp4aq5HcZADr2OjidN4-769SdOA1uLueGrGdl_GHhykEnuuAc07uJpCuJMEkeE_FvoddeWsVWEU-qZj1TToHaGOCfgQITN_OchsreaEyDD9CAT3VlbBTZXcw8z_iAwxo54f0ylKAIvs4QijZsPrsqW77U0Or8EiUDKksuK8DgQ5Jz55sKJLYGgUjAl2-EEeeUo4Yv9I6rDwuuDzjt2EU_DLQy3gW70l8yh7Ic-Sjca52ZwNruSSkJGyEfHvuEjmdslj1sR1FbxBmQNG_BbVENeO4Rtp1TgvzrrU4Bq0ImnCUuDfTbOBnH6PGpJ42l6RUAiZeXIcdSVTeTNwCIhNkdR2pZA39xGI; ridi-ffid=b6881bc4-6036-4179-9c5a-6b28a1d15667; ridi_auth=%7B%22id%22%3A%22lys0star%22%2C%22idx%22%3A4543796%2C%22isVerifiedAdult%22%3Atrue%7D; AMP_MKTG_ea981d7201=JTdCJTdE; ridi_nav=x.6.b.254g; attribution_tool_params=%7B%22ga%22%3A%7B%22session_id%22%3A%22GS2.1.s1757946212%24o1%24g1%24t1757947015%24j2%24l0%24h0%22%2C%22client_id%22%3A%22GA1.1.1915132387.1757946212%22%2C%22ga_blocked%22%3Afalse%7D%2C%22amplitude%22%3A%7B%22session_id%22%3A%221757946211739%22%7D%2C%22airbridge%22%3A%7B%22cookie_id%22%3A%2236db6eb9-2711-497e-9155-bc73bd2546df%22%2C%22short_id%22%3A%22%22%2C%22channel%22%3A%22airbridge.websdk%22%2C%22campaign_params%22%3A%7B%7D%7D%2C%22device_type%22%3A%22pc%22%2C%22path%22%3A%22%22%7D; pvid=3bdb6c2f-pvid-4485-82b3-6e7f709cfa71; wcs_bt=s_116898344f34:1757948869|unknown:1757946211; ab.storage.sessionId.1440c75a-6f4b-48d9-8e69-8d6fd78a9fbc=%7B%22g%22%3A%22d6caa8fa-41ec-e4bd-6e08-f7f21ef1a662%22%2C%22e%22%3A1757950671952%2C%22c%22%3A1757945741161%2C%22l%22%3A1757948871952%7D; AMP_ea981d7201=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjIwNzA2NzJiMC1ydWlkLTRiNDAtYjAwOC1iNjQ0ZDhhMDdhMzYlMjIlMkMlMjJ1c2VySWQlMjIlM0ElMjI0NTQzNzk2JTIyJTJDJTIyc2Vzc2lvbklkJTIyJTNBMTc1Nzk0ODU5MTM0OSUyQyUyMm9wdE91dCUyMiUzQWZhbHNlJTJDJTIybGFzdEV2ZW50VGltZSUyMiUzQTE3NTc5NDg1OTE0OTUlMkMlMjJsYXN0RXZlbnRJZCUyMiUzQTclMkMlMjJwYWdlQ291bnRlciUyMiUzQTAlN0Q=; ttcsid=1757946212349::fv9O5IKctEd3Pn2z_DV5.1.1757948872586; ttcsid_CIMGKC3C77UD88O1E1H0=1757946212349::PWoU-QZ9uO-XbZQhdbfc.1.1757948872797; _ga_YB9VX70336=GS2.1.s1757946212$o1$g1$t1757948873$j55$l0$h0; airbridge_session=%7B%22id%22%3A%227c568fc5-9a14-4808-8215-54dcae3c86a7%22%2C%22timeout%22%3A1800000%2C%22start%22%3A1757946213403%2C%22end%22%3A1757948873792%7D; airbridge_device_alias=%7B%22amplitude_device_id%22%3A%22070672b0-ruid-4b40-b008-b644d8a07a36%22%7D; airbridge_user=%7B%22externalUserID%22%3A%224543796%22%7D"
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
