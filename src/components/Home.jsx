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
	  <button onClick={() => navigate("/Home")}>Home</button>
	  <button onClick={() => navigate("/Home/Setting")}>Setting</button>
	  <hr />
	  <Routes>
		<Route
		  path="/Home"
		  element={
			<div>
			  <button onClick={() => navigate("/Home/order")}>order</button>
			  <button onClick={() => navigate("/Home/book")}>book</button>
			  <button onClick={() => navigate("/Home/purchase")}>purchase</button>
			</div>
		  }
		/>
		<Route path="/Home/Setting" element={<Setting />} />
		<Route path="/Home/order" element={<Order />} />
		<Route path="/Home/book" element={<Book />} />
		<Route path="/Home/purchase" element={<Purchase />} />
	  </Routes>
	</div>
  );
}

export default Home;
