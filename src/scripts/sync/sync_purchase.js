import DB from "@/scripts/connect_db.js";
import purchaseClass from "@/scripts/schema/purchase.js";
import UTIL from "@/scripts/utils.js";

var SYNC_PURCHASE = {
	syncPurchase: async function() {
//		let orderList = await DB.getValueByIdx("store_order", "order_no", null);
		let orderList = await DB.getUniqueValue("store_order", "order_no", "2024121965524800");
		/*
		111043064 리셋레 세트
		1508004622 세트에 연결된 book 2권?
		2822000211 2권 구판
		3885003834 2권 신판
		*/
		orderList = [orderList];
		for(let orderData of orderList) {
			if(orderData == null) continue;
			let bookList = orderData.book_list;
			for(let bookId of Object.keys(bookList)) {
				// if(bookId != 111043064) continue;
				let bookData = await DB.getUniqueValue("store_book", "book_id", UTIL.toNumber(bookId));
				let unitData = await DB.getUniqueValue("store_unit", "unit_id", UTIL.toNumber(bookData.unit_id));

				let purchaseItem = new purchaseClass();
				purchaseItem.setRawClass(orderData, unitData, bookData);
				console.log({...purchaseItem.order.dataForPurchase, ...purchaseItem.unit.dataForPurchase, ...purchaseItem.book.dataForPurchase});
			}
		}
	}
};
export default SYNC_PURCHASE;
