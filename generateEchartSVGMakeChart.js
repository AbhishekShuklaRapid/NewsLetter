// Import eCharts for node
const echarts = require('echarts');
const { createCanvas,registerFont  } = require('canvas');
const convertToPng = require('./convertToPng');

registerFont('Roboto-Regular.ttf', { family: 'Roboto' })
/**
 * Function to generate an eCharts SVG string.
 * @param {Object} chartOptions - The options for the eChart.
 * @returns {string} - The SVG string of the chart.
 */
const generateEchartSVGYearChart = async (data,id) => {

   const chartOptions = {
 
  polar: {
    radius: [30, '80%']
  },
  radiusAxis: {
    max: Math.max(...data.slice(0,5).map(item => item.doc_count))
  },
  angleAxis: {
    type: 'category',
    data: data.slice(0,5).map((obj)=>obj.key),
    startAngle: 75
  },
  tooltip: {},
  series: {
    type: 'bar',
    data:data.slice(0,5).map((obj)=>obj.doc_count),
    coordinateSystem: 'polar',
    label: {
      show: true,
      position: 'middle',
      formatter: '{b}: {c}'
    }
  },
 
};

  // Initialize chart instance (specify rendering to SVG)
   const canvas = createCanvas(800, 600);
  // ECharts can use the Canvas instance created by node-canvas as a container directly
   let chart = echarts.init(canvas);

  // Set the options provided for the chart
  chart.setOption(chartOptions);

  // Generate the SVG string
   const buffer = canvas.toBuffer('image/png');
   const base64Png = await convertToPng(buffer,`${id}_make`);

  return base64Png;
};

module.exports = generateEchartSVGYearChart;

