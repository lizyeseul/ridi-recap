import ORDER_STYLES from "@/css/orderStyles.js";
import useOrderStore from "@/orderPage/stores/useOrderStore";
function SearchArea() {
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
      SearchArea
      <form onSubmit={handleSearch} className={S.form}>
        <div className={S.grid}>
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
        </div>
      </form>
    </div>
  );
}

export default SearchArea;
