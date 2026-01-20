//The bcrypt js lib will allow us to easily hash string values
const bcrypt = require('bcryptjs');

const email = prompt("Enter email: ");
const password = prompt("Enter password: ");

//Generate a salt with complexity level 10
const salt = await bcrypt.genSalt(10);
//Hash the password with the salt
const passHash = await bcrypt.hash(password, salt);

//Output result to user, document.write will overwrite contents of the current page
document.write("Email is: " + email + "\nPassword Hash is " + passHash);
