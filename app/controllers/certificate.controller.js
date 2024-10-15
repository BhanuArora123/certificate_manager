const certificateModel = require("../models/certificate.model");
const moment = require("moment");
const { handleError } = require("../utils/handleError");
const userModel = require("../models/users.model");
const { fn, col ,Op, literal, Sequelize} = require("sequelize");

exports.createCertificate = async (req,res,next) => {
    try{
        const {name,code,status,startDate,duration,issuer,overview,} = req.body;
        const startDateTime = moment(startDate).set({hours:0,minutes:0,seconds:0,milliseconds:0}).utc().toDate();
        const newCertificate = await certificateModel?.create({
            name,
            code,
            status,
            duration,
            startDate:startDateTime,
            issuer,
            overview
        });
        return res.status(201).json({
            message:"certificate created successfully",
            certificate:newCertificate
        })
    }
    catch(error){
        handleError(req,res,error);
    }
}

exports.editCertificate = async (req,res,next) => {
    try{
        const {name,code,status,startDate,duration,issuer,overview,certificateId} = req.body;
        const certificateData = await certificateModel?.findOne({
            where:{
                id:certificateId
            },
            attributes:["status"]
        });
        if(!certificateData){
            return res.status(404).json({
                message:"this certificate doesn't exist"
            })
        }
        if(certificateData?.status !== "DRAFT"){
            return res.status(400).json({
                message:"status can be updated for DRAFT STATUS ONLY"
            })
        }
        let dataToBeUpdated = {};
        if(name){
            dataToBeUpdated["name"] = name;
        }
        if(code){
            dataToBeUpdated["code"] = code;
        }
        if(status){
            dataToBeUpdated["status"] = status;
        }
        if(duration){
            dataToBeUpdated["duration"] = duration;
        }
        if(startDate){
            const startDateTime = moment(startDate).set({hours:0,minutes:0,seconds:0,milliseconds:0}).utc().toDate();
            dataToBeUpdated["startDate"] = startDateTime;
        }
        if(issuer){
            dataToBeUpdated["issuer"] = issuer;
        }
        if(overview){
            dataToBeUpdated["overview"] = overview;
        }
        const newCertificate = await certificateModel?.update(dataToBeUpdated,{
            where:{
                id:certificateId
            }
        });
        return res.status(201).json({
            message:"certificate updated successfully",
            certificate:newCertificate
        })
    }
    catch(error){
        handleError(req,res,error);
    }
}

exports.getCertificatesList = async (req,res,next) => {
    try {
        let {status,startDate,endDate,orderBy,orderSequence} = req.query;

        const currentDate = moment().utc().toDate();
        let query = {};
        if(status || startDate || endDate){
            query = {where:{}};
            if(status){
                query["where"]["status"] = status;
            }
            if(startDate && endDate){
                const startDateTime = moment(startDate).toDate();
                const endDateTime = moment(endDate).toDate();
                query = {
                    where:{
                        ...query.where,
                        [Op.or]:[
                            {
                                startDate:{
                                    [Op.between]:[startDateTime,endDateTime]
                                }
                            },
                            {
                                endDate:{
                                    [Op.between]:[startDateTime,endDateTime]
                                }
                            },
                            {
                                [Op.and]:[
                                    {
                                        startDate:{
                                            [Op.lt]:startDateTime
                                        }
                                    },
                                    {
                                        endDate:{
                                            [Op.gt]:endDate
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                };
            }
        }
        if(orderBy){
            query["order"] = [];
            const orderType = (orderSequence === 1)?"ASC":"DESC";
            if(orderBy === "certificate_name"){
                query["order"].push(["name",orderType])
            }
            else if(orderBy === "startDate"){
                query["order"].push(["startDate",orderType])
            }
            else{
                query["order"].push([fn("JSON_LENGTH",col("users")),orderType])
            }
        }
        const certificateList = await certificateModel?.findAll({
            include:{
                model:userModel,
                required:false,
            },
            attributes:[
                "name",
                "code",
                "status",
                "issuer",
                "overview",
                "startDate",
                [fn("DATE_ADD",col("startDate"),literal("INTERVAL duration MONTH")),"endDate"]
            ],
            ...query
        });
        let certificateListNew = certificateList;
        if(status && status !== "DRAFT"){
            certificateListNew = JSON.parse(JSON.stringify(certificateListNew))?.map(certificate => {
                let isInFuture = moment(certificate.startDate).toDate() > currentDate;
                let status = (moment(certificate.startDate).toDate() <= currentDate && moment(certificate.endDate).toDate() >= currentDate)?"Active":(isInFuture?"PUBLISHED":"Expired");
                return {
                    ...certificate,
                    status
                }
            })
        }
        return res.status(200).json({
            certificateList:certificateListNew
        })
    } catch (error) {
        handleError(req,res,error);
    }
} 
