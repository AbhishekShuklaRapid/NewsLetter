// Import eCharts for node
const echarts = require('echarts');
const { createCanvas,registerFont  } = require('canvas');

registerFont('Roboto-Regular.ttf', { family: 'Roboto' })
/**
 * Function to generate an eCharts SVG string.
 * @param {Object} chartOptions - The options for the eChart.
 * @returns {string} - The SVG string of the chart.
 */
const generateEchartSVG = (chartOptions) => {
  // Initialize chart instance (specify rendering to SVG)
   const canvas = createCanvas(800, 600);
  // ECharts can use the Canvas instance created by node-canvas as a container directly
   let chart = echarts.init(canvas);

  // Set the options provided for the chart
  chart.setOption(chartOptions);

  // Generate the SVG string
   const buffer = canvas.toBuffer('image/png');

  return buffer;
};

module.exports = generateEchartSVG;

