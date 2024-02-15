const DLSchema = require("../models/dl");
const mindee = require("mindee");
const RTO_DL_schema = require("../models/dlrto");
const user = require("../models/user");
const fs = require('fs');

exports.DlUpload = async (req, res) => {

    try {

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


        // Api mindee
        const mindeeClient = new mindee.Client({
            apiKey: process.env.MINDEE_APIKEY
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
            "dataset_dl",
            "Shruti-Deshmane",
            // "1" // Optional: set the version, defaults to "1"
        );

        // Parse it
        const apiResponse = mindeeClient.parse(mindee.product.CustomV1, inputSource,
            {
                endpoint: customEndpoint,
                cropper: true
            }
        );


        // step 1: extract the data from document
        apiResponse.then((resp) => {
            // Filtering data
            let Name = "";
            for (let i = 0; i < resp.document.inference.prediction.fields.get('name').values.length; i++) {
                if (resp.document.inference.prediction.fields.get('name').values[i].content != ":" && resp.document.inference.prediction.fields.get('name').values[i].content != "name ") {
                    Name += resp.document.inference.prediction.fields.get('name').values[i].content + " ";
                }
            }

            let cov = []
            for (let i = 0; i < resp.document.inference.prediction.fields.get('cov').values.length; i++) {
                if (resp.document.inference.prediction.fields.get('cov').values[i].content != ":") {
                    cov.push(resp.document.inference.prediction.fields.get('cov').values[i].content)
                }
            }

            // step 2: create the user Object
            userObj = {
                dl_no: "MH" + resp.document.inference.prediction.fields.get('dl_no').values[0].content,
                cov: cov,
                name: Name,
                state: resp.document.inference.prediction.fields.get('state').values[0].content,
                valid_till: resp.document.inference.prediction.fields.get('valid_till').values[0].content
            }

            fs.unlinkSync(path);

        }).then(async () => {

            //step 3: check data name from rto database
            function isObjectEmpty(obj) {
                return Object.keys(obj).length === 0;
            }

            const checkuser = await RTO_DL_schema.find({ dl_no: userObj['dl_no'] });
            // console.log(checkuser);

            if (isObjectEmpty(checkuser)) {
                return res.status(400).json({
                    success: false,
                    message: 'Data for this entry is not valid means falutly data',
                });
            }

            // step 4: check user is logged in or not and doc_owner_name and account_name

            // check user is logged in or not
            if (req.user.id === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'User is not logged in or token expired',
                });
            }

            // doc_owner_name and account_name
            const CurrentUser = await user.findById({ _id: req.user.id });
            console.log(CurrentUser);

            console.log(CurrentUser.user_name.toLowerCase());
            console.log(userObj.name.toLowerCase());


            if (CurrentUser.user_name.toLowerCase().trim() === userObj.name.toLowerCase().trim()) {

                // change the user status
                await user.findByIdAndUpdate({ _id: req.user.id }, {
                    $set: {
                        'user_dl_status.status': true,
                        'user_dl_status.value': userObj.dl_no
                    }
                },
                    { multi: true },
                ).then(() => {
                    console.log("data changed");
                })

                const updatedUser = await user.findById({ _id: req.user.id });
                console.log(updatedUser);

                // saving data at database
                const user_dl_no = userObj['dl_no'];
                const user_dl_name = userObj['name'];
                const user_dl_state = userObj['state'];
                const user_dl_cov = userObj['cov'];
                const user_dl_valid_till = userObj['valid_till'];

                const user_dl = await DLSchema.create({
                    user_dl_no,
                    user_dl_name,
                    user_dl_cov,
                    user_dl_state,
                    user_dl_valid_till,
                    // user_dl_id:
                })
                console.log("data stored");
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Document Owner name and Account user owner name is not matched"
                })
            }

            // // step 3 save data in database 

            return res.status(200).json({
                success: true,
                // data: userObj,
                message: "Successfully fetch and stored the data"
            })

        })

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            success: false,
            message: 'Error occured while getting image or api resposne',
        });
    }
}

