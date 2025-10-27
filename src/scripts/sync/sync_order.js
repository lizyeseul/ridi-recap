import DB from "@/scripts/connect_db.js";
import UTIL from "@/scripts/utils.js";
import { URL, parser } from "@/scripts/static.js";
import dayjs from "dayjs";
import $ from "jquery";
//TODO react custom hook 형태로 변경

var SYNC_ORDER = {
	/**
	 * store_order에 있는 book_id중에서 store_book에 없는 데이터 껍데기 생성
	 */
	ensureAllBook: async function() {
		let orderList = await DB.getValueByIdx("store_order", "order_no", null);
		for(let orderItem of orderList) {
			for(let bookId of Object.keys(orderItem.book_list)) {
				await SYNC_ORDER.ensureBookById(bookId);
			}
		}
	},
	/**
	 * book_id기준 store_book에 없는 데이터 껍데기 생성
	 * @param {number|string} book_id
	 */
	ensureBookById: async function(bookId) {
		bookId = UTIL.toNumber(bookId);
		let bookCnt = await DB.getCountByIdx("store_book", "book_id", {range: bookId});
		if(bookCnt === 0) {
			await DB.updateData("store_book", bookId, { book_id: bookId, unit_id: 0 }, "update");
		}
	},
	/**
	 * store_order에 없는 주문번호 크롤링
	 * @param {setState} setIngPage 화면에 진행중 라벨 표시
	 * @returns
	 */
	syncOrderRecent: async function(setIngPage) {
		let maxOrderSeq = await DB.getValueByIdx("store_order","order_seq", {direction: "prev", limit: 1});
		if(UTIL.isEmpty(maxOrderSeq[0])) return;

		maxOrderSeq = maxOrderSeq[0].order_seq;
		let lastPageNum = UTIL.toNumber(sessionStorage.getItem("lastPageNum"));
		let lastPageCnt = UTIL.toNumber(sessionStorage.getItem("lastPageCnt"));
		let lastOrderSeq = (lastPageNum-1) * 15 + lastPageCnt;
		if(maxOrderSeq >= lastOrderSeq) return;

		await SYNC_ORDER.syncOrder(1, Math.floor(((lastOrderSeq-maxOrderSeq)+14) / 15), setIngPage);
		//TODO store_order에서 order_seq maxOrderSeq 보다 큰 것들 가져와서 book_list안에 있는 book_id기준으로 store_book정보 업데이트
	},
	/**
	 * 결제내역 일부만 크롤링
	 * @param {number} fromPage 결제내역 크롤링 시작 페이지
	 * @param {number} toPage 결제내역 크롤링 끝 페이지
	 * @param {setState} setIngPage 화면에 진행중 라벨 표시
	 */
	syncOrder: async function(fromPage, toPage, setIngPage) {
		document.cookie = "user_device_type=Pc; path=/; Domain=.ridibooks.com";	//TODO 일단 쿠키 고정, 위치 이동하거나 다른곳에도 적용하거나 기존쿠키값 저장하고 있다가 로직 끝나면 원본으로 변경하거나

		//TODO 리셋옵션 적용하면 해당 페이지들 order_seq 계산해서 삭제 후 크롤링 진행
		const pageTasks = [];
		let processedCount = 0; // 전역 카운터
		setIngPage("stage 1/2 : "+UTIL.toString(processedCount)+"/"+UTIL.toString(toPage - fromPage + 1));
		for (let pageIdx = fromPage; pageIdx <= toPage; pageIdx++) {
			pageTasks.push(async () => {
				const orderNoList = await this.parseHistoryListPage(pageIdx, false);
				setIngPage("stage 1/2 : "+UTIL.toString(processedCount++)+"/"+UTIL.toString(toPage - fromPage + 1));
				return { pageIdx, orderNoList };
			});
		}

		// 1. 페이지를 병렬로 요청하여 모든 주문번호 수집
		const pageResults = await UTIL.runWithConcurrencyLimit(pageTasks, 20);
		pageResults.sort((a, b) => a.pageIdx - b.pageIdx);
		const allOrderNoList = pageResults.flatMap(res => res.orderNoList);

		// 2. 주문 상세 병렬 처리 + 진행 상황 라벨 유지
		processedCount = 0;
		let endPage = "/"+UTIL.toString((toPage * 15) - (fromPage * 15 - 14) + 1);
		setIngPage("stage 2/2 : "+UTIL.toString(processedCount)+endPage);
		const orderTasks = allOrderNoList.map(orderNo => async () => {
			await this.parseHistoryDetailPage(orderNo);
			setIngPage("stage 2/2 : "+UTIL.toString(processedCount++)+endPage);
		});
		await UTIL.runWithConcurrencyLimit(orderTasks, 50);
	},
	/**
	 * 특정 결제내역 페이지 목록 크롤링, store_order의 헤더정보
	 * @param {number} pageIdx 크롤링할 결제내역 페이지 번호
	 */
	parseHistoryListPage: async function(pageIdx) {
		try {
			let res = await UTIL.request(URL.base+URL.history+"?page="+pageIdx, null, null);
			let htmlDOM = parser.parseFromString(res, "text/html");
			let sectionElement = $(htmlDOM).find("#page_buy_history");
			let orderItemList = [];
			let copyRidi = JSON.parse(localStorage.getItem("copyRidi"));
			if(copyRidi.globals.isPc == true) {
				orderItemList = $(sectionElement).find(".buy_history_table tbody tr.js_rui_detail_link");
			}
			else {
				//모바일 결제내역 화면 버전, 미개발상태
				orderItemList = $(sectionElement).find(".buy_list_wrap li.list_item");
			}
			let orderNoList = [];
			let lastPageNum = UTIL.toNumber(sessionStorage.getItem("lastPageNum"));
			let lastPageCnt = UTIL.toNumber(sessionStorage.getItem("lastPageCnt"));
			for(let i=0; i<orderItemList.length; i++) {
				let orderItem = orderItemList[i];
				let orderValue = {};
				if(copyRidi.globals.isPc == true) {
					orderValue = await SYNC_ORDER.parseOrderItemForPc(orderItem);
				}
				else {
					orderValue = await SYNC_ORDER.parseOrderItemForMobile(orderItem);
				}
				//주문 seq
				let curPage = UTIL.toNumber(pageIdx);
				let midPageCnt = 15 * Math.max(0, lastPageNum - curPage -1);
				let orderSeq = (midPageCnt + lastPageCnt + ((lastPageNum!=curPage)?15:0) - i);
				orderValue.order_seq = orderSeq;

				orderNoList.push(orderValue.order_no);
				DB.updateData("store_order", orderValue.order_no, orderValue, "reset");
			}

			return orderNoList;
		}
		catch(e) {
			console.error("parseHistoryListPage 오류:", e);
		}
	},
	/**
	 * Pc 버전 화면 order 헤더 크롤링
	 * @param {dom} orderItem jquery obj
	 */
	parseOrderItemForPc: async function(orderItem) {
		let attr = "data-href";
		let orderValue = {};

		//주문번호
		let orderNo = orderItem.getAttribute(attr);
		orderNo = orderNo.replace(URL.history+"/","");
		orderValue.order_no = orderNo;

		//주문시간
		let tdList = $(orderItem).find("td");
		let orderDttm = tdList[0].innerText;
		orderValue.order_dttm = dayjs(UTIL.toString(UTIL.getNumber(orderDttm)), "YYYYMMDDHHmm").toDate();
//				let dtStr = orderDttm.match(/\d{4}\.\d{2}\.\d{2}/).toString();
//				let tmStr = orderDttm.match(/\d{2}:\d{2}/).toString();
//				orderValue.order_dttm = dayjs(dtStr+" "+tmStr, "YYYY.MM.DD HH:mm").toDate();
//				orderValue.order_dt = dtStr.replaceAll(".","");

		//구매/대여 구분
		let orderType = tdList[1].innerText.trim();
		orderValue.order_type = (orderType.substr(-4) == "(대여)") ? "rent" : "normal";

		//총 결제금액
		let totalAmtStr = $(orderItem).find(".main_value span")[0].innerText;
		let totalAmt = UTIL.getNumber(totalAmtStr);
		orderValue.total_amt = totalAmt;

		return orderValue;
	},
	/**
	 * 모바일 버전 화면 order 헤더 크롤링
	 * @param {dom} orderItem jquery obj
	 */
	parseOrderItemForMobile: async function(orderItem) {
		let orderValue = {};

		//주문번호
		let orderNo = $(orderItem).find("a.detail_link").first().attr("href");
		orderNo = orderNo.replace(URL.history+"/","");
		orderValue.order_no = orderNo;

		//주문시간
		let orderDttm = $(orderItem).find("header").first().text();
		orderValue.order_dttm = dayjs(UTIL.toString(UTIL.getNumber(orderDttm)), "YYYYMMDDHHmm").toDate();

		//구매/대여 구분
		let orderType = $(orderItem).find("title").first().text();
		orderValue.order_type = (orderType.substr(-4) == "(대여)") ? "rent" : "normal";

		//총 결제금액
		let totalAmtStr = $(orderItem).find(".main_value").first().text();
		let totalAmt = UTIL.getNumber(totalAmtStr);
		orderValue.total_amt = totalAmt;

		return orderValue;
	},
	/**
	 * 주문번호 상세 내역 크롤링
	 * @param {number|string} orderNo 결제내역 상세페이지 크롤링할 주문번호
	 */
	parseHistoryDetailPage: async function(orderNo) {
		try {
			if(UTIL.isEmpty(orderNo)) return;
			let res = await UTIL.request(URL.base+URL.history+"/"+orderNo, null, null);
			let htmlDOM = parser.parseFromString(res, "text/html");
			var orderHeaderItem = {};
			let copyRidi = JSON.parse(localStorage.getItem("copyRidi"));
			if(copyRidi.globals.isPc == true) {
				orderHeaderItem = await SYNC_ORDER.parseHistoryItemForPc(htmlDOM);
			}
			else {
				orderHeaderItem = await SYNC_ORDER.parseHistoryItemForMobile(htmlDOM, orderNo);
			}
			DB.updateData("store_order", orderNo, orderHeaderItem, "update");
			return true;
		}
		catch(e) {
			console.error("parseHistoryDetailPage 오류:", e);
		}
	},

	/**
	 * Pc 버전 화면 order 상세 크롤링
	 * @param {dom} htmlDOM jquery obj
	 */
	parseHistoryItemForPc: async function(htmlDOM) {
		let sectionElement = $(htmlDOM).find(".buy_history_detail_table");

		let bookIdList = {};
		//책 목록
		let bookTd = SYNC_ORDER.findNextTdByThTxt(sectionElement, "구분");
		let bookList = $(bookTd).find(".book_title");
		bookList.each(function() {
			//책 ID
			let bookE = $(this).find("a");
			let bookId = bookE.attr("href").replace("/books/","");

			//구매금액
			let priceStr = $(this).find(".price").text();
			let price = UTIL.getNumber(priceStr);

			bookIdList[bookId] = price || 0;
			SYNC_ORDER.ensureBookById(bookId);
		});

		let orderHeaderItem = {book_list: bookIdList};
		//금액관련
		orderHeaderItem.amt_total = SYNC_ORDER.getAmt(sectionElement, "주문 금액");
		orderHeaderItem.amt_discount_cupon = SYNC_ORDER.getAmt(sectionElement, "쿠폰 할인");
		orderHeaderItem.amt_cash = SYNC_ORDER.getAmt(sectionElement, "리디캐시 사용액");
		orderHeaderItem.amt_point = SYNC_ORDER.getAmt(sectionElement, "리디포인트 사용액");
		orderHeaderItem.amt_pg = SYNC_ORDER.getAmt(sectionElement, "PG 결제 금액");
		orderHeaderItem.reward_ridipoint = SYNC_ORDER.getAmt(sectionElement, "적립 리디포인트");

		orderHeaderItem.pay_way = SYNC_ORDER.findNextTdByThTxt(sectionElement, "결제 수단").text();

		return orderHeaderItem;
	},
	/**
	 * 특정 라벨을 가지고 있는 th 다음에 있는 td
	 * @param {dom} bodyE table 있는 dom
	 * @param {string} thTxt th에 있는 라벨
	 * @returns td dom
	 */
	findNextTdByThTxt: function(bodyE, thTxt) {
		return $(bodyE).find("th").filter(function() {return $(this).text().trim() === thTxt;}).next("td");
	},
	/**
	 * 특정 라벨을 가지고 있는 th 기준으로 금액 데이터에서 숫자만 추출
	 * @param {dom} bodyE table 있는 dom
	 * @param {string} thLabel 금액 데이터 있는 th 라벨
	 * @returns number amt
	 */
	getAmt: function(bodyE, thLabel) {
		return UTIL.getNumber(SYNC_ORDER.findNextTdByThTxt(bodyE, thLabel).find("span.museo_sans").text());
	},

	/**
	 * 모바일 버전 화면 order 상세 크롤링
	 * 뿌려주는 데이터 양이 Pc보다 적어서 일단 개발 중지하고 무조건 pc버전으로 크롤링하게 작업
	 * @param {dom} htmlDOM jquery obj
	 */
	parseHistoryItemForMobile: async function(htmlDOM, orderNo) {
		//TO DO book_id별 가격은 영수증까지 가져와야 함
		//2024123090746511
		let sectionElement = $(htmlDOM).find("section.page_buy_history_detail");

		let res = await UTIL.request(URL.base+URL.receipt+"/"+orderNo, null, null);
		let receiptDOM = parser.parseFromString(res, "text/html");

		let bookIdList = {};
		// 책 목록
		let receiptTb = $(receiptDOM).find("#receip div.receip_box table");
		let headerIdx = receiptTb.find("tr.list_header").first().index() + 1;
		let footerIdx = receiptTb.find("tr.list_footer").first().index();
		let bookList = receiptTb.find("tr").slice(headerIdx, footerIdx);

		// let bookTd = SYNC_ORDER.findHistoryValueForMobile(sectionElement, "구분");
		// let bookList = $(bookTd).find(".book_title");
		bookList.each(function() {
			// //책 ID
			// let bookE = $(this).find("td");
			// let bookId = bookE.attr("href").replace("/books/","");

			// //구매금액
			// let priceStr = $(this).find(".price").text();
			// let price = UTIL.getNumber(priceStr);

			// bookIdList[bookId] = price || 0;
			// SYNC_ORDER.ensureBookById(bookId);
		});

		let orderHeaderItem = {book_list: bookIdList};
		//금액관련
		orderHeaderItem.amt_total = SYNC_ORDER.getAmtForMobile(sectionElement, "주문 금액");
		orderHeaderItem.amt_discount_cupon = SYNC_ORDER.getAmtForMobile(sectionElement, "쿠폰 할인");	//없을수 있음
		orderHeaderItem.amt_cash = SYNC_ORDER.getAmtForMobile(sectionElement, "리디캐시 사용액");
		orderHeaderItem.amt_point = SYNC_ORDER.getAmtForMobile(sectionElement, "리디포인트 사용액");
		orderHeaderItem.amt_pg = SYNC_ORDER.getAmtForMobile(sectionElement, "PG 결제 금액");
		orderHeaderItem.reward_ridipoint = SYNC_ORDER.getAmtForMobile(sectionElement, "적립 리디포인트");

		orderHeaderItem.pay_way = SYNC_ORDER.findHistoryValueForMobile(sectionElement, "결제 수단"),next("span").text();

		return orderHeaderItem;
	},
	findHistoryValueForMobile: function(bodyE, titTxt) {
		return $(bodyE).find("span.title").filter(function() {return $(this).first().text().trim() === titTxt;});
	},
	getAmtForMobile: function(bodyE, titLabel) {
		let titE = SYNC_ORDER.findHistoryValueForMobile(bodyE, titLabel);
		if(UTIL.isEmpty(titE)) return null;
		return UTIL.getNumber(titE.next("span").find("span.museo_sans").text());
	}
};
export default SYNC_ORDER;
//async function deleteHistoryListPage(orderNo) {
//	deleteData("store_order", orderNo);
//}
