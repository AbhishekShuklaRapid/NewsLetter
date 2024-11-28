const echarts = require('echarts');
const { createCanvas, registerFont } = require('canvas');
const convertToPng = require('./convertToPng'); // Assuming this handles PNG buffer -> S3 upload

registerFont('Roboto-Regular.ttf', { family: 'Roboto' });

/**
 * Function to generate an eCharts Line Chart for avg_price across different distances and upload to S3.
 * @param {Array} aggregations - Array containing aggregation data for each distance (100, 250, 500, etc.).
 * @param {string} id - Unique identifier for the chart.
 * @param {string} bucketName - S3 bucket name where the PNG should be stored.
 * @returns {Promise<string>} - The S3 URL of the uploaded PNG image.
 */
const generateEchartLineChart_Past = async (aggregations, id) => {
    try {
        // Define the months for the x-axis
        const months = ['2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11'];

        // Extract the data for distance
        const distances = ['10000 miles'];
        const series = distances.map((distance, index) => {
            const buckets = aggregations[index].avg_values.buckets;

            const avgPrices = months.map((month) => {
                const bucket = buckets.find((b) => b.key_as_string === month);
                return bucket && bucket.avg_price.value != null ? bucket.avg_price.value : 0;
            });

            const docCounts = months.map((month) => {
                const bucket = buckets.find((b) => b.key_as_string === month);
                return bucket && bucket.doc_count != null ? bucket.doc_count : 0;
            });

            return {
                avgPrices,
                docCounts,
            };
        });

        const chartOptions = {
            title: {
                text: 'Average Competitors Price and Sales by Miles',
                left: 'center',
                top: '5%',
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow', // Highlight both bar and line
                },
                formatter: function (params) {
                    let tooltipContent = `${params[0].axisValue}<br/>`;
                    params.forEach((item) => {
                        if (item.seriesType === 'bar') {
                            tooltipContent += `${item.marker} Sales: ${item.data}<br/>`;
                        } else if (item.seriesType === 'line') {
                            tooltipContent += `${item.marker} ${item.seriesName}: $${item.data.toFixed(2)}<br/>`;
                        }
                    });
                    return tooltipContent;
                },
            },
            legend: {
                data: ['Sales', 'Average Price'],
                top: '10%',
                left: 'center',
                itemGap: 20,
            },
            xAxis: {
                type: 'category',
                data: ['Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov'],
                axisLabel: {
                    fontSize: 12,
                    margin: 10,
                },
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'Sales',
                    position: 'left',
                    nameGap: 50,
                    axisLabel: {
                        fontSize: 12,
                    },
                },
                {
                    type: 'value',
                    name: 'Average Price ($)',
                    position: 'right',
                    nameGap: 50,
                    axisLabel: {
                        fontSize: 12,
                        formatter: '$ {value}',
                    },
                },
            ],
            series: [
                {
                    name: 'Sales',
                    type: 'bar',
                    data: series[0].docCounts,
                    yAxisIndex: 0, // Use the first Y-axis
                    barWidth: '40%',
		    label: {
                        show: true, // Enable labels
                        position: 'top', // Position labels on top of bars
                        formatter: '{c}', // Display the value
                        fontSize: 12,
                        color: '#000', // Adjust label color as needed
                    },
                },
                {
                    name: 'Average Price',
                    type: 'line',
                    data: series[0].avgPrices,
                    yAxisIndex: 1, // Use the second Y-axis
		    showSymbol: true, // Always show symbols
                    symbol: 'circle', // Marker shape
                    symbolSize: 8, // Marker size
                    lineStyle: {
                        width: 3, // Line thickness
                    },
                    itemStyle: {
                        color: '#00ab41', // Marker color
                    },
                },
            ],
        };

        // Initialize the chart instance
        const canvas = createCanvas(800, 600);
        const chart = echarts.init(canvas);

        // Set the options for the chart
        chart.setOption(chartOptions);
        const buffer = canvas.toBuffer('image/png');
        const base64Png = await convertToPng(buffer, `${id}_line_chart_past`);

        return base64Png;
    } catch (error) {
        console.error('Error uploading the chart to S3:', error);
        throw new Error('Failed to upload chart to S3');
    }
};

module.exports = generateEchartLineChart_Past;

