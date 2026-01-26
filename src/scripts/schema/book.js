import getCtgrNm from "./category.js";
import UTIL from "@/scripts/utils.js";

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
			author_str: this.g_authors,
			author_short: this.g_author_short,

			categories: this.categories,
			category_label: this.g_category_label,

			title: this.title,
			title_full: this.g_title,
			title_sub: this.g_sub_title,

			thumbnail: this.thumbnail,

			file: this.file,
			file_size: this.file.size,
			count_character: this.file.character_count,
			count_page: this.file.page_count,

			price_info: this.price_info,

			property: this.property,
			is_adult_only: this.property.is_adult_only,
			is_open: this.property.is_open,

			publish: this.publish,
			publisher: this.publisher,
			publisher_name: this.publisher.name,

			service_type: this.service_type,

			//아래는 미구매시 없을 수 있음
			display_order: this.display_order,
			display_title: this.display_title,
			display_unit_id: this.display_unit_id,
			purchase_date: this.purchase_date,
			expire_date: this.expire_date,
			is_deleted: this.is_deleted,
			remain_time: this.remain_time,

			book_last_update_dttm: this.last_update_dttm
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
		return this.authors[0].name + ((this.authors.length == 1) ? "" : (" 외 "+(this.authors.length-1)+"명"));
	}

	/**
	 * 카테고리1 > 카테고리2
	 */
	get g_category_label() {
		let label = getCtgrNm(this.categories[0].id);
		for(let c of this.categories[0].ancestor_ids) {
			if(c != 0) {
				label = getCtgrNm(c)+" > "+label;
			}
		}
		return label;
	}

	/**
	 * title 기준 전체
	 */
	get g_title() {
		let t = this.title || {};
		return (t.prefix ? t.prefix+" " : "")
			+ t.main
			+ (t.sub ? " - "+t.sub : "");
	}

	/**
	 * nn화, nn권(명확한 규칙은 없음)
	 */
	get g_sub_title() {
		let tit = this.title.main;
		if(tit.includes("세트")) return "세트";
		if(tit.includes("외전")) {
			let matches = tit.match(/외전\s*(\d+부 *)*\d+[권화]+/g);
			if(UTIL.isNotEmpty(matches)) {
				return matches[0];
			}
		}
		else {
			let matches = tit.match(/(\d+부 *)*\d+[권화]/g);
			if(UTIL.isNotEmpty(matches)) {
				return matches[0];
			}
		}

		// if(UTIL.isEmpty(this.series)) return this.title.sub;
		// return this.title.main
		// 		.replace(this.series.property.title,"")
		// 		.replace("[체험판]","")
		// 		.replace("(완결)","")
		// 		.trim();
	}

	// get is_expired() {
	// 	return (this.service_type === "rent" || this.service_type === "normal");
	// }

	static schema = {
		book_id: "book 식별번호", //key, index, unique
		unit_id: "unit 식별번호", //index

		id: "book_id string",

		service_type: "none(미구매)|rent(대여)|normal(구매)", //index

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

		thumbnail: {
			//아래 3개 고정
			"large": "url",
			"small": "url",
			"xxlarge": "url"
		},

		file: {
			format: "null|epub|webtoon|bom",
			character_count: "(int) 글자수, epub일때만 있음",
			page_count: "(int) 페이지수, webtoon or bom 일때 있음",
			is_comic: "(boolean) webtoon or bom",
			is_comic_hd: "(boolean)",
			is_drm_free: "(boolean)",
			is_manga: "(boolean) bom외에는 true없음, bom에도 false 있음",
			is_webtoon: "(boolean) webtoon",
			variants: [
				{
					quality: "recommended|original, original은 옵션",
					size: "(int)"
				}
			]
		},

		price_info: {
			//7099879 하얀늑대들외전 unit_id 내서재에는 있지만 작품화면에서는 미구매로 뜸
			paper: {price:"(int) paper가 뭔지 모르겠음"},
			buy: {price:"(int)현재가", regular_price: "(int) 정가", discount_percentage:"(int) 0~100"},
			rent: {price:"(int)현재가", regular_price: "(int) 정가", discount_percentage:"(int) 0~100", rent_days: "(int) 대여일수"}
		},

		property: {
			is_adult_only: "(boolean) 성인 여부",
			is_magazine: "(boolean) ",
			is_new_book: "(boolean) ",
			is_novel: "(boolean) ",
			is_open: "(boolean) 공개 여부 / 최신본 여부?",
			is_somedeal: "(boolean) true 데이터 못 찾음",
			is_trial: "(boolean) 체험판",
			is_wait_free: "(boolean) 기다무",
			use_free_serial_schedule: "(boolean) true 데이터 못 찾음",
			review_display_id: "대표 book_id, 키 없을 수 있음",
			preview_rate: "(int) 5|10|100 뭔지 모르겠음",
			//preview_max_characters랑 preview_max_pages 같이 있는 경우 없음
			preview_max_characters: "(int) 키 없을 수 있음",
			preview_max_pages: "(int) 키 없을 수 있음",
		},

		publish: {
			ridibooks_publish: "YYYY-MM-DDTHH:mm:ss+09:00 not null",
			ridibooks_register: "YYYY-MM-DDTHH:mm:ss+09:00 not null",
			ebook_publish: "YYYY-MM-DDTHH:mm:ss+09:00",
			paper_book_publish: "YYYY-MM-DDTHH:mm:ss+09:00"
		},

		publisher: {
			//아래 3개 고정
			id: "(int)",
			name: "출판사 명",
			cp_name: "company name"
		},

		support: {},

		//^not null
		// ---------
		// 최신본이라서 구매정보가 있는 경우 아래 항목 있음

		b_id: "",
		display_order: "",
		display_title: "",
		display_type: "",
		display_unit_id: "",
		expire_date: "(Date_str) 대여만료날짜",
		hidden: "",
		is_deleted: "(boolean)",
		//리다무 > 구매로 두 번 구매한 book의 경우 제일 최근에 구매한 시각이 찍힘
		purchase_date: "(Date_str) 최근 구매날짜",
		remain_time: "만료까지 남은 시간 txt",
		search_order: "",
		search_title: "",
		search_type: "",
		search_unit_id: "",
		// ---------
		// 유형1 - 위 정보 말고 없음
		// 유형2 - 세트
		setbook: {
			member_books_count: "(int) 주로 맠다 세트일거같은데 판매중인 세트일때 구매정보가 있을지 모르겠음"
		},
		// 유형3 - 시리즈
		series: {
			//display_type book 없음, series 있음, shelf 있을수도없을수도
			id: "not null, 시리즈 첫번째 book_id",
			volume: "not null, 몇번째",
			property: {//not null
				is_comic_hd: "(boolean) ",
				is_completed: "(boolean) ",
				is_serial: "(boolean) ",
				is_serial_complete: "(boolean) ",
				is_wait_free: "(boolean) ",
				last_volume_id: "등록된? 최신화 book_id",
				opened_book_count: "(int) ",
				opened_last_volume_id: "공개된 최신화 book_id",
				title: "시리즈 타이틀",
				total_book_count: "(int) 같은 unit_id가진 book_id 수?",
				unit: "화|권, 그 외에 있을진 모르겠음",
				prev_books: {	//nullable
					book_id_key: {b_id:"", is_opened: "(boolean)", use_free_serial_schedule: "(boolean)"}
				},
				next_books: {	//nullable
					book_id_key: {b_id:"", is_opened: "(boolean)", use_free_serial_schedule: "(boolean)"}
				}
			},
			price_info: {//nullable
				//시리즈 전체 기준 가격
				buy: {discount_percentage:"(int)",free_book_count:"(int)",price:"(int)",regular_price:"(int)",total_book_count:"(int)"},
				rent: {discount_percentage:"(int)",free_book_count:"(int)",regular_price:"(int)",rent_days:"(int)",rent_price:"(int)rent_total_price",total_book_count:"(int)"}
			}
		},
		serial_thumbnail:{
			//item.series.property.is_serial true일때 있을수도 없을수도
			//아래 3개 고정
			"large": "url",
			"small": "url",
			"xxlarge": "url"
		},


		last_update_dttm: "(Date) 데이터 마지막 업데이트 시각"
	}
	get jsonObj() {
		return JSON.parse(JSON.stringify(this));
	}

	validate() {
		return true;
	}
}
