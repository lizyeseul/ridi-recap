import ORDER_STYLES from "@/css/orderStyles.js";
import SearchArea from "./SearchArea";
import OrderList from "./OrderList";
function OrderMain() {
  const S = ORDER_STYLES.layout;
  return (
    <div className={S.container}>
      <header className={S.header}>주문 조회</header>
      <main>
        <SearchArea />
        <OrderList />
      </main>
    </div>
  );
}

export default OrderMain;
