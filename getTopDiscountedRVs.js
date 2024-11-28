const { Client } = require('@opensearch-project/opensearch');
const moment = require('moment');

// Set up the OpenSearch client with authentication
const client = new Client({
  node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443',
  auth: {
    username: 'raju@rapidious',
    password: '1raju@Rapidious'
  }
});

// Function to fetch top discounted RVs for a given dealer
async function getTopDiscountedRVs(dealerName, days = 7) {
  try {
    const result = await client.search({
      index: 'rv-*',
      body: {
        query: {
          bool: {
            must: [
              { match: { actual_seller_name: dealerName } }, // Match on the dealer name
              { term: {status_date: "2024-11-19 00:00:00"}}
            ]
	 }
        },
        sort: [
          { discountpercent: { order: 'desc' } } // Sort by highest discount percentage
        ],
        size: 3, // Limit to top 3 results
        _source: ['model', 'msrp', 'price', 'discountpercent','actual_selling_city'] // Specify fields to return
      }
    });

    // Process and structure the search results
    const rvData = result.body.hits.hits.map(hit => ({
      model: hit._source.model,
      msrp: hit._source.msrp,
      discounted_price: hit._source.price,
      discount_percent: hit._source.discountpercent,
      city:hit._source.actual_selling_city
    }));

    return rvData;

  } catch (error) {
    console.error('Error retrieving top discounted RVs:', error);
	throw error;
  }
}

// Example usage: Fetch top RVs for a specific dealer
module.exports = { getTopDiscountedRVs };
