import { HashRouter as Router, Routes, Route } from "react-router-dom";

import InitPage from "./login";
import Home from "./components/Home";

export default function Index() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<InitPage />} />
          <Route path="/Home/*" element={<Home />} />
        </Routes>
      </Router>
    </>
  );
}
