import UTIL from "@/scripts/utils.js"

import { useState } from "react";

import SYNC_ORDER from "@/scripts/sync/sync_order.js";
import DB from "@/scripts/connect_db.js";

function Order() {
	const [lastPageNum, setLastPageNum] = useState(sessionStorage.getItem("lastPageNum"));
	const [fromPage, setFromPage] = useState(1);
	const [toPage, setToPage] = useState(lastPageNum);
	const [isSync, setIsSync] = useState(false);
	const [ingPage, setIngPage] = useState(null);

	const [orderInfo, setOrderInfo] = useState([]);

	async function syncOrderPart() {
		setIsSync(true);
		var from = UTIL.toNumber(fromPage);
		var to = UTIL.toNumber(toPage);
		if(from > to) {
			var temp = from;
			from = to;
			to = temp;
		}
		if(UTIL.isEmpty(from) || UTIL.isEmpty(to)) {
			alert("from or to 입력 필수");
		}
		await SYNC_ORDER.syncOrder(from, to, setIngPage);
		setIsSync(false);
	}
	async function syncOrderAll() {
		setIsSync(true);
		await SYNC_ORDER.syncOrder(1, sessionStorage.getItem("lastPageNum"), setIngPage);
		setIsSync(false);
	}
	async function syncOrderRecent() {
		setIsSync(true);
		await SYNC_ORDER.syncOrderRecent(setIngPage);
		setIsSync(false);
	}
	async function findRecentOrder() {
		setIsSync(true);
		var tempList = await DB.getValueByIdx("store_order", "order_seq", { direction: "prev", limit: 100 });
		setOrderInfo(tempList);
		setIsSync(false);
	}
	function OrderInfoRow({orderInfo}) {
		return (
			<li>
				{orderInfo.order_no} : {moment(orderInfo.order_dttm).format("YYYYMMDD")}, {orderInfo.total_amt}
			</li>
		)
	}
	return (
		<div>
			<span>{isSync? 'sync '+ingPage : 'end'}</span><br/>
			<div>
				<button onClick={syncOrderAll} disabled={isSync}>결제내역 전체 동기화</button>
				<button onClick={syncOrderRecent} disabled={isSync}>결제내역 업데이트</button>
			</div>
			<hr/>
			<div>
				<span>dev</span><br/>
				<span>lastPageNum: {lastPageNum}</span><br/>
				<input type="number"	name="fromPage"	value={fromPage}	onChange={(e) => setFromPage(e.target.value)}/>
				<input type="number"	name="toPage"	value={toPage}		onChange={(e) => setToPage(e.target.value)}/>
				<button onClick={syncOrderPart} disabled={isSync}>결제내역 일부 동기화</button>
				<button onClick={findRecentOrder} disabled={isSync}>조회(100개)</button>
			</div>
			<hr/>
			<ul>
			{
				orderInfo.map((o) => (
					<OrderInfoRow orderInfo={o}/>
				))
			}
			</ul>
		</div>
	);
}

export default Order;
