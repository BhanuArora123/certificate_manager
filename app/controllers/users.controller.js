const { Op, col, where, fn, literal } = require("sequelize");
const certificateModel = require("../models/certificate.model");
const userCertificatesModel = require("../models/userCertificates.model");
const userModel = require("../models/users.model");
const { handleError } = require("../utils/handleError");
const moment = require("moment");


exports.createUser = async (req, res, next) => {
    try {
        const { name, email, type } = req.body;
        const newUser = await userModel?.create({
            name,
            email,
            type
        });
        return res.status(201).json({
            message: "user created successfully!",
            newUser
        })
    } catch (error) {
        handleError(req, res, error);
    }
}

exports.getAllUsersForCertificate = async (req, res, next) => {
    try {
        const { certificateId } = req.query;
        const certificateData = await certificateModel?.findOne({
            where: {
                id: certificateId
            },
            attributes: ["id","status"]
        });
        if (!certificateData) {
            return res.status(404).json({
                message: "certificate doesn't exist"
            })
        }
        if (certificateData?.status.includes("DRAFT", "PUBLISHED")) {
            return res.status(400).json({
                message: "there are no users for DRAFT and PUBLISHED"
            });
        }
        const userForCertificate = await certificateModel?.findOne({
            where: {
                id: certificateId
            },
            include: {
                model: userModel,
                attributes: ["email", "name"]
            }
        })
        return res.status(200).json({
            userForCertificate
        })
    } catch (error) {
        handleError(req, res, error);
    }
}

exports.enrollUser = async (req, res, next) => {
    try {
        const { userId, certificateId } = req.body;
        const certificateData = await certificateModel?.findOne({
            where: {
                id: certificateId
            },
            attributes: ["id","startDate","duration","status"]
        });
        const currentDate = moment().utc().toDate();
        const endDate = moment(certificateData?.startDate).add(certificateData?.duration,"month").utc().toDate();
        const isCertificateActive = (moment(certificateData?.startDate).utc().toDate() <= currentDate && endDate > currentDate);
        console.log(endDate,currentDate,certificateData?.startDate,isCertificateActive);
        if (certificateData?.status !== "PUBLISHED" || !isCertificateActive) {
            return res.status(400).json({
                message: "only active certificates can be enrolled!"
            })
        }
        const existingEnrollment = await userCertificatesModel?.findOne({
            where: {
                userId: userId,
                certificateId: certificateId
            }
        });
        if (existingEnrollment) {
            return res.status(409).json({
                message: "you are already enrolled!"
            })
        }
        const newEnrollment = await userCertificatesModel?.create({
            userId,
            certificateId,
            enrollmentDate: moment().toDate()
        });
        return res.status(200).json({
            message: "user enrolled in this certificate",
            newEnrollment
        })
    } catch (error) {
        handleError(req, res, error);
    }
}

exports.getUserCertificates = async (req, res, next) => {
    try {
        const { userId, orderBy, orderSequence, startDate, endDate } = req.query;
        const currentDate = moment().toDate();
        const userData = await userModel?.findOne({
            where: {
                id: userId
            },
            attributes: ["id"]
        });
        if (!userData) {
            return res.status(404).json({
                message: "user doesn't exist"
            })
        }
        let query = {};
        if (startDate && endDate) {
            const startDateTime = moment(startDate).toDate();
            const endDateTime = moment(endDate).subtract(1,"second").toDate();
            query = {
                where: {
                    ...query.where,
                    [Op.or]: [
                        {
                            startDate: {
                                [Op.between]: [startDateTime, endDateTime]
                            }
                        },
                        where(fn("DATE_ADD",col("startDate"),literal("INTERVAL duration MONTH")),{
                            [Op.between]: [startDateTime, endDateTime]
                        }),
                        {
                            [Op.and]: [
                                {
                                    startDate: {
                                        [Op.lt]: startDateTime
                                    }
                                },
                                where(fn("DATE_ADD",col("startDate"),literal("INTERVAL duration MONTH")),{
                                    [Op.gt]:currentDate
                                })
                            ]
                        }
                    ]
                }
            };
        }
        if (orderBy) {
            query["order"] = [];
            const orderType = (orderSequence === 1) ? "ASC" : "DESC";
            if (orderBy === "certificate_name") {
                query["order"].push(["name", orderType])
            }
        }
        const userCertificates = await certificateModel?.findAll({
            where: {
                status:{
                    [Op.ne]:"DRAFT"
                },
                [Op.and]: [
                    {
                        startDate: {
                            [Op.lte]: currentDate
                        },
                    },
                    where(fn("DATE_ADD",col("startDate"),literal("INTERVAL duration MONTH")),{
                        [Op.gt]:currentDate
                    })
                ],
                ...query.where
            },
            include: {
                model: userModel
            },
            ...(orderBy?{order:query.order}:{})
            // attributes:[
            //     "code","name","startDate","endDate",
            //     // [fn("JSON_LENGTH",col(""))]
            // ]
        });

        const userCertificatesWithStatus = JSON.parse(JSON.stringify(userCertificates))?.map(certificate => {
            const enrollmentStatus = (certificate?.users?.length)?"Enrolled":"Enroll Now";
            return {
                ...certificate,
                enrollmentStatus,
                users:null
            }
        });
        console.log(userCertificatesWithStatus);
        return res.status(200).json({
            userCertificates:userCertificatesWithStatus
        })
    } catch (error) {
        handleError(req, res, error);
    }
}