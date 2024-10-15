const express = require("express");
const { createCertificate, editCertificate, getCertificatesList } = require("../controllers/certificate.controller");

const router = express.Router();

router.post("/",createCertificate);

router.put("/",editCertificate);

router.get("/getCerticates",getCertificatesList);

module.exports = router;