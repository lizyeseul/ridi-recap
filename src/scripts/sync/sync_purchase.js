import DB from "@/scripts/connect_db.js";
import purchaseClass from "@/scripts/schema/purchase.js";

var SYNC_PURCHASE = {
	syncPurchase: async function() {
//		let orderList = await DB.getValueByIdx("store_order", "order_no", null);
		let orderList = await DB.getUniqueValue("store_order", "order_no", "2024121965524800");
		orderList = [orderList];
		for(let orderData of orderList) {
			let bookList = orderData.book_list;
			for(let bookId of Object.keys(bookList)) {
				let bookData = await DB.getUniqueValue("store_book", "book_id", bookId);
				let unitData = await DB.getUniqueValue("store_unit", "unit_id", bookData.unit_id);

				let purchaseItem = new purchaseClass();
				purchaseItem.setRawClass(orderData, unitData, bookData);
				// console.log(purchaseItem);
				console.log({...purchaseItem.order.dataForPurchase, ...purchaseItem.unit.dataForPurchase, ...purchaseItem.book.dataForPurchase});
			}
		}
	}
};
export default SYNC_PURCHASE;
