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
    tooltip: {
        trigger: 'item'
    },
    xAxis: {
        type: 'category',
        data: data.map((obj)=>obj.key)
    },
    yAxis: {
        type: 'value'
    },
    series: [{
        name: 'Values',
        type: 'bar',
        data: data.map((obj)=>obj.doc_count),
        emphasis: {
            focus: 'series'
        },
        itemStyle: {
            color: '#42a5f5' // Bar color
        }
    }]
};

  // Initialize chart instance (specify rendering to SVG)
   const canvas = createCanvas(800, 600);
  // ECharts can use the Canvas instance created by node-canvas as a container directly
   let chart = echarts.init(canvas);

  // Set the options provided for the chart
  chart.setOption(chartOptions);

  // Generate the SVG string
   const buffer = canvas.toBuffer('image/png');
   const base64Png = await convertToPng(buffer,`${id}_year`);

  return base64Png;
};

module.exports = generateEchartSVGYearChart;

