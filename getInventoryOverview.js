const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443',
  auth: {
    username: 'raju@rapidious',
    password: '1raju@Rapidious'
  }
});

// Function to get the dealer's inventory overview
async function getInventoryOverview(dealerName) {
  try {
    const result = await client.search({
      index: 'rv-*',
      body: {
        query: {
          bool: {
            must: [
              { match: { dealer_name: dealerName } }, // Filter by the dealer name
              { term: { status_date: "2024-11-19 00:00:00" } } // Filter to include only records from the last day
            ]
          }
        },
        aggs: {
          total_inventory: { value_count: { field: '_id' } }, // Total inventory count
          average_price: { avg: { field: 'price' } },         // Average price calculation
          average_discount: { avg: { field: 'discountpercent' } }, // Average discount calculation
          top_rv_makes: {                                   // Top RV classes by count
            terms: { field: 'make_updated.keyword', size: 3 }
          }
        },
        size: 0 // No need to return document hits
      }
    });

    // Extract the aggregation results
    const overview = {
      total_inventory: result.body.hits.total.value,
      average_price: result.body.aggregations.average_price.value.toFixed(2),
      average_discount: result.body.aggregations.average_discount.value.toFixed(2),
      top_makes: result.body.aggregations.top_rv_makes.buckets.map(bucket => bucket.key)
    };

    return overview;

  } catch (error) {
    console.error('Error retrieving inventory overview:', error);
    throw error;
  }
}


// Example usage: Fetch the inventory overview for a specific dealer
module.exports = {getInventoryOverview}

