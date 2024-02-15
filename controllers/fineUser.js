const Fine = require("../models/Fine")
const User = require("../models/user")


exports.FineUser = async (req,res)=>{
    try{

        const {id} = req.params

        const data = req.body;

        console.log(data);  
        https://github.com/SagarPatil007/DriveSafe-Backend.git

        return res.status(200).json({
            "success": true,
            // "Data": savedFine,
            "message": "Fine Allocation done",
        })

    }catch(err){
        return res.status(400).json({
            success: false,
            err: err
        })
    }
}