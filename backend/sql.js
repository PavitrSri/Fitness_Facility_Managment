import sqlite3 from 'sqlite3'
import {open} from 'sqlite'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

export default class DbHandler {

	constructor() {
		this.db = null;
		this.#init();
	}

	//Sqlite statements require a callback function for error handling
	#throwError(error) {
		throw new Error(error);
	}

	async #init() {
		this.db = await open ({
			filename: '.spot.db',
			driver: sqlite3.Database
		});

		await this.db.exec('PRAGMA foreign_keys = ON;');

		//Make a session table
		await this.db.exec(`
			CREATE TABLE IF NOT EXISTS Jobs (
				jobID INTEGER PRIMARY KEY AUTOINCREMENT,
				title text
			);

			CREATE TABLE IF NOT EXISTS People (
				personID INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				email TEXT NOT NULL UNIQUE
			);
			CREATE TABLE IF NOT EXISTS Users (
				personID INTEGER PRIMARY KEY,
				date DATE NOT NULL,
				passwordHash TEXT NOT NULL,
				isAdmin BOOLEAN NOT NULL,
				FOREIGN KEY (personID)
					REFERENCES People(personID)
			);
			CREATE TABLE IF NOT EXISTS Staff (
				personID INTEGER PRIMARY KEY,
				jobID INTEGER NOT NULL,
				description TEXT,
				FOREIGN KEY (personID)
					REFERENCES People(personID),
				FOREIGN KEY (jobID)
					REFERENCES Jobs(jobID)
			);

			CREATE TABLE IF NOT EXISTS Services (
				serviceID INTEGER PRIMARY KEY AUTOINCREMENT,
				description TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS Memberships (
				membershipID INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS MembershipListings (
				membershipListID INTEGER PRIMARY KEY AUTOINCREMENT,
				membershipID INTEGER NOT NULL,
				userID INTEGER NOT NULL,
				FOREIGN KEY (membershipID)
					REFERENCES Memberships(membershipID),
				FOREIGN KEY (userID)
					REFERENCES Users(personID)
			);
			CREATE TABLE IF NOT EXISTS ServiceListings (
				serviceListID INTEGER PRIMARY KEY AUTOINCREMENT,
				membershipID INTEGER NOT NULL,
				serviceID INTEGER NOT NULL,
				FOREIGN KEY (membershipID)
					REFERENCES Memberships(membershipID),
				FOREIGN KEY (serviceID)
					REFERENCES Services(serviceID)
			);

			CREATE TABLE IF NOT EXISTS JobServices (
				jobServiceID INTEGER PRIMARY KEY AUTOINCREMENT,
				jobID INTEGER NOT NULL,
				serviceID INTEGER NOT NULL,
				FOREIGN KEY (jobID)
					REFERENCES Jobs(jobID),
				FOREIGN KEY (serviceID)
					REFERENCES Services(serviceID)
			);


			CREATE TABLE IF NOT EXISTS Equipment (
				equipmentID INTEGER PRIMARY KEY AUTOINCREMENT,
				description TEXT NOT NULL
			);

			CREATE TABLE IF NOT EXISTS Bookings (
				bookingID INTEGER PRIMARY KEY AUTOINCREMENT,
				userID INTEGER NOT NULL,
				equipmentID INTEGER,
				staffID INTEGER,
				serviceID INTEGER,
				date DATE,
				notes TEXT,
				status BOOLEAN,
				FOREIGN KEY (userID)
					REFERENCES People(personID),
				FOREIGN KEY (equipmentID)
					REFERENCES Equipment(equipmentID),
				FOREIGN KEY (staffID)
					REFERENCES Staff(personID),
				FOREIGN KEY (serviceID)
					REFERENCES Services(serviceID)
			);

			CREATE TABLE IF NOT EXISTS Sessions (
				token TEXT PRIMARY KEY,
				personID INTEGER NOT NULL,
				FOREIGN KEY (personID)
					REFERENCES People(personID)
			);

			CREATE TABLE IF NOT EXISTS Reviews (
				reviewID INTEGER PRIMARY KEY AUTOINCREMENT,
				personID INTEGER NOT NULL,
				rating INTEGER NOT NULL,
				date DATE NOT NULL,
				content TEXT,
				FOREIGN KEY (personID)
					REFERENCES People(personID)
			);
			`
		);
	}

	async closeDb() {
		//destroy session table before close
		this.db.run('DROP TABLE IF EXISTS Sessions;');
		await this.db.close();
	}

	async #addPerson(name, email) {
		return (
			await this.db.run(
				'INSERT INTO People (name, email) VALUES (?, ?);',
				[
					name,
					email
				],
				(error) => this.#throwError(error)
				)
			)
			.lastID;
	}
	async #getUserPersonId(token) {
		let personID = undefined;
		const person = await this.db.get(`
				SELECT Users.personID 
				FROM Users JOIN Sessions
				ON Users.personID = Sessions.personID
				WHERE token = ?`,
				token
		);
		if (person !== undefined) {
			personID = person.personID;
		}
		return personID;
	}

	//Admin features


	async isAdmin(token) {
		const isAdmin = await this.db.get(`
			SELECT 1 
			FROM Sessions JOIN Users 
			ON Sessions.personID = Users.personID
			WHERE isAdmin = true AND token = ?;`,
			token
		);
		return (isAdmin !== undefined);
	}
	async setAdmin(user) {
		this.db.run('UPDATE User SET isAdmin = TRUE where PersonID = ?', user.personID);
	}
	async getAllUsers(token) {
		let allUsers = undefined;
		if(await this.isAdmin(token)) {
			allUsers = await this.db.all(`
				SELECT name,email
				FROM People JOIN Users
				ON People.personID = Users.personID;`
			);
		}
		return allUsers;
	}
	async removeUser(email, token) {
		let result = false;

		if (await this.isAdmin(token) && email !== 'admin@spot.com') {
			const person = await this.db.get(`
				SELECT personID 
				FROM People 
				WHERE email = ?`,
				email
			);
			if (person !== undefined) {
				const personID = person.personID;
				//Only delete the reference in the users table
				this.db.run('DELETE FROM Users WHERE personID = ?;', personID);
				this.db.run('UPDATE Bookings SET status=false WHERE userID = ?;', personID);

				//Delete all references to the user
				/*
				await this.db.run('DELETE FROM Users WHERE personID = ?;', personID);
				await this.db.run('DELETE FROM MembershipListings WHERE personID = ?', personID);
				await this.db.run('DELETE FROM Sessions WHERE personID = ?', personID);
				await this.db.run('DELETE FROM Reviews WHERE personID = ?', personID);
				//this.db.run('DELETE FROM People WHERE personID = ?;', personID);
				*/
				result = true;
			}
		}

		return result;
	}


	//User Features


	async userExists(email) {
		let userExists = false;
		userExists = (undefined !==
			await this.db.get(`SELECT 1 FROM People WHERE email = ?`, email)
		);
		return userExists;
	}
	async getUser(token) {
		return this.db.get(`SELECT name,email,date,isAdmin FROM 
			People JOIN Sessions 
			ON People.personID = Sessions.personID 
			JOIN Users ON People.personID = Users.personID
			WHERE token = ?;`,
			token
		);
	}
	async login(email, password) {
		let isMatch = false;
		let token = null;

		const person = await this.db.get('SELECT personID FROM People WHERE email = ?;',
			email
		);
		if (person !== undefined) {
			const user = await this.db.get('SELECT passwordHash FROM Users WHERE personID = ?;',
				person.personID
			);
			isMatch = (user !== undefined
				&& await bcrypt.compare(password, user.passwordHash));

			if (isMatch) {
				token = crypto.randomBytes(32).toString('hex');
				this.db.run(`INSERT INTO Sessions (token, personID)
						VALUES (?, ?);`,
					[
						token,
						person.personID
					],
					(error) => this.#throwError(error)
				);
			}
		}

		return { "token": token };
	}
	async addUser(name, email, password) {

		let userAdded = false;

		//Generate a salt with complexity level 10
		let salt = await bcrypt.genSalt(10);
		//Hash the password with the salt
		let passwordHash = await bcrypt.hash(password, salt);

		const personID = await this.#addPerson(name, email);
		const date = new Date();
		try {
			this.db.run('INSERT INTO Users (personID, date, passwordHash, isAdmin) VALUES (?, ?, ?, ?);',
				[
					personID,
					date,
					passwordHash, 
					false,
				],
				(error) => this.#throwError(error)
			);
			userAdded=true;
		} catch (error) {
			console.error("User could not be added: ", error);
		}

		return userAdded;
	}



	//Staff-Equipment features


	async getStaff() {
		return await this.db.all(`
			SELECT * 
			FROM Staff JOIN People
			ON Staff.personID = People.personID
			JOIN Jobs
			ON Staff.jobID = Jobs.jobID;
			`
		);
	}
	async addStaff(name, email, jobID, description) {
		const personID = await this.#addPerson(this.db, name, email);
		this.db.run('INSERT INTO Staff (personID, jobID, description) VALUES (?, ?, ?);',
			personID, jobID, description
		);
	}


	async addEquipment(description) {
		this.db.run('INSERT INTO Equipment (description) VALUES (?);',
			description
		);

	}

	async getEquipment() {
		return this.db.all(`SELECT * FROM Equipment`);
	}


	//Membership features


	//Remove join to ServiceTimes
	async getServices() {
		return this.db.all(`
			SELECT serviceID,description
				FROM Services;`
				//FULL OUTER JOIN ServiceTimes on Services.serviceID = ServiceTimes.serviceID
			);
	}
	async getMembershipServices(membershipID) {
		return this.db.all(`
			SELECT description,avaliableTime 
				FROM Services JOIN ServiceListings 
				ON Services.serviceID = ServiceListings.serviceID
				JOIN Memberships
				ON ServiceListings.membershipID = Memberships.membershipID
				WHERE membershipID = ?;`,
			membershipID
		);
	}
	async getMemberships(token) {
		const userPersonId = await this.#getUserPersonId(token); 
		return await this.db.all(`
			SELECT name 
				FROM Memberships JOIN MembershipListings
				ON Memberships.membershipID = MembershipListings.membershipID
				WHERE userID = ?;`,
			userPersonId
		);
	}

	async addMembership(token) {
		let success = false;
		const membershipId=1
		const userPersonId = await this.#getUserPersonId(token); 

		if (userPersonId !== undefined) {
			this.db.run(`INSERT INTO MembershipListings (membershipID, userID)
				VALUES (?, ?);`, [membershipId, userPersonId], (error) => this.#throwError(error)
			);
			success = true;
		}
		return success;
	}



	//Booking features



	async #getFreeTrainer(serviceId, time) {
		//get all trainers of that service
		const serviceStaff = await this.db.all(`
			SELECT personID
			FROM Staff JOIN Jobs
			ON Staff.jobID = Jobs.jobID
			JOIN JobServices
			ON Jobs.jobID = JobServices.jobID
			WHERE serviceID = ?`,
			serviceId
		);
		//get all trainers of that time and service
		const bookedStaff = await this.db.all(`
			SELECT staffID 
			FROM Bookings
			WHERE serviceID = ? AND date = ?`,
			serviceId,
			time
		);

		//Return first descrepency between the two lists
		let freeStaff = undefined;
		for (let i = 0; i < serviceStaff.length; i++) {
			let found = false;
			for (let j = 0; j < bookedStaff.length; i++) {
				found = (serviceStaff[i].personID === bookedStaff[j].staffID);
				if (found) break;
			}
			if (!found) {
				freeStaff = serviceStaff[i].personID;
				break;
			}
		}

		console.log(freeStaff);
		return freeStaff;
	}
	async getBookedTimes(serviceId, day) {
		let bookedTimes = [];
		//Pull all times from booking table of that service
		const serviceBookings = await this.db.all(`
			SELECT date,staffID
			FROM Bookings
			WHERE serviceID = ? AND DATE(date) = ?`,
			serviceId,
			day
		);
		//Call getFreeTrainer on each time
			//if a trainer is returned, do not count that time
		for (let i = 0; i < serviceBookings.length; i++) {
			if (await this.#getFreeTrainer(serviceId, serviceBookings[i].date) === undefined)
				bookedTimes.push(serviceBookings[i].date);
		}

		//Return all other times in a array
		return bookedTimes;
	}
	async addBooking(token, equipmentId, serviceId, date, notes, status) {
		let success = false;
		let staffId = null;

		//Determine trainer based on who is avaliable
		//Use getFreeTrainer() to do this...
		if (serviceId !== null) {
			staffId = await this.#getFreeTrainer(serviceId, date);
			if (staffId === undefined)
				throw new Error("Error: No avaliable staff member for job!");
		}

		try {
			const userPersonId = await this.#getUserPersonId(token); 
			if (userPersonId !== undefined) {
				this.db.run(`
					INSERT INTO Bookings (
						userID, 
						equipmentID, 
						staffID, 
						serviceID,
						date, 
						notes, 
						status
						)
						VALUES (?, ?, ?, ?, ?, ?, ?);`,
					[
						userPersonId,
						equipmentId,
						(staffId != null)?staffId:null,
						serviceId,
						date,
						notes,
						status
					],
					(error) => this.#throwError(error)
				);
				success = true;
			}
		} catch (error) {
			console.error("Cannot add booking: ", error);
		}
		return success;
	}
	async getBookings(token) {
		const userId = this.#getUserPersonId(token);
		return await this.db.all(`
			SELECT People.name,Equipment.description,Service.description,date,notes,status
			FROM Bookings JOIN Staff
			ON Bookings.staffID = Staff.personID
			JOIN Equipment ON Bookings.equipmentID = Equipment.equipmentID
			JOIN People ON Staff.personID = People.personID
			JOIN Services ON Bookings.serviceID = Services.serviceID
			JOIN Users ON Bookings.userID = Users.personID
			WHERE Bookings.userID = ?`,
			userId
		);
	}

	//Review Features
	
	
	async getReviews() {
		return await this.db.all(`SELECT 
			name, rating, content, date
			FROM Reviews JOIN People 
			ON People.personID = Reviews.personID`
		);
			
	}
	async addReview(token, rating, content) {
		let success = false;
		const userId = await this.#getUserPersonId(token);
		const date = new Date();
		if (userId !== undefined) {
			this.db.run(`INSERT INTO Reviews (personID, rating, date, content)
				VALUES (?, ?, ?, ?);`, 
				[
					userId,
					rating,
					date,
					content
				],
				(error) => this.#throwError(error)
			);
			success = true;
		}
		return success;
	}
}
