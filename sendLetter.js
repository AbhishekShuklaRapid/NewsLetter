const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });
async function sendLetter(recipientEmail,subject){
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Titan.AI Market Pulse</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f7fc;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 20px auto;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #1d3557;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .header p {
      font-size: 16px;
      margin: 5px 0 0;
    }
    .section {
      padding: 20px;
      border-bottom: 1px solid #eaeaea;
    }
    .section h2 {
      color: #1d3557;
      font-size: 22px;
      margin-bottom: 10px;
    }
    .callout {
      background: #f9f9f9;
      border-left: 4px solid #1d3557;
      padding: 10px;
      margin: 10px 0;
      font-size: 14px;
      color: #555;
    }
    .chart {
      text-align: center;
      margin: 20px 0;
    }
    .chart img {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .cta {
      text-align: center;
      padding: 20px;
      background: #f1f4f8;
    }
    .cta a {
      display: inline-block;
      margin: 10px 0;
      padding: 10px 20px;
      background: #1d3557;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
    .footer {
      padding: 10px;
      background: #eee;
      text-align: center;
      font-size: 12px;
    }
    .highlight {
      color: #e63946;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header Section -->
    <div class="header">
      <h1>Titan.AI Market Pulse</h1>
      <p>“Stay ahead with exclusive market trends, inventory opportunities, and actionable insights.”</p>
      <p><em>Week of [Date]</em></p>
    </div>

    <!-- National Market Snapshot -->
    <div class="section">
      <h2>How the Market is Moving: Blink, and You’ll Miss It!</h2>
      <p><strong>Average Days to Sell:</strong> Decreased from <span class="highlight">52</span> to <span class="highlight">47</span> (-10%) over the last two weeks. The market is sprinting faster than a caffeinated salesperson!</p>
      <p><strong>Top 3 Rising Models:</strong></p>
      <ul>
        <li>2023 Jayco Eagle sales are up <span class="highlight">18%</span> nationally. Who said eagles can’t soar?</li>
        <li>2023 Keystone Passport demand increased <span class="highlight">15%</span>. Everyone’s planning their great escape!</li>
        <li>2024 Winnebago Solis sales are climbing. Solis-ly impressive, right?</li>
      </ul>
      <p><strong>Top 3 Declining Models:</strong></p>
      <ul>
        <li>2024 Forest River Wildwood is slowing with a <span class="highlight">29%</span> increase in days to sell. Time to rethink your wild strategy!</li>
        <li>2024 Airstream Flying Cloud demand fell by <span class="highlight">12%</span>. Looks like this cloud needs some silver lining.</li>
        <li>2023 Thor Tellaro sales declined nationally. The thunder isn’t roaring here.</li>
      </ul>
      <div class="chart">
        <img src="https://www.verifiedmarketresearch.com/?attachment_id=444457" alt="Sales Trends Graph">
        <p><small>Graph: RV Market Sales Trends – Because numbers speak louder than words!</small></p>
      </div>
    </div>

    <!-- Dealer-Specific Insights -->
    <div class="section">
      <h2>What’s Happening in Your Inventory? Spoiler: A Lot!</h2>
      <p><strong>Aged Inventory Risks:</strong></p>
      <div class="callout">
        Your <span class="highlight">2024 Keystone Montana</span> units have seen a <span class="highlight">12% drop</span> in average market value over the last 7 days. Adjust pricing to stay competitive—or let them age like fine wine!
      </div>
      <p><strong>High-Opportunity Units:</strong></p>
      <div class="callout">
        <span class="highlight">2023 Grand Design Imagine</span> is selling <span class="highlight">15% faster</span> than the average. Time to stock up or raise the stakes—don’t just imagine the profits!
      </div>
    </div>

    <!-- Pricing Trends -->
    <div class="section">
      <h2>Are You Priced Right? Don’t Be the Odd One Out!</h2>
      <p>The average market price for <span class="highlight">2024 Winnebago Voyage</span> dropped by <span class="highlight">8%</span> in the last 14 days. Staying ahead means not being the Titanic of the pricing world!</p>
      <p><strong>Competitor Activity:</strong> Nearby dealers are listing <span class="highlight">2022 Forest River Cherokee</span> with discounts up to <span class="highlight">$2,000</span>. Competition is hot—don’t let them steal your thunder!</p>
    </div>

    <!-- Stocking Insights -->
    <div class="section">
      <h2>Are You Stocking the Right Units? Inventory Talks, Money Walks!</h2>
      <p>You have less than a 30-day supply of <span class="highlight">2023 Jayco Eagles</span>, which are selling <span class="highlight">25% faster</span> than average in your region. Don’t let these fly off someone else’s lot!</p>
    </div>

    <!-- Highlight of the Week -->
    <div class="section">
      <h2>Titan.AI Tip of the Week: Smarter Moves, Bigger Wins</h2>
      <p>Did you know? Titan.AI identifies underperforming models in your inventory and suggests actionable adjustments. <span class="highlight">Don’t let your profits idle—shift gears now!</span></p>
    </div>

    <!-- Call to Action -->
    <div class="cta">
      <a href="https://www.rapidious.com/" target="_blank">Log in to Titan.AI Dashboard</a>
      <a href="https://calendly.com/" target="_blank">Schedule a Consultation</a>
      <p>Because a small step today can save you big tomorrow!</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Powered by Titan.AI | All Rights Reserved | <a href="https://www.rapidious.com/" target="_blank">Visit Website</a></p>
    </div>
  </div>
</body>
</html>
 `;
const emailParams = {
    Destination: {
      ToAddresses: [recipientEmail], // The recipient email address
    },
    Message: {
      Body: {
         Html: {
          Charset: "UTF-8",
          Data: htmlContent
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: 'raju@rapidious.com', // Must be verified with SES
  };
  try {
    const result = await ses.sendEmail(emailParams).promise();
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
module.exports = sendLetter;
