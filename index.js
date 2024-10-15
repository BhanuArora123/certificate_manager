const express = require("express");

const app = express();

const cors = require("cors");
const { connectToDB } = require("./app/utils/DB");
const { initSQLAssociations } = require("./app/utils/DB/associations");
const userRouter = require("./app/routes/user.routes");
const certificateRouter = require("./app/routes/certificate.routes");

app.use(cors({
    origin:"*"
}));

app.use(express.json());

app.use("/users",userRouter);

app.use("/certificates",certificateRouter);

connectToDB();

initSQLAssociations();

app.listen(3000);