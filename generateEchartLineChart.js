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
const generateEchartLineChart = async (aggregations, id) => {
    try {
        // Define the months for the x-axis
        const months = ['2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11'];

        // Extract the data for each distance (100, 250, 500, etc.)
        const distances = ['100 miles', '250 miles', '500 miles', '1000 miles', '2000 miles', '10000 miles'];

        // Create a series for each distance
        const series = distances.map((distance, index) => {
            const buckets = aggregations[index].avg_values.buckets;
            const data = months.map((month) => {
                const bucket = buckets.find((b) => b.key_as_string === month);
                const avgPrice = bucket && bucket.avg_price.value != null ? bucket.avg_price.value : 0;
                // Add an offset based on the series index to prevent overlap
                return avgPrice + index * 1000; // Adjust the offset value as needed
            });
            return {
                name: distance,
                type: 'line',
                data,
            };
        });

        // ECharts options for the line chart
        const chartOptions = {
            title: {
                text: 'Average Competitors Price by Miles  which were not sold ',
                left: 'center',
                top: '5%',
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line', // Highlight the corresponding line
                },
                formatter: function (params) {
                    let tooltipContent = `${params[0].axisValue}<br/>`;
                    params.forEach((item) => {
                        if (typeof item.data === 'number') {
                            tooltipContent += `${item.marker} ${item.seriesName}: $${item.data.toFixed(2)}<br/>`;
                        }
                    });
                    return tooltipContent;
                },
            },
            legend: {
                data: distances,
                top: '10%',
                left: 'center',
                itemGap: 20, // Space between legend items
            },
            xAxis: {
                type: 'category',
                data: ["June","July","August","September","October","November"],
                axisLabel: {
                    fontSize: 12,
                    margin: 10,
                },
            },
            yAxis: {
                type: 'value',
                name: 'Average Price ($)',
                nameLocation: 'middle',
                nameGap: 80,
                axisLabel: {
                    fontSize: 12,
                    formatter: '$ {value}', // Format the Y-axis labels with a dollar sign
                },
            },
            series: series,
        };

        // Initialize the chart instance
        const canvas = createCanvas(800, 600);
        const chart = echarts.init(canvas);

        // Set the options for the chart
        chart.setOption(chartOptions);
        const buffer = canvas.toBuffer('image/png');
        const base64Png = await convertToPng(buffer, `${id}_line_chart`);

        return base64Png;
    } catch (error) {
        console.error('Error uploading the chart to S3:', error);
        throw new Error('Failed to upload chart to S3');
    }
};

module.exports = generateEchartLineChart;

