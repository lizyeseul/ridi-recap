import ORDER_STYLES from "@/css/orderStyles.js";
import useOrderStore from "@/orderPage/stores/useOrderStore";
function SearchArea() {
  const PAY_WAY_MAP = {
    Card: "신용카드",
    Point: "리디캐시 + 리디포인트",
  };
  const { searchParams, setSearchParam, executeSearch, resetSearch } =
    useOrderStore();
  const S = ORDER_STYLES.search;
  const handelChange = (e) => setSearchParam(e.target.name, e.target.value);
  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch();
  };

  return (
    <div className={S.wrapper}>
      <form onSubmit={handleSearch} className={S.form}>
        <div className={S.grid}>
          {/* 날짜 */}
          <div className={S.fieldGroup} style={{ gridColumn: "span 2" }}>
            <label className={S.label}>주문 날짜</label>
            <div className={S.inputGroup}>
              <input
                type="date"
                name="startDate"
                value={searchParams.startDate}
                onChange={handelChange}
                className={S.input}
              />
              <span>~</span>
              <input
                type="date"
                name="endDate"
                value={searchParams.endDate}
                onChange={handelChange}
                className={S.input}
              />
            </div>
          </div>
          {/* 이름 */}
          <div className={S.fieldGroup}>
            <label className={S.label}>작품명</label>
            <input
              type="text"
              name="bookName"
              value={searchParams.bookName}
              onChange={handelChange}
              className={S.input}
            />
          </div>
          {/* 주문유형 */}
          <div className={S.fieldGroup}>
            <label className={S.label}>주문 유형</label>
            <select
              name="payWay"
              value={searchParams.payWay}
              className={S.select}
            >
              <option value="">전체</option>
              {Object.entries(PAY_WAY_MAP).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          {/* 결제 금액 */}
          <div className={S.fieldGroup} style={{ gridColumn: "span 2" }}>
            <label className={S.label}>결제 금액</label>
            <div className={S.inputGroup}>
              <input
                type="number"
                name="minAmount"
                value={searchParams.minAmount}
                onChange={handelChange}
                className={S.input}
              />
              <span>~</span>
              <input
                type="number"
                name="maxAmount"
                value={searchParams.maxAmount}
                onChange={handelChange}
                className={S.input}
              />
            </div>
          </div>
        </div>
        <div className={S.buttonContainer}>
          <button type="button" onClick={resetSearch} className={S.resetBtn}>
            초기화
          </button>
          <button type="submit" className={S.submitBtn}>
            검색
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchArea;
