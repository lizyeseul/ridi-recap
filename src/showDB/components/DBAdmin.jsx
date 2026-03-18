import unitData from "../../../sample_data/unitData";
import bookData from "../../../sample_data/bookData";
import orderData from "../../../sample_data/orderData";
import UTIL from "@/scripts/utils.js";

import useDBResultStore from "@/showDB/stores/useDBResultList";

import { useState, useEffect } from "react";

function DBAdmin() {
  const [table, setTable] = useState("unit");

  const selectedIdx = useDBResultStore((state) => state.selectedIdx);

  const [searchKey, setSearchKey] = useState();
  const [searchValue, setSearchValue] = useState();

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

  function handleOnClickSearch() {
    let obj = unitData;
    if (table == "book") obj = bookData;
    let keyword = searchKey;
    //TODO yslee 검색 key+value로 수정

    let rst = searchByKey(obj, keyword);
    if (UTIL.isEmpty(rst)) setCurrentData("empty");
  }

  return (
    <div>
      <select
        onChange={(e) => {
          setTable(e.target.value);
        }}
        value={table}
      >
        <option value="unit">unit</option>
        <option value="order">order</option>
        <option value="book">book</option>
      </select>
      <button onClick={handleOnClickSearch}>조회</button>
      <br />
      <input
        label="key"
        placeholder="key"
        onChange={(e) => {
          setSearchKey(e.target.value);
        }}
        value={searchKey}
      ></input>
      <input
        label="value"
        placeholder="value"
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
        value={searchValue}
      ></input>
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
  // return <div>{JSON.stringify(unitData)}</div>
}
export default DBAdmin;
