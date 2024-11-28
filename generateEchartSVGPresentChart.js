const echarts = require('echarts');
const { createCanvas, registerFont } = require('canvas');
const convertToPng = require('./convertToPng');

// Register a font for proper text rendering
registerFont('Roboto-Regular.ttf', { family: 'Roboto' });

/**
 * Function to generate an eCharts bar chart for distance-based aggregations.
 * @param {Array} data - The data array with aggregations.
 * @param {string} id - A unique identifier for the chart.
 * @returns {string} - The base64-encoded PNG string of the chart.
 */
const generateEchartSVGPresentChart = async (data, id) => {
  // Define x-axis labels based on distance categories
  const xAxisLabels = ['100 miles', '250 miles', '500 miles', '1000 miles', '2000 miles', 'Nationwide'];

  // Extract average values for the y-axis from the data
  const yAxisData = data.map((aggregation,index) => aggregation.aggregations.price.avg);

  // Define chart options
  const chartOptions = {
    title: {
      text: 'Average Competitors Price by Distance',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}', // Show label and value
    },
    xAxis: {
      type: 'category',
      data: xAxisLabels,
      name: 'Distance',
      axisLabel: {
        rotate: 45, // Rotate labels for better readability
      },
    },
    yAxis: {
      type: 'value',
      name: 'Average',
    },
    series: [
      {
        name: 'Average',
        type: 'bar',
        data: yAxisData,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color: '#42a5f5', // Bar color
        },
      },
    ],
  };

  // Create canvas and initialize eCharts
  const canvas = createCanvas(800, 600);
  const chart = echarts.init(canvas);

  // Set chart options
  chart.setOption(chartOptions);

  // Generate chart as a PNG image buffer
  const buffer = canvas.toBuffer('image/png');

  // Convert to PNG and store in S3
  const base64Png = await convertToPng(buffer, `${id}_present_data`);
  return base64Png;
};

module.exports = generateEchartSVGPresentChart;

