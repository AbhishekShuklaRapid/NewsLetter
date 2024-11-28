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
const generateEchartSVGModelChart = async (data,id) => {

   const chartOptions = {
    tooltip: {
        trigger: 'item'
    },
    series: [
        {
            name: 'Category',
            type: 'pie',
            radius: ['20%', '70%'], // Inner and outer radius for the donut effect
            avoidLabelOverlap: false,
            data: data.map((obj)=>({name:obj.key,value:obj.doc_count}))
        }
    ]
};

  // Initialize chart instance (specify rendering to SVG)
   const canvas = createCanvas(800, 600);
  // ECharts can use the Canvas instance created by node-canvas as a container directly
   let chart = echarts.init(canvas);

  // Set the options provided for the chart
  chart.setOption(chartOptions);

  // Generate the SVG string
   const buffer = canvas.toBuffer('image/png');
   const base64Png = await convertToPng(buffer,`${id}_model`);

  return base64Png;
};

module.exports = generateEchartSVGModelChart;

