const { Sequelize, DataTypes } = require("sequelize");
const userModel = require("../models/user");

//Checks if email exists in database
async function checkEmail(enteredEmail) {
  const email = await userModel.User.findAll({
    where: {
      email: enteredEmail,
    },
    attributes: ["email"],
  });

  if (email[0]) return true;
  else return false;
}

//Checks if password is valid (at least 8 characters)
function checkPassword(password) {
  if (password.length < 8) return false;
  else return true;
}

//Gets password by email
async function getPassword(email) {
  const query = await userModel.User.findAll({
    where: {
      email: email,
    },
    attributes: ["password"],
  });
  return query[0].dataValues.password;
}

module.exports = {
  checkEmail,
  checkPassword,
  getPassword,
};
