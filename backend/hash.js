
const bcrypt = require("bcrypt");
//admin@test.com
bcrypt.hash("Admin123!", 10).then(console.log);
