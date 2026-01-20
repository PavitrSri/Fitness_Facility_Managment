import request from "./ConnectBackend.js";
import { getPubKey } from "./ConnectBackend.js";

export default UserManagement;


function UserManagement({ onBack }) {
	return (
		<div>
			<button onClick={onBack}>Back</button>

			<input type="text" id="email_input" />
			<input type="text" id="password_input" />

			<button type="submit" onClick={() => login()}>Login</button>
		</div>
	);
}


async function getUser(email) {
	return request("userExists", [email]);
}




async function register(email, password) {
	const name = "Jim";
	request("addUser", [name, email, password]);
}

async function auth(email, password) {
	let isMatch = false;
	const response = await request("login", [email, password]);

	if (response !== undefined && response.token != null) {
		document.cookie = response.token;
		isMatch = true;
	}

	return isMatch; 
}






async function login() {

	//Prompt user login
	const emailInput = document.getElementById("email_input");
	const passwordInput = document.getElementById("password_input");

	let email = emailInput.value;
	let password = passwordInput.value;

	const user = await getUser(email);

	if (!user) {
		await register(email, password);
		//Test output
		alert("Making user");
		console.log(`User created for ${email}`);
	}
	else {
		let isValid = await auth(email, password);
		//return either access granted or denied
		//Test output
		if (isValid) {
			alert("Logged In");
		}
		else alert ("Access Denied");
	}
}

if (process.env.NODE_ENV === 'test') {
	module.exports.auth = auth;
	module.exports.register = register;
	module.exports.getUser = getUser;
}
