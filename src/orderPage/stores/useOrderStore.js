import orderData from "../../../sample_data/orderData";
import { create } from "zustand";
import Fuse from "fuse.js";
const useOrderStore = create((set, get) => ({
  orders: orderData,
  filteredOrders: orderData,

  searchParams: {
    startDate: "",
    endDate: "",
    bookName: "",
    minAmount: "",
    maxAmount: "",
    payWay: "",
  },
  setSearchParam: (key, value) =>
    set((state) => ({ searchParams: { ...state.searchParams, [key]: value } })),

  executeSearch: () => {
    const { orders, searchParams } = get();
    const { startDate, endDate, bookName, minAmount, maxAmount, payWay } =
      searchParams;

    let result = orders.filter((order) => {
      if (startDate && order.order_dt < startDate) return false;
      if (endDate && order.order_dt > endDate) return false;
      if (minAmount && order.amt_total < Number(minAmount)) return false;
      if (maxAmount && order.amt_total > Number(maxAmount)) return false;
      if (payWay && order.pay_way !== payWay) return false;
      return true;
    });
    if (bookName) {
      const fuse = new Fuse(result, {
        keys: ["book_list.book_nm"],
        threshold: 0.4,
      });
      result = fuse.search(bookName).map((match) => match.item);
    }
    set({ filteredOrders: result });
  },
  resetSearch: () =>
    set((state) => ({
      searchParams: {
        startDate: "",
        endDate: "",
        bookName: "",
        minAmount: "",
        maxAmount: "",
        payWay: "",
      },
      filteredOrders: state.orders,
    })),
}));
export default useOrderStore;
