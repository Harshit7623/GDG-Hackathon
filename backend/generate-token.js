const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.generateToken = (voterId) => {
    return jwt.sign({ voterId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};
