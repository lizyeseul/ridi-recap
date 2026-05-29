import ORDER_STYLES from "@/css/orderStyles.js";
import useOrderStore from "@/orderPage/stores/useOrderStore";
function OrderList() {
  const { filteredOrders } = useOrderStore();
  const S = ORDER_STYLES.list;

  return (
    <div className={S.wrapper}>
      <div className={S.header}>
        <h2 className={S.title}>검색 결과</h2>
        <span className={S.countBadge}>총 {filteredOrders.length}건</span>
      </div>

      <table className={S.table}>
        <thead className={S.thead}>
          <tr>
            <th className={S.th}>주문번호</th>
            <th className={S.th}>주문일시</th>
            {/* <th className={S.th}>작품명</th> */}
            <th className={S.th}>결제수단</th>
            <th className={S.th}>총 금액</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((o) => (
              <tr key={o.order_no}>
                <td>{o.order_no}</td>
                <td>{o.order_dttm}</td>
                {/* <td>
                  {o.book_list[0].book_nm}{" "}
                  {o.book_list.length > 1
                    ? `외 ${o.book_list.length - 1}건`
                    : ""}
                </td> */}
                <td>{o.pay_way}</td>
                <td>{o.amt_total.toLocaleString()}원</td>
              </tr>
            ))
          ) : (
            <tr>
              <td>결과 없음</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OrderList;
