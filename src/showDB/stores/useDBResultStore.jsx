import { create } from "zustand";

const useDBResultStore = create((set) => ({
  selectedIdx: -1,
  setSelectedIdx: (idx) => set({ selectedIdx: idx }),

  showData: {},
  setShowData: (data) => set({ showData: data }),

  resultList: [],
  addResultData: (data) =>
    set((prev) => ({
      resultList: [...prev.resultList, data],
    })),
  removeResultData: (idx) =>
    set((prev) => ({
      resultList: prev.splice(idx),
    })),
}));
export default useDBResultStore;
