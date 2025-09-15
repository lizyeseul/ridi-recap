export default class orderClass {
	//서비스 만드는 게 목적이면 이런거는 나중에 해도 되는데 사실 온전한 서비스 만드려면 어느정도 뼈대를 잡아야 하는데 이런거는 준비과정이 너무 길고 고민도 오래걸리고 뭐가 적절한지 판단할 지식도 없고 아아악
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

	order_no;
	order_dttm;
	order_seq;

	static schema = {
		order_no: "주문번호", //key, index, unique
		order_dt: "(YYYYMMDD) 주문날짜",	//index
		order_seq: "(int) 주문SEQ, 제일 오래된 번호부터 1",	//index, unique

		order_dttm: "(Date) 주문시각, yymmdd HH:mm",
		book_list: [{
			'[book_id]': "(int) book_id: (int) book단위 구매금액"
		}],

		amt_cash: "(int) 리디캐시 사용액",
		amt_point: "(int) 리디포인트 사용액",
		amt_pg: "(int) PG결제금액",
		amt_discount_cupon: "(int) 쿠폰할인금액",
		amt_total: "(int) 총 구매액 = cash+point+pg+discount, 상세기준 추출",
		pay_way: "결제수단",
		reward_ridipoint: "(int) 적립 리디포인트",
		total_amt: "(int) 총 구매액, 목록기준 추출|amt_total 랑 다르면 재앙 시작",

		last_update_dttm: "(Date) 데이터 마지막 업데이트 시각"
	}

	get dataForPurchase() {
		return {
			order_no: this.order_no,
			order_seq: this.order_seq,
			order_dttm: this.order_dttm,
			order_dt: this.order_dt,
			amt_cash: this.amt_cash,
			amt_discount_cupon: this.amt_discount_cupon,
			amt_pg: this.amt_pg,
			amt_point: this.amt_point,
			amt_total: this.amt_total,
			pay_way: this.pay_way,
			reward_ridipoint: this.reward_ridipoint,
			order_type: this.order_type,

			order_last_update_dttm: this.last_update_dttm
		}
	}

	get order_dt() {
		return moment(this.order_dttm).format("YYYYMMDD");
	}

	get jsonObj() {
		return JSON.parse(JSON.stringify(this));
	}

	validate() {
		if(this.total_amt != this.amt_total) {
			return false;
		}
		if(this.total_amt != (this.amt_cash + this.amt_point + this.amt_pg + this.amt_discount_cupon)) {
			return false;
		}
		//if total_amt != book_list value sum, return false
		return true;
	}
}
//function p(c) {
//	const s = c.schema;
//	Object.entries(s).forEach(([f,d]) => {
//		console.log('$(f),$(d)')
//	})
//}
