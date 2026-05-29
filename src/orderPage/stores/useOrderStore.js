import orderData from "../../../sample_data/orderData";
import { create } from "zustand";
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

    const result = orders.filter((order) => {
      //TODO 검색
      return true;
    });
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
