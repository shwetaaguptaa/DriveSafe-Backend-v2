const RcSchema = require("../models/rc");
const mindee = require("mindee");
const RTO_RC_schema = require("../models/rcrto");
const user = require("../models/user");
const fs = require('fs');
const rcrto = require("../models/rcrto");

exports.Rc2 = async (req, res) => {
    try {

        let userObj;
        const document = req.files.document
        if (!document) {
            return res.status(400).json({
                success: false,
                message: 'image not found',
            });
        }

        // moving image to ../controllers/uploads/images
        let path = __dirname + "/uploads/" + Date.now() + `.${document.name.split('.')[1]}`;
        document.mv(path, (err) => {
            if (err) {
                console.log(err);
            }
        });

        // mindee api
        const mindeeClient = new mindee.Client({
            apiKey: "7ed80ca122ac2b38fff23940ffc532d1"
        });

        const inputSource = mindeeClient.docFromPath(path);
        if (!inputSource) {
            return res.status(400).json({
                success: false,
                message: 'image not found',
            });
        }

        // Create a custom endpoint for your product
        const customEndpoint = mindeeClient.createEndpoint(
            "rc",
            "Shruti-Deshmane",
            // "1" // Optional: set the version, defaults to "1"
        );


        // Parse it
        const apiResponse = mindeeClient.parse(mindee.product.CustomV1,inputSource,{
            endpoint: customEndpoint,
            cropper: true
        });

        // Handle the response Promise
        apiResponse.then((resp) => {
            let rc_autority = "";
            for (let i = 0; i < resp.document.inference.prediction.fields.get('authority').values.length; i++) {
                if (resp.document.inference.prediction.fields.get('authority').values[i].content != ":" && resp.document.inference.prediction.fields.get('authority').values[i].content != "DY.RTO") {
                    rc_autority += resp.document.inference.prediction.fields.get('authority').values[i].content + " ";
                }
            }

            let Name = "";
            for (let i = 0; i < resp.document.inference.prediction.fields.get('name').values.length; i++) {
                if (resp.document.inference.prediction.fields.get('name').values[i].content != ":" && resp.document.inference.prediction.fields.get('name').values[i].content != "name ") {
                    Name += resp.document.inference.prediction.fields.get('name').values[i].content + " ";
                }
            }

            // step 2: create the user Object
            userObj = {
                authority : rc_autority,
                chassis_no : resp.document.inference.prediction.fields.get('chassis_no').values[0].content,
                name: Name,
                engine_no : resp.document.inference.prediction.fields.get('engine_no').values[0].content,
                registered_no : resp.document.inference.prediction.fields.get('registered_no').values[0].content,
                registered_date: resp.document.inference.prediction.fields.get('registered_date').values[0].content,
                registered_validity: resp.document.inference.prediction.fields.get('registered_validity').values[0].content
            }

            console.log(userObj);
            fs.unlinkSync(path);
            
        }).then( async ()=>{
            const rc_autority = userObj['authority'];
            const rc_chassis_no = userObj['chassis_no'];
            const rc_engine_no = userObj['engine_no'];
            const rc_user_name = userObj['name'];
            const rc_registered_no = userObj['registered_no'];
            const rc_registered_date = userObj['registered_date'];
            const rc_registered_validity = userObj['registered_validity'];
    
            const rc_data = await RTO_RC_schema.create({
                rc_autority,
                rc_chassis_no,
                rc_engine_no,
                rc_user_name,
                rc_registered_no,
                rc_registered_date,
                rc_registered_validity,
            })
    
            console.log("data stored");
        })

        return res.status(200).json({
            success: true,
            message: 'rc Licnese data fetch successfully',
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            success: false,
            message: 'Error occured while getting image or api resposne',
        });
    }
}