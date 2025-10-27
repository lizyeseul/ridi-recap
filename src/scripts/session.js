import UTIL from "@/scripts/utils.js"
import { URL, parser } from "@/scripts/static.js"
import $ from 'jquery';

var SESSION = {
	setRidiGlobalVal: async function() {
		try {
			document.cookie = "user_device_type=Pc; path=/; Domain=.ridibooks.com";
			localStorage.removeItem("copyRidi");
			const res = await UTIL.request(URL.base+URL.history+"?page=999", null, null);
			var htmlDOM = parser.parseFromString(res, "text/html");
			var scripts = $(htmlDOM).find("script");
			var targetStr = null;
			scripts.each(function() {
				var cd = $(this).text();
				if(cd.includes("var Ridi")) {
					targetStr = $(this);
					return false;
				}
			});

			if(targetStr) {
				var copyRidi = {};
				if(UTIL.isEmpty(targetStr)) return;

				var code = targetStr[0].innerText;
				var match = code.match(/Ridi\.globals\s*=\s*({[\s\S]*?});/);
				if(match){
					var jsonLike = match[1];
					copyRidi.globals = JSON.parse(UTIL.jsObjectToJson(jsonLike));
				}

				match = code.match(/Ridi\.Auth\s*=\s*([\s\S]*?);/);
				if(match){
					var temp = match[1];
					copyRidi.Auth = (temp == 'true');
				}

				match = code.match(/Ridi\.Platform\s*=\s*'([\s\S]*?)';/);
				if(match){
					var temp = match[1];
					copyRidi.Platform = temp;
				}

				localStorage.setItem("copyRidi", JSON.stringify(copyRidi));
			}
		}
		catch(e) {
			console.error("setRidiGlobalVal 오류:", e);
		}
	},
	/*
	결제내역 마지막 페이지 번호, 마지막 페이지에 있는 목록 아이템 수 파싱 및 세션에 저장
	*/
	updatePageInfo: async function() {
		try {
			var res = await UTIL.request(URL.base+URL.history+"?page=999", null, null);
			var htmlDOM = parser.parseFromString(res, "text/html");
			//class="btn_next" 없으면 마지막페이지
			sessionStorage.setItem("lastPageNum", 999);
			if($(htmlDOM).find(".btn_next").length == 0) {
				var itemList = $(htmlDOM).find(".page_this a");
				if(itemList.length > 0) {
					sessionStorage.setItem("lastPageNum", $(htmlDOM).find(".page_this a")[0].innerText);
					// sessionStorage.setItem("lastPageCnt", $(htmlDOM).find(".js_rui_detail_link").length);
				}
			}

			//class="btn_prev" 없으면 첫페이지
			sessionStorage.setItem("lastPageCnt", 1);
			var res2 = await UTIL.request(URL.base+URL.history+"?page="+sessionStorage.getItem("lastPageNum"), null, null);
			var htmlDOM2 = parser.parseFromString(res2, "text/html");
			if($(htmlDOM2).find(".btn_next").length == 0) {
				let copyRidi = JSON.parse(localStorage.getItem("copyRidi"));
				if(copyRidi.globals.isPc == true) {
					sessionStorage.setItem("lastPageCnt", $(htmlDOM2).find(".js_rui_detail_link").length);
				}
				else {
					sessionStorage.setItem("lastPageCnt", $(htmlDOM2).find(".list_item").length);
				}
			}

			var mainCnt = await UTIL.request(URL.LIBRARY_BASE+"items/main/count/", null, { isResultJson: true });
			sessionStorage.setItem("unitCnt", mainCnt.unit_total_count+100);
		}
		catch(e) {
			console.error("updateLastPageInfo 오류:", e);
		}
	}
};
export default SESSION;
