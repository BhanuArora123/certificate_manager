require("dotenv").config("../../.env");

module.exports = {
    dbName:process.env.DB_NAME,
    dbUserName:process.env.DB_USERNAME,
    dbPassword:process.env.DB_PASSWORD,
    dbHost:process.env.DB_HOST
}