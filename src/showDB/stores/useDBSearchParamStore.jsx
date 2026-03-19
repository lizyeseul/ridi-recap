import { create } from "zustand";

const useDBSearchParamStore = create((set) => ({
  table: "",
  setTable: (data) => set({ table: data }),
  key: "",
  setKey: (data) => set({ key: data }),
  value: "",
  setValue: (data) => set({ value: data }),

  setForm: (values) =>
    set({
      table: values.table,
      key: values.key,
      value: values.value,
    }),
}));
export default useDBSearchParamStore;
