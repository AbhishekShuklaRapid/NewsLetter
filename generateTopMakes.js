const echarts = require('echarts');
const { createCanvas, registerFont } = require('canvas');
const convertToPng = require('./convertToPng');
async function generateTopMakes(data,id) {

  // Generate the chart options
  const chartOptions = {
    xAxis: {
      type: 'category',
      data: data.map(item => item.make),
      axisLabel: { rotate: 45 }
    },
    yAxis: {
      type: 'value'
    },
    tooltip: {
      trigger: 'axis'
    },
    series: [{
      type: 'bar',
      data: data.map(item => item.price),
      label: {
        show: true,
        position: 'top',
        formatter: '{c}'
      }
    }]
  };

  // Create chart image using eCharts and canvas
  const canvas = createCanvas(800, 600);
  const chart = echarts.init(canvas);
  chart.setOption(chartOptions);

  const buffer = canvas.toBuffer('image/png');
  const base64Png = await convertToPng(buffer, `${id}_topmake`);

  return base64Png;
}
module.exports = generateTopMakes;
