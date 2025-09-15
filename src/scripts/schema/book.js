import getCtgrNm from "./category.js";

export default class bookClass {
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
	book_id;

	get dataForPurchase() {
		return {
			unit_id: this.unit_id,
			book_id: this.book_id,

			author: this.authors,
			authors: this.g_authors,
			author_short: this.g_author_short,

			categories: this.categories,
			categoryLabel: this.g_category_label
		}
	}

	/**
	 * 리스트에 담겨있는 author.name 정보 join ', '
	 */
	get g_authors() {
		function changeAuthorLabel(role) {
			switch(role) {
				case "author":			return "저자"
				case "comic_author":	return "저자"
				case "story_writer":	return "글"
				case "illustrator":		return "그림"
				case "original_author":	return "원작"
				case "editor":			return "편집"
				case "translator":		return "번역"
				default: return "저자"
			}
		}
		return this.authors.map(a => a.name+" "+changeAuthorLabel(a.role)).join(", ");
	}
	/**
	 * 대표 작가 외 n명
	 */
	get g_author_short() {
		return this.authors[0].name + (this.authors.length == 1) ? "" : " 외 "+(this.authors.length-1)+"명";
	}

	get g_category_label() {
		let label = getCtgrNm(this.categories[0].id);
		for(let c of this.categories.ancestor_ids) {
			if(c != 0) {
				label = getCtgrNm(c)+" > "+label;
			}
		}
		return label;
	}

	// get get_file() {
	// 	var f = this.file;
	// 	if(f.format === "webtoon") {
	// 		return {

	// 		}
	// 	}
	// 	return (this.search_type === "book" || this.service_type === "normal");
	// }
	// get is_expired() {
	// 	return (this.service_type === "rent" || this.service_type === "normal");
	// }

	static schema = {
		book_id: "book 식별번호", //key, index, unique
		unit_id: "unit 식별번호", //index

		title: {
			main: "메인 제목, 제목+n권",	//not null
			sub:"부제, ex 내가 어떻게 포기할 수 있을까(1)",
			prefix:"ex [e북]",
		},
		authors: [
			{
				id: "(int) 작가 id",
				name: "작가명",
				role: "author(저자)|comic_author(저자)|original_author(원작)|illustrator(그림)|story_writer(글)|editor(편집)|translator(번역)"
			}
		],


		//리다무 > 구매로 두 번 구매한 book의 경우 제일 최근에 구매한 시각이 찍힘


		last_update_dttm: "(Date) 데이터 마지막 업데이트 시각"
	}
	get jsonObj() {
		return JSON.parse(JSON.stringify(this));
	}

	validate() {
		return true;
	}
}
