

exports.handleError = (req,res,error) => {
    console.log(error);
    return res.status(500).json({
        message:"some error occured!"
    })
}