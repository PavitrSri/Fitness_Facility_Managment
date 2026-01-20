import request from "./ConnectBackend.js";
import Cookies from "js-cookie";

export default Loyalty;

const loyaltyMult = 5;
const daysToNextTier = 365;

const msPerDay = 1000*60*60*24; 
let session = null;
const tick = setInterval(displayLoyalty, 1000);

function Loyalty() {
	return (
		<div  >
			<p id="loyalDisplay">User not logged in</p>
		</div>
	);
}



function calcLoyalty(userAccountCreationDate) {
	const age = (new Date - userAccountCreationDate)/msPerDay;
	return Math.floor(loyaltyMult * (age/daysToNextTier));
}

async function displayLoyalty() {
	const cookie = Cookies.get("token");
	let display = document.getElementById("loyalDisplay");
	if (display != null && cookie !== "" && cookie !== session) {
		session = cookie;
		let user = await request("getUser", [session]);
		if (user !== undefined) {
			console.log(user);
			let email = user.email;
			let discount = calcLoyalty(user.date) + "%";
			if (display != null && email != "") 
				display.innerHTML = `
					<p>

					<b>${email}</b> 
					<br/> 
					<br/>
					Loyalty Discount: ${discount}
					
					</p>`;
		}
	}
}
