const InsurSchema = require("../models/insur");
const mindee = require("mindee");
const RTO_INSUR_Schema = require("../models/insurrto");
const user = require("../models/user");
const fs = require('fs');

exports.INSURUpload = async (req, res) => {
    let userInsurObj = {}
    try {

        // console.log("Working...");
        // const document = req.files.document
        // if (!document) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'image not found',
        //     });
        // }

        // let path = __dirname + "/uploads/" + Date.now() + `.${document.name.split('.')[1]}`;
        // document.mv(path, (err) => {
        //     if (err) {
        //         console.log(err);
        //     }
        // });


        // // Api mindee
        // const mindeeClient = new mindee.Client({
        //     apiKey: process.env.MINDEE_APIKEY
        // });


        // const inputSource = mindeeClient.docFromPath(path);
        // if (!inputSource) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'inputsource is not found',
        //     });
        // }

        // const customEndpoint = mindeeClient.createEndpoint("insurance", "Shruti-Deshmane", "1");

        // console.log("Working fine");
        // // Parse it
        // const asyncApiResponse = mindeeClient.enqueueAndParse( mindee.product.GeneratedV1, inputSource,{ endpoint: customEndpoint });
        // apiResponse.then((resp) => {
        //     // changes here according to api resp
        //     console.log(resp);
        //     console.log("hello");
        // })
       

            
        // for TS or modules:
        // import * as mindee from "mindee";

        // Init a new client
        const mindeeClient = new mindee.Client({ apiKey: "98344a6ad9335c720813ac56d1765351" });

        // Load a file from disk
        const inputSource = mindeeClient.docFromPath("./config/12.png");

        // Create a custom endpoint for your product
        const customEndpoint = mindeeClient.createEndpoint(
        "new_insurance",
        "Shruti-Deshmane",
        "1" // Defaults to "1"
        );

        // Parse the file asynchronously.
        const asyncApiResponse = mindeeClient.enqueueAndParse(
        mindee.product.GeneratedV1,
        inputSource,
        { endpoint: customEndpoint }
        );


       
        // Handle the response Promise
        asyncApiResponse.then((resp) => {
        // print a string summary
        // console.log(resp.document.toString());
        userInsurObj = resp.document;

        // console.log(resp.document.inference.prediction.fields);

        console.log(resp.document.inference.prediction.fields.get('issued_name').value);
        console.log(resp.document.inference.prediction.fields.get('address').value);

        console.log(resp.document.inference.prediction.fields.get('from').value);
        console.log(resp.document.inference.prediction.fields.get('to').value);
        console.log(resp.document.inference.prediction.fields.get('policy_number').value);

           
        });



        res.status(200).json({
            success : true,
            data : userInsurObj
        })

    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "Error occured due to some technical issue"
        })
    }
}