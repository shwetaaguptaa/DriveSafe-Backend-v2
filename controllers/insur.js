const InsurSchema = require("../models/insur");
const mindee = require("mindee");
const RTO_INSUR_Schema = require("../models/insurrto");
const user = require("../models/user");
const fs = require('fs');

exports.INSURUpload = async (req, res) => {
    try {
        const document = req.files.document
        if (!document) {
            return res.status(400).json({
                success: false,
                message: 'image not found',
            });
        }

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
                message: 'inputsource is not found',
            });
        }

        const customEndpoint = mindeeClient.createEndpoint("insurance", "Shruti-Deshmane");

        // Parse it
        const apiResponse = mindeeClient.parse(mindee.product.CustomV1, inputSource, {
            endpoint: customEndpoint, cropper: true
        });

        apiResponse.then((resp) => {

            // changes here according to api resp

            console.log(resp.document.toString());
        })

    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "Error occured due to some technical issue"
        })
    }
}