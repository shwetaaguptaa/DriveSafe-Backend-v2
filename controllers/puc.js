const InsurSchema = require("../models/insur");
const mindee = require("mindee");
const RTO_INSUR_Schema = require("../models/insurrto");
const user = require("../models/user");
const fs = require('fs');

exports.PUCUpload = async (req, res) => {
    try{
        
        // Init a new client
        const mindeeClient = new mindee.Client({ apiKey: "98344a6ad9335c720813ac56d1765351" });

        
        // Load a file from disk
        const inputSource = mindeeClient.docFromPath("./config/1puc.jpg");
        
        // Create a custom endpoint for your product
        const customEndpoint = mindeeClient.createEndpoint(
          "puc",
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
          console.log(resp.document.inference.prediction.fields.get('certificate_no').value);
          console.log(resp.document.inference.prediction.fields.get('date').value);
          console.log(resp.document.inference.prediction.fields.get('emission_norms').value);
          console.log(resp.document.inference.prediction.fields.get('fuel').value);
          console.log(resp.document.inference.prediction.fields.get('puc_code').value);
          console.log(resp.document.inference.prediction.fields.get('registration_no').value);
          console.log(resp.document.inference.prediction.fields.get('validity').value); 

          
        });

        res.status(200).json({
            success:true,
            message : "success",
        })

    }
    catch(err){
        return res.status(400).json({
            success: false,
            message: "Error occured due to some technical issue"
        })
    }
}