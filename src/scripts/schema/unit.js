export default class unitClass {
	constructor(data) {
		var me = this;
		if(UTIL.isString(data)) {
			data = JSON.parse(data);
		}
		if(!UTIL.isArray(data) && UTIL.isObject(data)) {
			Object.keys(data).forEach(function(key) {
				me[key] = data[key];
			})
		}
		else {
//			console.debug("type err")
		}
	}

	unit_id;

	static schema = {
		unit_id: "(number) unit 식별번호", //key, index, unique

		b_id: "가장 최신화 book_id",
		expire_date: "(Datetime_str) 만료 시각",
		purchase_date: "(Datetime_str) 구매 시각",
		remain_time: "남은 시간 라벨",
		service_type: "normal(구매)|rent(대여), 구매유형",	//대여 만료도 rent

		unit_count: "(number) 현재 구매한 화수",	//삭제된 화가 있을 때 count될지는 모르겠음
		unit_title: "작품명",
		unit_type: "series|book|shelf, 의미는 모름, 1은 뭘까",
		unit_type_int: "(number) 2(series)|3(book)|4(shelf), 의미는 모름",

		last_update_dttm: "(Datetime) 데이터 마지막 업데이트 시각"
	}

	get dataForPurchase() {
		return {
			unit_id: this.unit_id,
			unit_title: this.unit_title,
			unit_count: this.unit_count,	//현재 구매한 화 수
			unit_type: this.unit_type,

			unit_last_update_dttm: this.last_update_dttm
		}
	}

	get jsonObj() {
		return JSON.parse(JSON.stringify(this));
	}

	validate() {
		return true;
	}
}
