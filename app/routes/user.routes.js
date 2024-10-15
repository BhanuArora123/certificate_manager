const express = require("express");
const { createUser, getAllUsersForCertificate, enrollUser, getUserCertificates } = require("../controllers/users.controller");

const router = express.Router();

router.post("/",createUser);

router.post("/enrollUser",enrollUser);

router.get("/getAllUsersForCertificate",getAllUsersForCertificate);

router.get("/getUserCertificates",getUserCertificates);

module.exports = router;