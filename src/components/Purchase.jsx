import UTIL from "@/scripts/utils.js"

import { useState } from "react";

import DB from "@/scripts/connect_db.js";
import SYNC_PURCHASE from "@/scripts/sync/sync_purchase.js";

function Purchase() {
	const [tempData, setTempData] = useState();

	const [selectedStore, setSelectedStore] = useState();
	const [searchKey, setSearchKey] = useState();
	const [searchValue, setSearchValue] = useState();
	const [searchLimit, setSearchLimit] = useState();
	async function findData() {
		var r;
		if(UTIL.isNotEmpty(searchValue)) {
			r = await DB.getUniqueValue("store_"+selectedStore, searchKey, searchValue);
		}
		else {
			r = await DB.getValueByIdx("store_"+selectedStore, searchKey, { limit: searchLimit });
		}
		setTempData(JSON.stringify(r));
	}
	async function syncPurchase() {
		SYNC_PURCHASE.syncPurchase();
	}
	return (
		<div>
			<div>
				<button onClick={findData}>데이터 조회</button>
				<button onClick={() => {setTempData()}}>데이터 초기화</button>
				<br/>
				<select name="store" onChange={(e) => {setSelectedStore(e.target.value)}}>
					<option value="order">order</option>
					<option value="unit">unit</option>
					<option value="book">book</option>
				</select>
				<input	type="text"	name="storeKey"
						placeholder="key"
						onChange={(e) => setSearchKey(e.target.value)}/>
				<input	type="text"	name="storeSearchValue"
						placeholder="value"
						onChange={(e) => setSearchValue(e.target.value)}/>
				<input	type="number"	name="storeLimit"
						placeholder="limit"
						onChange={(e) => setSearchLimit(e.target.value)}/>
			</div>
			<hr/>
			{tempData}
			{UTIL.isNotEmpty(tempData) ? <hr/> : null}
			<div>
				<button onClick={syncPurchase}>데이터 동기화</button>
			</div>
		</div>
	);
}

export default Purchase;
