import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import DB from "@/scripts/connect_db.js";
import SESSION from "@/scripts/session.js";

import Setting from "./Setting";
import Order from "./Order";
import Book from "./Book";
import Purchase from "./Purchase";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
	DB.initDB();
	SESSION.setRidiGlobalVal();
	SESSION.updatePageInfo();
  }, []);

  return (
	<div>
	  <button onClick={() => navigate("")}>Home</button>
	  <button onClick={() => navigate("Setting")}>Setting</button>
	  <hr />
	  <Routes>
		<Route
		  path="/"
		  element={
			<div>
			  <button onClick={() => navigate("order")}>order</button>
			  <button onClick={() => navigate("book")}>book</button>
			  <button onClick={() => navigate("purchase")}>purchase</button>
			</div>
		  }
		/>
		<Route path="Setting" element={<Setting />} />
		<Route path="order" element={<Order />} />
		<Route path="book" element={<Book />} />
		<Route path="purchase" element={<Purchase />} />
	  </Routes>
	</div>
  );
}

export default Home;
