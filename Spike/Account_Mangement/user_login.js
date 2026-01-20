const bcrypt = require('bcryptjs');
 
const email = prompt("Enter email: "); // fetched from the user
const password = prompt("Enter password: "); // fetched from the user
 
//assume stored credentials (normally fetched from a database)
const storedEmail = "user@example.com";
const storedHash = "example#Hash";
 
 
if (email != storedEmail) {   // in a database integrated implementation this would
                               // mean the entered email is not in the database.
  document.write("User not found");
} else {
  //Comparing entered password with stored hash
  const isAMatch = await bcrypt.compare(password, storedHash);
 
  if (!isAMatch) {
    //Password incorrect
    document.write("Invalid password");
  } else {
    //Login successful
    document.write("Login successful");
  }
}
