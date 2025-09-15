import { useState } from "react";

import DB from "@/scripts/connect_db.js";
import SESSION from "@/scripts/session.js";

import SYNC_ORDER from "@/scripts/sync/sync_order.js";
import SYNC_BOOK from "@/scripts/sync/sync_book.js";

function Setting() {
	const [isSync, setIsSync] = useState(false);
	const [ingPage, setIngPage] = useState(null);

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

	async function syncLib() {
		setIsSync(true);
		await SYNC_BOOK.updateLib();
		setIsSync(false);
	}
	async function syncBookAllByUnit() {
		setIsSync(true);
		await SYNC_BOOK.syncBookAllByUnit();
		setIsSync(false);
	}
	return (
		<div>
			<button onClick={DB.initDB}>DB 연결</button>
			<button onClick={SESSION.setRidiGlobalVal}>리디 전역변수 세팅</button>
			<button onClick={SESSION.updatePageInfo}>초기값 세팅</button>
			<hr/>
			<span>{isSync? 'sync '+ingPage : 'end'}</span><br/>
			<div>
				<button onClick={syncOrderAll} disabled={isSync}>결제내역 전체</button>
				<button onClick={syncOrderRecent} disabled={isSync}>결제내역</button>
			</div>
			<hr/>
			<div>
				<span>책 정보 업데이트</span><br/>
				<button onClick={syncLib} disabled={isSync}>서재 목록</button>
				<button onClick={syncBookAllByUnit} disabled={isSync}>표지 기준</button>
			</div>
		</div>
	);
}

export default Setting;
