import unitData from "../../../sample_data/unitData";
import bookData from "../../../sample_data/bookData";
import orderData from "../../../sample_data/orderData";
import UTIL from "@/scripts/utils.js";

import useDBResultStore from "@/showDB/stores/useDBResultStore";
import useDBSearchParamStore from "@/showDB/stores/useDBSearchParamStore";

import DBSearchForm from "../components/DBSearchForm";

import { useState, useEffect } from "react";

function DBAdmin() {
  // const [table, setTable] = useState("unit");

  const selectedIdx = useDBResultStore((state) => state.selectedIdx);

  const searchKey = useDBSearchParamStore((state) => state.key);
  const searchValue = useDBSearchParamStore((state) => state.value);
  const { setKey: setSearchKey, setValue: setSearchValue } =
    useDBSearchParamStore();

  // const [searchKey, setSearchKey] = useState();
  // const [searchValue, setSearchValue] = useState();

  const [currentData, setCurrentData] = useState({});
  const [resultList, setResultList] = useState([]);
  // const [selectedIdx, setSelectedIdx] = useState(0);

  function searchByKey(obj, keyword) {
    if (typeof obj !== "object" || obj === null) return;

    if (Array.isArray(obj)) {
      const arrResult = obj
        .map((item) => searchByKey(item, keyword))
        .filter((item) => {
          if (typeof item === "object" && item != null) {
            return Object.keys(item).length > 0;
          }
          return false;
        });
      return arrResult;
    }

    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.includes(keyword)) {
        result[key] = value;
      } else if (typeof value === "object" && value !== null) {
        const nestedResult = searchByKey(value, keyword);
        const isEmpty = Array.isArray(nestedResult)
          ? nestedResult.length === 0
          : Object.keys(nestedResult).length === 0;
        if (isEmpty) {
          result[key] = nestedResult;
        }
      }
      return result;
    }
  }

  return (
    <div>
      <DBSearchForm />
      <br />
      <div style={{ maxHeight: "300px" }}>
        {typeof currentData === "object"
          ? JSON.stringify(currentData)
          : currentData}
      </div>
      <div style={{ maxHeight: "300px" }}>
        {resultList && resultList[selectedIdx]}
      </div>
    </div>
  );
}
export default DBAdmin;
