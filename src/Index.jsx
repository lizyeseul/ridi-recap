import { HashRouter as Router, Routes, Route } from "react-router-dom";

import InitPage from "./login";
import Home from "./components/Home";
import DBAdmin from "./showDB/components/DBAdmin";
import OrderMain from "./orderPage/components/orderMain";

export default function Index() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<OrderMain />} />
          {/* <Route path="/" element={<DBAdmin />} /> */}
          {/* <Route path="/" element={<InitPage />} />
          <Route path="/Home/*" element={<Home />} /> */}
        </Routes>
      </Router>
    </>
  );
}
