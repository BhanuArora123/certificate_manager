const { INTEGER, STRING, DATE } = require("sequelize");
const { dbInstance } = require("../utils/DB");

const userCertificatesModel = dbInstance?.define("userCertificates",{
    id:{
        type:INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
    },
    userId:{
        type:INTEGER,
        allowNull:false
    },
    certificateId:{
        type:INTEGER,
        allowNull:false
    },
    enrollmentDate:{
        type:DATE,
        allowNull:false
    }
})

module.exports = userCertificatesModel;