const { Client } = require('@opensearch-project/opensearch');

// Initialize OpenSearch client
const client = new Client({
        node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443', // Replace with your OpenSearch endpoint
  auth: {
    username: 'raju@rapidious', // Replace with your username
    password: '1raju@Rapidious'  // Replace with your password
  }
});
async function queryDiscountMileage() {
  try {
    const result = await client.search({
      index: 'rv-*',
      body: {
        query: {
          bool: {
            must: [
              { exists: { field: 'discountpercent' } },
              { exists: { field: 'miles' } }
            ]
          }
        },
        _source: ['discountpercent', 'miles'],
        size: 1000 // Adjust based on your data size and performance needs
      }
    });

    return result.body.hits.hits.map(hit => ({
      discountpercent: hit._source.discountpercent,
      miles: hit._source.miles
    }));
  } catch (error) {
    console.error('Error querying OpenSearch for Discount and Mileage Insights: ', error);
    throw error;
  }
}

// Export the query function
module.exports = { queryDiscountMileage };

