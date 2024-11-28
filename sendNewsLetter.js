const { fetchInventoryData } = require('./fetchInventoryData');
const { getTopDiscountedRVs } = require('./getTopDiscountedRVs');
const { getInventoryOverview } = require('./getInventoryOverview');
const { getInventoryLocationInsights } = require('./getInventoryLocationInsights');
const { getPopularModels } = require('./getPopularModels');
const { inventoryAge } = require('./inventoryAge');
const { distanceCalculation } = require('./distanceCalculation');
const { getInventoryAgeGt140 } = require('./getInventoryAgeGt140');
const { getPresentData } = require('./getPresentData');
const { getPastData } = require('./getPastData');
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });
const miles = [100, 250, 500, 1000, 2000, 10000];

// Function to fetch past data and create a single row per RV
const fetchPresentDataForRVs = async (rvs, statusDate) => {
  const present_data_results = await Promise.all(
    rvs.map(async (rv) => {
      const present_data = await Promise.all(
        miles.map(async (distance) => {
          const res = await getPresentData(
            statusDate,
            rv.year_modified,
            rv.model_updated,
            rv.make_updated,
            rv.trim_updated,
            rv.actual_listing_latitude,
            rv.actual_listing_longitude,
            distance
          );

          // Extract average price for the distance
          const avg_price = Math.round(res.aggregations.price.avg || 0);
          return {
            distance,
            avg_price,
          };
        })
      );

      // Return object with stock_no and past_data
      return {
        stock_no: rv.stock_no, // Use stock_no as the identifier
        present_data,
      };
    })
  );

  return present_data_results;
};

const createTableTemplate = (present_data_results, distances) => {
  // Create the header row dynamically with distances
  const headerRow = `
    <tr>
      <th>Stock No</th>
      ${distances.map((distance) => `<th>${distance} Miles</th>`).join('')}
    </tr>
  `;

  // Create rows for each RV
  const rows = present_data_results.map((item) => `
    <tr>
      <td>${item.stock_no}</td>
      ${item.present_data.map((data) => `<td>${data.avg_price || 'N/A'}</td>`).join('')}
    </tr>
  `).join('');

  // Combine header and rows into the final table
  return `
    <table border="1">
      ${headerRow}
      ${rows}
    </table>
  `;
};

async function sendNewsLetter(recipientEmail,subject,dealerName,statusDate,id) {
  const inventoryData = await fetchInventoryData();
  const topDiscounts = await getTopDiscountedRVs(dealerName);
  const inventoryOverview = await getInventoryOverview(dealerName);
  const locationOverview = await getInventoryLocationInsights(dealerName);
  const popularModels = await getPopularModels(dealerName);
  const oldAgeBuckets = await inventoryAge(dealerName);
  const oldAgeTableTrims = oldAgeBuckets.map(item => item.trim_updated);
  const distances = await distanceCalculation(oldAgeTableTrims);
  const agedRVs = await getInventoryAgeGt140(statusDate,dealerName);
  const avgPrice = Array.isArray(locationOverview.average_price) && locationOverview.average_price.length > 0 ? locationOverview.average_price.join(', ') : 'N/A';

  const past_data = await fetchPresentDataForRVs(agedRVs, statusDate);
  const tableHTML = createTableTemplate(past_data, miles);
  // Generate HTML content for email using inventory data
  let tableRows = inventoryData.map(item => `
    <tr>
      <td>${item._source.stock_no}</td>
      <td>${item._source.price}</td>
      <td>${parseInt(item._source.priceofftarget_stats_avg_price)}</td>
      <td>${item._source.priceofftarget_stats_avg_price === 0? "100" : Math.round(
        100 + ((item._source.priceofftarget_stats_avg_price - item._source.price) / item._source.priceofftarget_stats_avg_price) * 100
		)}</td>
    </tr>
  `).join('');
  
  let tableRows1 = topDiscounts.map(item => `
        <tr>
          <td>${item.model}</td>
	  <td>${item.msrp}</td>
          <td>${item.discounted_price}</td>
          <td>${item.discount_percent}</td>
        </tr>
        `).join('');
 let tableRows2 = locationOverview.map(item => `
        <tr>
           <td>${item.city}</td>
           <td>${item.listings}</td>
           <td>${item.average_price !== "N/A" ? item.average_price : "N/A"}</td>
        </tr>
        `).join('');
let tableRows3 = popularModels.map(item => `
        <tr>
           <td>${item.model}</td>
           <td>${item.listings}</td>
        </tr>
        `).join('');

  const topRvMakes = Array.isArray(inventoryOverview.top_makes) && inventoryOverview.top_makes.length > 0
  ? inventoryOverview.top_makes.join(', ')
  : 'N/A';
  const top_models = topDiscounts.map(item => `
  ${item.model} `)
  const topCities = locationOverview.map(item => `
        ${item.city} `)

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dealer Weekly RV Inventory Update</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
margin: auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1, h2 {
      color: #004080;
    }
        .table-container {
      display: flex;
      justify-content: center;
      gap: 20px; /* Space between tables */
      padding: 20px;
      margin: 0 auto;
      max-width: 1200px;
    }
    
    .table-wrapper {
      width: 45%; /* Each table takes up half the width */
      margin: 10px;
      padding: 15px;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      background-color: #f9f9f9;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    th {
      background-color: #4CAF50;
      color: white;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #004080;
	  color: #ffffff;
    }
    .section {
      margin-bottom: 20px;
    }
    .description {
      font-style: italic;
      color: #555;
    }
    .recommendations {
      background-color: #f0f8ff;
      padding: 15px;
      border-radius: 5px;
      border-left: 4px solid #004080;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 0.9em;
      color: #666;
    }
    a {
		color: #004080;
      text-decoration: none;
    }
    @media (max-width: 768px) {
      .table-container {
        flex-direction: column;
        align-items: center;
      }
    }
            .row {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 20px;
			}

        .row:nth-child(even) .image {
            order: 2;
        }

        .column {
            flex: 1;
            padding: 10px;
        }

        .image {
            flex: 1;
            padding: 10px;
        }

        .image img {
		max-width: 100%;
            height: auto;
            border: 0px solid #ddd;
        }
  </style>
</head>
<body>

<div class="container">
  <h1>📬  Weekly RV Inventory Update</h1>
  <p>Hello <strong>${dealerName}</strong> Team,</p>
  <p>Here’s your customized monthly report with valuable insights and performance metrics for your inventory. We’ve compiled data-driven insights to help you maximize visibility and optimize your inventory strategies.</p>

  <div class="section">
    <h2>🔝  Top Discounted RVs at ${dealerName}</h2>
    <p class="description">These RVs Are Priced to Move! Here are your top 3 RVs with the highest discounts this month. Make sure to feature these deals prominently to attract value-seeking buyers!</p>
    <table>
      <tr>
        <th>Model</th>
        <th>MSRP</th>
        <th>Discounted Price</th>
        <th>Discount %</th>
      </tr>
	  ${tableRows1}
    </table>
  </div>

  <div class="section">
    <h2>📊  Dealer Inventory Overview</h2>
    <p class="description">A snapshot of your overall inventory health and average pricing, designed to help you assess the pricing trends and available stock levels at a glance.</p>
    <ul>
      <li><strong>Total Inventory</strong>: ${inventoryOverview.total_inventory}</li>
      <li><strong>Average Price</strong>: ${inventoryOverview.average_price}</li>
      <li><strong>Average Discount</strong>: ${inventoryOverview.average_discount}</li>
      <li><strong>Top RV Makes</strong>: ${topRvMakes}</li>
    </ul>
  </div>

  <div class="section">
    <h2>🏆  Competitive Pricing Position</h2>
    <p class="description">Evaluate how your pricing stacks up against recommended levels to ensure you stay competitive in the market.</p>
    <table>
      <tr>
         <th>stock_no</th>
        <th>Price</th>
        <th>Recommended Price</th>
        <th>% to market</th>
      </tr>
          ${tableRows}
    </table>
  </div>

  <div class="section">
    <h2>📍  Inventory Location Insights</h2>
    <p class="description">Explore the distribution and pricing of your inventory across different locations to identify high-demand areas.</p>
    <table>
      <tr>
        <th>City</th>
        <th>Listings</th>
        <th>Average Price</th>
      </tr>
          ${tableRows2}
    </table>
  </div>
<div class="section">
    <h2>🔍  Popular Models & Demand Trends</h2>
    <p class="description">The top models and brands in high demand based on current listings. Leverage these insights to refine inventory and marketing focus.</p>
    <table>
      <tr>
        <th>Model</th>
        <th>Listings</th>
      </tr>
      ${tableRows3}
    </table>
  </div>

<div style="font-family: Arial, sans-serif; line-height: 1.6;">
  <h2>📊 Aged Inventory Pricing Analysis</h2>
  <p>
    This report presents a detailed analysis of RV units aged beyond 180 days.
  </p>
  <ul>
    <li>
      <strong>Left Chart:</strong> Competitor pricing within various distances, with
      average prices (y-axis) plotted against distance in miles (x-axis).
    </li>
    <li>
      <strong>Right Chart:</strong> Historical trends over the past six months, showcasing
      average prices within 100, 250, 500, 1000, 2000 miles, and nationwide using
      multicolored lines.
    </li>
  </ul>
  <p>
    Stay ahead with these actionable insights to refine your pricing strategy and
    boost sales performance.
  </p>
</div>

             <div class="row">
                <div class="column">
                    <div class="image">
                    <img src="https://s3.amazonaws.com/media.rapidious.com/${id}_present_data.png" alt="RV Sales Chart Region 1">
                </div>
                </div>
                <div class="image">
                    <img src="https://s3.amazonaws.com/media.rapidious.com/${id}_line_chart_past.png" alt="RV Sales Chart Region 1">
                </div>
            </div>
   <div class="row">
        <div class="column">
        <div>
                <h2>Old Age Tables</h2>
                 ${tableHTML}
        </div>
        <div>
      <div>
      </div>
    </div>


  <div class="section recommendations">
    <h2>🚀  Recommendations for ${dealerName}</h2>
    <p class="description">Customized strategies to help you leverage this month’s data for optimal results.</p>
    <ul>
      <li><strong>Feature High-Discount Models</strong>: The ${top_models} are highly discounted; prioritize these in your promotions.</li>
      <li>Maximize <strong>Top Models</strong> and check <strong>percentage to Market</strong> to get an overview of the Inventory and popularize those Models.</li>
      <li><strong>Highlight Newer Models</strong>: Feature newer RVs in marketing to capture buyers interested in recent models.</li>
      <li><strong>Boost Listings in Top Locations</strong>: Maximize listings and advertising efforts in ${topCities}, where demand is strong.</li>
    </ul>
  </div>

  <div class="footer">
    <p>For more data or customized insights, contact your account manager or view the <a href="https://titan-dev.rapidious.com/app/inventory">full inventory dashboard</a>.</p>
</div>
</div>

</body>
</html>


  `;

  // Configure SES email parameters
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

  // Send email using SES
  try {
    const result = await ses.sendEmail(emailParams).promise();
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
module.exports = sendNewsLetter;                                                      
