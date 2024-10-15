const { INTEGER, STRING, DATE } = require("sequelize");
const { dbInstance } = require("../utils/DB");

const certificateModel = dbInstance?.define("certificates",{
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
    code:{
        type:STRING,
        allowNull:false
    },
    status:{
        type:STRING,
        values:["DRAFT","PUBLISHED"]
    },
    issuer:{
        type:STRING,
        allowNull:false
    },
    overview:{
        type:STRING,
        allowNull:false
    },
    startDate:{
        type:DATE,
        allowNull:false
    },
    duration:{
        type:INTEGER,
        allowNull:false
    }
})

module.exports = certificateModel;