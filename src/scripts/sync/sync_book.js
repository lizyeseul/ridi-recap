import DB from "@/scripts/connect_db.js";
import SYNC_ORDER from "@/scripts/sync/sync_order.js";
import UTIL from "@/scripts/utils.js";
import {URL} from "@/scripts/static.js";
//TODO react custom hook 형태로 변경

var SYNC_BOOK = {
	/**
	 * 서재에 있는 작품 목록 업데이트
	 * CHECK 구매를 했고 대여상태인데 서재에 보이지 않는 작품이 있음, sync_order.ensureAllBook 에서 처리를 하긴 했음
	 */
	updateLib: async function() {
		try {
			var unitCnt = sessionStorage.getItem("unitCnt") || "500";
			var res = await UTIL.request(URL.LIBRARY_BASE+"items/main/?offset=0&limit="+unitCnt, null, { isResultJson: true });

			var items = res.items;
			items.forEach(function(unit) {
				unit.unit_id = UTIL.toNumber(unit.unit_id);
				DB.updateData("store_unit", unit.unit_id, unit, "update");
			});
			return true;
		}
		catch(e) {
			console.error("updateLib 오류:", e);
		}
	},
	/**
	 * store_unit에서 unit_id값이 없는 경우 찾아서 store_book 업데이트
	 */
	syncBookAllByUnit: async function() {
		let unitList = await DB.getValueByIdx("store_unit", "unit_id", null);
		await SYNC_BOOK.syncBookByUnitId(unitList.map((u) => UTIL.toString(u.unit_id)));	//TODO end 기준이 네트워크 조회 끝날 때로 되어 있는 듯, db insert까지로 확인 필요
	},
	syncBookRecent: async function() {
		//store_unit select all 해서 가져온 unit_id 기준으로 전체 book목록 update > 1분정도 소요돼서 recent 항목을 따로 안하고 무조건 전체 돌려도 될 듯

		/**
		 * sync order할 떄 is update flag값 넣어놓고 flag Y인 것만 추출해서 해당 unit_id 목록 기준으로만 book 정보 추가
		 */
		/**
		 * 아래 두 정보 비교 후 다르면 조회
		 * 1. URL.LIBRARY_BASE+items/main 으로 조회했을 때 b_id 값
		 * 2. store_unit의 b_id 값
		 * 값이 다른 unit_id들의 리스트 생성 후 syncBookByUnitId(unitIdList)
		 * 1번에만 있는 unit_id도 unitIdList.push
		 * 2번에만 있으면 스킵
		 */
	},
	/**
	 * unit_id 목록 기준으로 store_book 업데이트
	 * @param {array} unitIdList unit_id 목록
	 */
	syncBookByUnitId: async function(unitIdList) {
		try {
			if(UTIL.isEmpty(unitIdList)) return;
			let unitListRes = await UTIL.request(URL.LIBRARY_BASE+"books/units", {unit_ids: unitIdList}, { isResultJson: true });
			const bookTasks = [];
			for(let e of unitListRes.units) {
				let startOffset = 0;
				let limit = 100;
				let totalCnt = e.total_count;
				let unitId = e.id;
				for(let offset=startOffset; offset<totalCnt; offset=offset+limit) {
					bookTasks.push(async () => {
						let booksRes = await UTIL.request(URL.LIBRARY_BASE+"books/units/"+unitId+"/order?offset="+UTIL.toString(offset)+"&limit="+UTIL.toString(limit)+"&order_type=unit_order&order_by=asc", null, { isResultJson: true });
						let items = booksRes.items;
						let bookIds = [...new Set(items.flatMap(obj => UTIL.toString(obj.b_ids)))];
						await SYNC_BOOK.syncBookByBookId(bookIds, UTIL.toNumber(unitId));
					});
				}
			}
			await UTIL.runWithConcurrencyLimit(bookTasks, 20);
			return true;
		}
		catch(e) {
			console.error("syncBookByUnitId 오류:", e);
		}
	},
	/**
	 * book_id 목록 기준으로 book 업데이트
	 * @param {array} bookIdList book_id 목록
	 * @param {number} unitId
	 */
	syncBookByBookId: async function(bookIdList, unitId) {
		var limit = 100;
		for(var offset=0; offset<bookIdList.length; offset=offset+limit) {
			var bookIds = bookIdList.slice(offset, offset + limit);
			var [bookInfosRes, bookPurchaseInfosRes] = await Promise.all([
				UTIL.request(URL.BOOK_API_BASE+"books?b_ids="+bookIds.join(","), null, { isResultJson: true }),
				UTIL.request(URL.LIBRARY_BASE+"items", {b_ids: bookIds}, { isResultJson: true })
			]);

			/**
			 * TODO is_open이 false인 경우, 리디 상세페이지가 redirect될 가능성이 있음
			 * 절판의 경우 redirect가 아니라 404
			 * https://ridibooks.com/books/2378009586
			 * https://ridibooks.com/books/${book_id}
			 * 해당 redirect값이 같은 화의 최신 book_id값임
			 * request cost가 높으니까 recent_book_id 값이 없을 때만 시도
			 * 최초1회에 시도했는데 redirect값도 없는 경우? 삭제? recent_book_id = -1
			 * recent_book_id 값이 store_book에 없는 경우 bookIdList.push하면 마지막에 크롤링되나?
			 */

			var purchaseMap = new Map(bookPurchaseInfosRes.items.map(obj => [UTIL.toNumber(obj.b_id), obj]));
			var mergedList = bookInfosRes.map(item => {
				item.service_type = "none" //미구매표시용으로 insert때만 기본값, 환불생각하면 그냥 기본값?
				var other = purchaseMap.get(UTIL.toNumber(item.id));
				return other ? {...item, ...other} : item;
			});
			mergedList.forEach(async function(bookInfo) {
				let bookUnitId = unitId; //TEST
				let bookId = UTIL.toNumber(bookInfo.id);
				if(UTIL.isEmpty(bookUnitId)) {
					let tempUnitId = bookInfo.display_unit_id || bookInfo.search_unit_id;
					if(UTIL.isNotEmpty(tempUnitId)) {
						bookUnitId = UTIL.toNumber(tempUnitId);
					}
					else if(UTIL.isEmpty(bookInfo.property.review_display_id)) {
						bookUnitId = -1;
					}
					else {
						let displayBookId = UTIL.toNumber(bookInfo.property.review_display_id);
						let displayData = await DB.getUniqueValue("store_book", "book_id", displayBookId) || {};
						await SYNC_ORDER.ensureBookById(displayBookId);
						bookUnitId = UTIL.isEmpty(displayData) ? 0 : UTIL.toNumber(displayData.unit_id) || 0;
					}
				}
				bookInfo.book_id = bookId;
				bookInfo.unit_id = bookUnitId;
				DB.updateData("store_book", bookInfo.book_id, bookInfo, "update");
			});
		}
	},
	/**
	 * 화면에서 선택한 unit_id 목록 기준으로 store_book 업데이트
	 * @param {array} checkedListById unit_id 목록
	 */
	updateBook: async function(checkedListById) {
		try {
			if(UTIL.isEmpty(checkedListById)) return;
			await SYNC_BOOK.syncBookByUnitId(checkedListById.map((u) => UTIL.toString(u)));
		}
		catch(e) {
			console.error("updateBook 오류:", e);
		}
	},
	/**
	 * store_book에서 unit_id = 0인 경우 찾아서 업데이트
	 * review_display_id 같은 정보로 연관 book 정보를 찾아서 그 book의 unit_id를 가져오는 형식
	 * 연관 book의 unit_id 도 0일 수도 있어서 limit값으로 반복문 처리
	 */
	updateBook2: async function() {
		try {
			const limit = 1; //TEST
			await SYNC_ORDER.ensureAllBook();
			let bookIdList = await DB.getValueByIdx("store_book", "book_id", {filter: {unit_id: 0}});;
			for(let i=0; i<limit; i++) {
				await SYNC_ORDER.ensureAllBook();
				await SYNC_BOOK.syncBookByBookId([...new Set(bookIdList.flatMap(obj => UTIL.toString(obj.book_id)))], null);
				bookIdList = await DB.getValueByIdx("store_book", "book_id", {filter: {unit_id: 0}});;
				if(bookIdList.length == 0) {
					break; //TEST
				}
			}
		}
		catch(e) {
			console.error("updateBook2 오류:", e);
		}
	}
};
export default SYNC_BOOK;
