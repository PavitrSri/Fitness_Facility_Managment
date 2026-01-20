import { JSEncrypt } from 'jsencrypt';

class InternalServerError extends Error {
	constructor(func) {
		super("Internal fault in backend server");
		this.name = "InternalServerError";
		this.func = func;
	}
}

export default request;
const server = 'http://10.9.218.149:3001';

const rsa = new JSEncrypt();

let pubKey = await getPubKey();
rsa.setPublicKey(pubKey);

async function request(func, parameters) {
	let reply;

	let requestBody = {
		"func": func,
		"parameters": parameters
	};

	try {
		reply = await apiCall(requestBody);
	}
	catch (error) {
	
		if (error instanceof InternalServerError) {
			console.log('Issue with backend request. Likely outdated public key; trying again...');
			pubKey = await getPubKey();
			rsa.setPublicKey(pubKey);
			try {
				reply = await apiCall(requestBody);
			}
			catch (error) {
				if (error instanceof InternalServerError) {
					console.error('Backend failed to process: \'',
						error.func,
						'\' due to an internal error: ',
						error
					);
				} else {
					console.error('Unexpected error: ', error);
				}
			}
		} else {
			console.error('Error making request to backend: ', error);
		}
	}
	console.log("reply", reply)
	return reply;
}

async function apiCall(requestBody) {
	let reply;
	let body;
	if(requestBody.func === "addBooking") {
		body = JSON.stringify(requestBody)	;
	} else {
		body = JSON.stringify({
			"payload": rsa.encryptOAEP(JSON.stringify(requestBody))
		});
	}


	await fetch(server + '/api', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: body

	})
	.then(response => {
		if (response.status === 500)
			throw new InternalServerError(requestBody.func);
		return response.json();
	})
	.then(data => {
		reply = data;
	})
	return reply;
}


export async function getPubKey(rsa) {
	let reply;

	await fetch(server + '/getPubKey', {
		method: 'GET'
	})
	.then(response => {
		reply = response.text();
	})
	.catch(error => {
		console.error('Backend GET request issue:', error);
	});

	return reply;
}
