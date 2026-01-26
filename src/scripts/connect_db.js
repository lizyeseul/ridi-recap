import dayjs from "dayjs";
const DB_INFO = {
	name: "RIDI TEST",
	version: 1
};
var dbConnect;
var DB = {
	initDB: async function() {
		var request = indexedDB.open(DB_INFO.name, DB_INFO.version);
		request.onerror = (e) => { console.log("initDB onerror") };
		request.onsuccess = (e) => { dbConnect = e.target.result; };
		request.onupgradeneeded = (e) => {
			dbConnect = e.target.result;
			var os;
			if(!dbConnect.objectStoreNames.contains("store_order")) {
				os = dbConnect.createObjectStore("store_order", {autoIncrement: false});
				os.createIndex("order_no", "order_no", {unique: true});
				os.createIndex("order_seq", "order_seq", {unique: true});
			}
			if(!dbConnect.objectStoreNames.contains("store_unit")) {
				os = dbConnect.createObjectStore("store_unit", {autoIncrement: false});
				os.createIndex("unit_id", "unit_id", {unique: true});
			}
			if(!dbConnect.objectStoreNames.contains("store_book")) {
				os = dbConnect.createObjectStore("store_book", {autoIncrement: false});
				os.createIndex("book_id", "book_id", {unique: true});
				os.createIndex("unit_id", "unit_id", {unique: false});
			}
			if(!dbConnect.objectStoreNames.contains("store_purchase")) {
				os = dbConnect.createObjectStore("store_purchase", {autoIncrement: true});
				os.createIndex("order_no", "order_no", {unique: false});
				os.createIndex("unit_id", "unit_id", {unique: false});
				os.createIndex("book_id", "book_id", {unique: false});
				os.createIndex("order_dt", "order_dt", {unique: false});
				os.createIndex("is_completed", "is_completed", {unique: false});
				os.createIndex("service_type", "service_type", {unique: false});
			}
			// if(!dbConnect.objectStoreNames.contains("store_lib")) {
			// 	os = dbConnect.createObjectStore("store_lib", {autoIncrement: true});
			// 	os.createIndex("unit_id", "unit_id", {unique: false});
			// 	os.createIndex("is_completed", "is_completed", {unique: false});
			// }
		}
	},
	getObjectStore: function(store_nm, mode) {
		//TODO transaction oncomplete dbConnect.close 추가
		if(!dbConnect) {
			var request = indexedDB.open(DB_INFO.name, DB_INFO.version);
			request.onsuccess = (e) => { dbConnect = e.target.result; };
			console.error("DB 연결이 되어 있지 않습니다.");	//TEST
			// return Promise.reject("DB 연결이 되어 있지 않습니다.");
		}
		return dbConnect.transaction(store_nm, mode).objectStore(store_nm);
	},
	getUniqueValue: function(tbNm, idxNm, idxVal) {
		return new Promise((resolve, reject) => {
			DB.getValueByIdx(tbNm, idxNm, { rangeOption:"only", range: idxVal, limit: 1 })
			.then((results) => {
				resolve(results[0] || null);
			})
			.catch(reject);
		});
	},
	/**
	 * 데이터 조회
	 * @param {string} tbNm store명
	 * @param {string} idxNm key명
	 * @param {object} options
	 *  {
	 * 	keyRange: 검색할 값 x
	 * 	rangeOption: "only" = x, "lowerBound" >= x, "upperBound" <= x
	 * 	limit: 개수
	 * 	direction: "next" asc, "prev" desc, "nextunique" distinct asc, "prevunique" distinct desc
	 * 	filter: object, 일치하는 값만 반환
	 *  }
	 * @returns array
	 */
	getValueByIdx: function(tbNm, idxNm, options) {
		options = options || {};
		var keyRange = options.range || null;
		var rangeOption = options.rangeOption || "only";
		var limit = options.limit || -1;
		var direction = options.direction || "next";
		var filter = options.filter || null;
		var existsFilter = options.existsFilter || null;
		var notExistsFilter = options.notExistsFilter || null;

		return new Promise((resolve, reject) => {
			var store = this.getObjectStore(tbNm,"readonly");
			var index = store.index(idxNm);

			var results = [];
			var queryParam = (keyRange) ? IDBKeyRange[rangeOption](keyRange) : null;
			var cursorReq = index.openCursor(queryParam, direction);
			cursorReq.onsuccess = (e) => {
				var cursor = e.target.result;
				if (cursor) {
					var includeFlag = true;
					if(filter) {
						for (const key in filter) {
							if (cursor.value[key] !== filter[key]) {
								includeFlag = false;
								break;
							}
						}
					}
					if(existsFilter) {
						for (const key in existsFilter) {
							if(!cursor.value.hasOwnProperty(existsFilter[key])) {
								includeFlag = false;
								break;
							}
						}
					}
					if(notExistsFilter) {
						for (const key in notExistsFilter) {
							if(cursor.value.hasOwnProperty(notExistsFilter[key])) {
								includeFlag = false;
								break;
							}
						}
					}
					if (includeFlag) results.push(cursor.value);
					if(limit != -1 && results.length >= limit) {
						resolve(results);
						return;
					}
					cursor.continue();
				}
				else {
					resolve(results);
				}
			};
			cursorReq.onerror = (e) => {console.error("커서 요청 오류-getValueByIdx: "+e.target.error)};
		});
	},
	/**
	 * 개수 count
	 * @param {string} tbNm store명
	 * @param {string} idxNm key명
	 * @param {object} options
	 *  {
	 * 	keyRange: 검색할 값 x
	 * 	rangeOption: "only" = x, "lowerBound" >= x, "upperBound" <= x
	 *  }
	 * @returns number cnt
	 */
	getCountByIdx: function(tbNm, idxNm, options) {
		options = options || {};
		var keyRange = options.range || null;
		var rangeOption = options.rangeOption || "only";

		return new Promise((resolve, reject) => {
			var store = this.getObjectStore(tbNm,"readonly");
			var index = store.index(idxNm);

			var results = [];
			var queryParam = (keyRange) ? IDBKeyRange[rangeOption](keyRange) : null;
			var cursorReq = index.count(queryParam);
			cursorReq.onsuccess = (e) => {
				resolve(cursorReq.result);
			};
			cursorReq.onerror = (e) => {console.error("커서 요청 오류-getCountByIdx: "+e.target.error)};
		});
	},
	// getMaxOnIdx: function(tbNm, idxNm) {
	// 	return new Promise((resolve, reject) => {
	// 		var store = DB.getObjectStore(tbNm,"readonly");
	// 		var index = store.index(idxNm);

	// 		var cursorReq = index.openCursor(null, "prev");
	// 		cursorReq.onsuccess = (e) => {
	// 			var cursor = e.target.result;
	// 			if(cursor) {
	// 				resolve(cursor.value[idxNm]);
	// 			}
	// 			else {
	// 				resolve(null);
	// 			}
	// 		}
	// 		cursorReq.onerror = (e) => {console.error("커서 요청 오류-getMaxOnIdx: "+e.target.error)};
	// 	});
	// },

	/**
	@param mode string 'reset':기존 value 무시하고 data로 set, 'update':기존 value에 data assign
	*/
	updateData: function(tbNm, key, data, mode) {
		return new Promise((resolve, reject) => {
			mode = mode || "reset";
			var store = DB.getObjectStore(tbNm,"readwrite");
			var cursorRequest = store.openCursor(key);
			cursorRequest.onsuccess = function(e) {
				var cursor = e.target.result;
				data.last_update_dttm = dayjs().toDate();
				var req;
				if(cursor) {
					var updateData = data;
					if(mode == "update") {
						var cursorValue = cursor.value;
						updateData = Object.assign(cursorValue, data);
					}
					console.debug("update: ",tbNm,key,updateData);
					req = cursor.update(updateData);
				}
				else {
					console.debug("insert: ",tbNm,key,data);
					req = store.add(data, key);
				}
				req.onsuccess = function(e) {
					resolve(true);
				};
				req.onerror = function(e) {
					console.error("데이터 저장 오류-updateData: "+e.target.error);
					reject(e.target.error);
				};
			}
			store.onerror = (e) => {
				console.error("store 요청 오류-updateData: "+e.target.error);
				reject(e.target.error);
			};
			cursorRequest.onerror = (e) => {
				console.error("커서 요청 오류-updateData: "+e.target.error);
				reject(e.target.error);
			};
		});
	},
	deleteData: function(tbNm, key) {
		var store = DB.getObjectStore(tbNm,"readwrite");
		var cursorRequest = store.openCursor(key);
		cursorRequest.onsuccess = function(e) {
			var cursor = e.target.result;
			if(cursor) {
				console.debug("delete: ",key);
				cursor.delete();
			}
		}
		store.onerror = (e) => {console.error("store 요청 오류-deleteData: "+e.target.error)};
		cursorRequest.onerror = (e) => {console.error("커서 요청 오류-deleteData: "+e.target.error)};
	}
};
export default DB;
