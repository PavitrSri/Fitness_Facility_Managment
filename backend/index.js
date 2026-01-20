import { Buffer } from 'buffer';
import express from 'express';
import cors from 'cors';
import DbHandler from './sql.js';

const port = 3001;

const webapp = express();
var dbHandler;

import crypto from 'crypto';
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
	modulusLength: 2048,
	publicKeyEncoding: {
		type: 'spki',
		format: 'pem',
	},
	privateKeyEncoding: {
		type: 'pkcs1',
		format: 'pem',
	},
});


webapp.use(cors());
webapp.use(express.urlencoded({ extended: false }));
webapp.use(express.json());

webapp.post("/api", async (req, res) => {
	let func, parameters;
	let json;
	let httpStatus = 200;
	//Give some spacing between set of api debug output for readability
	console.log("\n\n\n");

	if ('payload' in req.body) {
		console.log(req.body);
		json = JSON.parse(crypto.privateDecrypt({
				key: privateKey,
				padding: crypto.constants.RSA_OAEP_PADDING,
				oaepHash: "SHA-256"
			},
			Buffer.from(req.body.payload, 'base64')
		));
		console.log("Decrypted");
	} else {
		console.log("Taking normally");
		json = req.body;
	}

	console.log("API Call:\t", json);

	func = json.func;
	parameters = json.parameters;

	let response = undefined;
	try {
		response = await dbHandler[func].apply(dbHandler, parameters);
	} catch (error) {
		console.log("DB issue: ", error);
		httpStatus = 500;
		response = false;
	}
	console.log("Response to frontend:\t\n", response);

	if (response !== undefined) res.status(httpStatus).json(response);
});

webapp.get("/getPubKey", (req, res) => {
	res.send(publicKey);
});

webapp.listen(port, async () => {
	dbHandler = new DbHandler();
	console.log(`Server is up and running on port ${port}`);
});



async function shutdown() {
	console.log("Shutting down server");
	await dbHandler.closeDb();

	process.exit(0);
}

process.on('SIGINT', shutdown);

process.on('SIGTERM', shutdown);
