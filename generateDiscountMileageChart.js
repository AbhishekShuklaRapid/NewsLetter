  const echarts = require('echarts');
  const { createCanvas, registerFont } = require('canvas');
  const convertToPng = require('./convertToPng');
  
  
  const generateDiscountMileageChart = async(data,id) => {
  const canvas = createCanvas(800, 600);
  const chart = echarts.init(canvas);

  const discountMileageData = data.map(record => [record.miles, record.discountpercent]);

  const chartOptions = {
    title: { text: 'Discount Percent vs. Mileage', left: 'center' },
    tooltip: { trigger: 'item' },
    xAxis: { type: 'value', name: 'Miles', scale: true },
    yAxis: { type: 'value', name: 'Discount Percent', scale: true },
    series: [{
      type: 'scatter',
      data: discountMileageData,
      itemStyle: { color: '#ff7043' }
    }]
  };

  chart.setOption(chartOptions);

  const buffer = canvas.toBuffer('image/png');
  const base64png = await convertToPng(buffer,`${id}_discount`);

  return base64png;
};

module.exports = generateDiscountMileageChart;
