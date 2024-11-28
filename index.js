const generateEchartSVG = require('./generateEchartSVG');
const generateEchartSVGModelChart = require('./generateEchartSVGModelChart');
const generateEchartSVGYearChart = require('./generateEchartSVGYearChart');
const generateEchartSVGMakeChart = require('./generateEchartSVGMakeChart');
const generateEchartSVGStateChart = require('./generateEchartSVGStateChart');
const generateDiscountMileageChart = require('./generateDiscountMileageChart');
const {queryDiscountMileage} = require('./queryDiscountMileage');
const sendEmail = require('./sendEmail');
const sendInventoryEmail = require('./sendInventoryEmail');
const sendNewsLetter = require('./sendNewsLetter');
const convertToPng = require('./convertToPng');
const {queryOpenSearch} = require('./opensearch-query');
const {queryTopMakes} = require('./queryTopMakes');
const generateTopMakes = require('./generateTopMakes');
const sendLetter = require('./sendLetter');
const { nanoid } = require('nanoid');
const { inventoryAge } = require('./inventoryAge');
const { getStatusDate } = require('./getStatusDate');
const { fetchRvDataForDistance_Past } = require('./fetchRvDataForDistance_Past');
const { fetchRvDataForDistance_Present } = require('./fetchRvDataForDistance_Present');
const generateEchartSVGPresentChart = require('./generateEchartSVGPresentChart');
const generateEchartLineChart_Past = require('./generateEchartLineChart_Past');
const { getPresentData } = require('./getPresentData');

( async (event) => {
  try {
    
    const id = nanoid(); 
    const aggregations = await queryOpenSearch();
    const discountMileageData = await queryDiscountMileage();
    const queryTopMakesres  = await queryTopMakes();
    const statusDate = await getStatusDate();
    // Email details
    const distances = [10000];
    const fetchPastData = async (distances) => {
    const past_data = await Promise.all(
    distances.map(async (distance) => {
          return await fetchRvDataForDistance_Past(distance);
       })
      );
      return past_data;
    };
    const past_data = await fetchPastData(distances);
    console.log("past data of 6months",JSON.stringify(past_data,null,2))
    const miles = [100,250,500,1000,2000,10000]
    const fetchPresent_Data = async (distances) => {
    const present_data = await Promise.all(
    distances.map(async (distance) => {
     return await getPresentData("rv.status_date", "rv.model_updated", "rv.make_updated", "rv.trim_updated"," rv.latitude", "rv.longitude",distance);
       })
      );
      return present_data;
    };
    const present_data = await fetchPresent_Data(miles);
    console.log("presentdata",JSON.stringify(present_data, null, 2));
    const recipientEmail = 'abhishek@rapidious.com'; // Replace with actual recipient
    const subject = 'Rapidious Weekly News Letter';
    const dealerName = 'Ancira RV';
    
    console.log('OpenSearch Aggregations:', aggregations['model_aggregation']['buckets']);
    generateEchartSVGModelChart(aggregations['model_aggregation']['buckets'],id)
    generateEchartSVGYearChart(aggregations['year_aggregation']['buckets'],id)
    generateEchartSVGMakeChart(aggregations['make_aggregation']['buckets'],id)
    generateEchartSVGStateChart(aggregations['state_aggregation']['buckets'],id)
    generateDiscountMileageChart(discountMileageData,id);
    generateTopMakes(queryTopMakesres,id);
    generateEchartSVGPresentChart(present_data,id);
    generateEchartLineChart_Past(past_data,id);

     // Send the email with the generated SVG
    //const result = await sendEmail(recipientEmail, subject, id);
   // const result = await sendNewsLetter(recipientEmail,subject,dealerName,statusDate,id);
      const result = await sendLetter(recipientEmail,subject);


    console.log('Email sent! Message ID:', result.MessageId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully!', messageId: result.MessageId }),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: 'Error sending email'
    };
  }
})();
