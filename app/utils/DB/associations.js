const certificateModel = require("../../models/certificate.model");
const userCertificatesModel = require("../../models/userCertificates.model");
const userModel = require("../../models/users.model");


exports.initSQLAssociations = () => {
    try {
        userModel?.belongsToMany(certificateModel,{through:userCertificatesModel,foreignKey:"userId"});
        certificateModel?.belongsToMany(userModel,{through:userCertificatesModel,foreignKey:"certificateId"});
    } catch (error) {
        console.log(error);
    }
}