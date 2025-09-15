import UTIL from "@/scripts/utils.js"
import { URL } from "@/scripts/static.js"

import { useEffect, useState } from "react";
import { useNavigate  } from "react-router-dom";

function InitPage() {
	const [isLogin, setIsLogin] = useState(false);
	const [isCheckingLogin, setIsCheckingLogin] = useState(false);
	const navigate = useNavigate();
	async function checkLogin() {
		localStorage.removeItem("copyRidi");
		setIsCheckingLogin(true);
		var res = await UTIL.request(URL.base + URL.auth, null, { isResultJson: true });
		var auth = res.auth || {};
		setIsCheckingLogin(false);
		setIsLogin(auth.loggedUser != null);
	}
	useEffect(() => {
		checkLogin();
	}, []);
	useEffect(() => {
		if(isLogin) {
			navigate("/Home/Setting");
		}
	}, [isLogin]);
	return (
		<div>
			<h2>{isCheckingLogin ? 'checking...' : 'end check'}</h2>
			<button onClick={checkLogin}>
				재시도
			</button>
		</div>
	);
}

export default InitPage;
