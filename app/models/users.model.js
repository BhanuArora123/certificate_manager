const { INTEGER, STRING, DATE } = require("sequelize");
const { dbInstance } = require("../utils/DB");

const userModel = dbInstance?.define("users",{
    id:{
        type:INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
    },
    name:{
        type:STRING,
        allowNull:false
    },
    email:{
        type:STRING,
        allowNull:false
    },
    type:{
        type:STRING,
        allowNull:false,
        values:["Admin","User"]
    }
})

module.exports = userModel;