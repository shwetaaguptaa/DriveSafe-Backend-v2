const User = require("../models/user")

exports.Fine = async (req, res) => {
    try {

        const { id } = req.params;

        const user = await User.findById({ _id: id });

        let fine_dl = 0
        let fine_rc = 0

        // calcuate find 

        // step 1: check driving license
        if (user.user_dl_status.status == false) {
            fine_dl = 500;
        }

        if (user.user_rc_status.status == false) {
            fine_rc = 1000
        }

        const obj =
        {
            "success": true,
            "isFined": true,
            "fine_dl": fine_dl,
            "fine_rc": fine_rc,
            "totalFine": fine_dl + fine_rc,
        }

        // sending data to server
        return res.status(200).json({
            data: obj
        });


    } catch (err) {
        return res.status(400).json({
            success :false,
            err : err
        })
        console.log(err);
    }
}