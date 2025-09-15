import orderClass from "./order.js";
import unitClass from "./unit.js";
import bookClass from "./book.js";

export default class purchaseClass {
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
	
	unit;
	order;
	book;
	
	order_no;
	order_dt;
	unit_id;
	book_id;
	is_completed;
	service_type;
	
	static schema = {
	}
	
	setOrderClass(a) {
		this.order = new orderClass(a);
	}
	setUnitClass(a) {
		this.unit = new unitClass(a);
	}
	setBookClass(a) {
		this.book = new bookClass(a);
	}
	
	setRawClass(o,u,b) {
		this.setOrderClass(o);
		this.setUnitClass(u);
		this.setBookClass(b);
	}
	
	jsonObj() {
		return JSON.parse(JSON.stringify(this));
	}
	
	validate() {
		return true;
	}
}