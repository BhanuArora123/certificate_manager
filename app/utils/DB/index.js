const {Sequelize} = require("sequelize");
const { dbName, dbUserName, dbPassword, dbHost } = require("../../config/db.config");

const getDbInstance = () => {
    try{
        const sequelizeInstance = new Sequelize(dbName,dbUserName,dbPassword,{
            host:dbHost,
            dialect:"mysql"
        });
        return sequelizeInstance;
    }
    catch(error){
        console.log(error);
    }
}
const dbInstance = getDbInstance();

const connectToDB = async () => {
    try {
        await dbInstance.authenticate();
        await dbInstance.sync();
        console.log("Connected to DB!");
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    connectToDB,
    dbInstance
}