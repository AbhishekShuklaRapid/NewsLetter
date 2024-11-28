const echarts = require('echarts');
const {createCanvas,registerFont} = require('canvas');
const convertToPng = require('./convertToPng');
registerFont('Roboto-Regular.ttf', {family: 'Roboto'});

const generateEchartSVGStateChart = async(data,id) => {
	const canvas = createCanvas(800,600);
	const chart = echarts.init(canvas);

	const states = data.map(bucket=>bucket.key);
	const rvCounts = data.map(bucket => bucket.doc_count);
	const chartOptions = {
		title: { text: 'Geographic distribution of RVs by State', left:'center'},
		xAxis: {type: 'category', data: states },
		yAxis: {type: 'value', name: 'Number of RVs' },
		series: [{
			type: 'bar',
			data: rvCounts,
			itemStyle: { color:'#4287f5' }
			}]
		};
        	chart.setOption(chartOptions);
		const buffer = canvas.toBuffer('image/png');
		const base64png = await convertToPng(buffer, `${id}_state`);
		return base64png;
};
module.exports = generateEchartSVGStateChart
