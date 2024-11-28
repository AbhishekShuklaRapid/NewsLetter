const AWS = require('aws-sdk');

// Initialize the SES service
const ses = new AWS.SES({ region: 'us-east-1' });

/**
 * Send email with an embedded PNG image in the HTML body using AWS SES.
 * @param {string} recipientEmail - The recipient email address.
 * @param {string} subject - The subject of the email.
 * @param {string} base64Png - The PNG image in base64 format.
 * @returns {Promise} - The result of the SES sendEmail operation.
 */
const sendEmail = async (recipientEmail, subject, id) => {
  const emailParams = {
    Destination: {
      ToAddresses: [recipientEmail], // The recipient email address
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
        	<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RV Sales Newsletter</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
        }

        /* Header Section Styles */
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #f2f2f2; /* Light Gray to contrast blue logo */
            color: #333333; /* Dark Gray Text */
        }

        .header img {
            max-width: 100px; /* Reduced size for the logo */
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
            color: #004080; /* Matching dark blue text */
        }

        .header p {
            font-size: 16px;
            color: #666666; /* Subtle gray for subtitle */
        }

        /* Content Section Styles */
        .content {
            margin: 20px 0;
        }

        .row {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 20px;
	    align-items: center;
        }
        .row:nth-child(odd) .column{
	   order:1
	}
	.row:nth-child(odd) .image{
	 order:2
	}
	.row:nth-child(even) .column{
	 order:2
	}
        .row:nth-child(even) .image {
            order: 2;
        }

        .column {
            flex: 1;
            padding: 10px;
	    max-width:50%;
        }

        .image {
            flex: 1;
            padding: 10px;
	    max-width:50%;
	    display:flex;
	    justify-content:center;
        }

        .image img {
            max-width: 100%;
            height: auto;
            border: 0px solid #ddd;
        }

        /* Footer Section Styles */
        .footer {
            text-align: center;
            padding: 20px 0;
            background-color: #003366; /* Dark Blue for footer */
            color: #ffffff; /* White Text */
        }

        .footer a {
            color: #ffcc00; /* Gold for link */
            text-decoration: none;
        }

        .footer p {
            margin: 5px 0;
        }
	@media screen and (max-width:600px) {
	.row{
	flex-direction:column;
	}
	.column,
	.image{
	max-width:100%;
	text-align:center;
	}
	}
    </style>
</head>

<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <img src="https://s3.amazonaws.com/media.rapidious.com/titan.png" height=50 width=50 alt="Titan.ai">
            <h1>Rapidious</h1>
            <p>Week of October 3, 2024</p>
        </div>

        <!-- Body Section -->
        <div class="content">
            <!-- Row 1 -->
            <div class="row">
                <div class="column">
                    <h2>Inventory - By Model</h2>
                    <p>This week, the RV sales in Region 1 have increased significantly compared to last quarter. The
                        demand for larger models has been strong, particularly in suburban areas.</p>
                </div>
                <div class="image">
                    <img src="https://s3.amazonaws.com/media.rapidious.com/${id}_model.png" alt="RV Sales Chart Region 1">
                </div>
            </div>

            <!-- Row 2 -->
            <div class="row">
                <div class="image">
		<img src="https://s3.amazonaws.com/media.rapidious.com/${id}_year.png" alt="RV Sales Chart Region 1">
                </div>
                <div class="column">
                    <h2>Inventory - By Year</h2>
                    <p>Region 2 has seen a steady trend with minimal fluctuations. Mid-sized RVs have been the most
                        popular choice, favored by younger families and retirees.</p>
                </div>
            </div>
	    <!-- Row 3-->
            <div class="row">
                <div class="column">
                    <h2>Inventory - By Make</h2>
                    <p>This week, the RV sales in Region 1 have increased significantly compared to last quarter. The
                        demand for larger models has been strong, particularly in suburban areas.</p>
                </div>
                <div class="image">
                    <img src="https://s3.amazonaws.com/media.rapidious.com/${id}_make.png" alt="RV Sales Chart Region 1">
                </div>
            </div>
	    <!-- Row 4 -->
	    <div class = "row">
	    	<div class="image">
		    <img src="https://s3.amazonaws.com/media.rapidious.com/${id}_state.png" alt="RV sales state chart">
		</div>
	    	<div class = "column">
			<h2>Inventory - By State</h2>
			<p>These are the states, where most RVs are located in last 7 days, Check these trends and analyze</p>
		</div>
	    </div>
	    <!-- Row 5-->
	   <div class = "row">
                <div class="column">
                	<h2>DiscountPercent vs Miles</h2>
			<p>Check this plot ,so as to analyze the miles covered and discountpercent, to get an idea
				of whether dicountpercent is more or less according to the miles covered</p>
                </div>
		<div class="image">
                	<img src="https://s3.amazonaws.com/media.rapidious.com/${id}_discount.png" alt="RV Sales Chart Region 1">
                </div>
            </div>


                <!-- Footer Section -->
        <div class="footer">
            <p>&copy; 2024 Company Name. All rights reserved.</p>
            <p>Visit us at <a href="https://www.rapidious.com/">www.rapidious.com</a></p>
        </div>
    </div>
</body>

</html>  
	
	`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: 'raju@rapidious.com' // Must be verified with SES
  };
   

  // Send the email using SES
  const result = await ses.sendEmail(emailParams).promise();
  return result;
};

module.exports = sendEmail;

