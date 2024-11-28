const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443',
  auth: {
    username: 'raju@rapidious',
    password: '1raju@Rapidious'
  }
});

async function getInventoryLocationInsights(dealerName) {
  try {
    const result = await client.search({
      index: 'rv-*',
      body: {
        query: {
          bool: {
            must: [
              { term: { "dealer_name.keyword": dealerName } }, // Filter for specific dealer
              { term: { status_date: "2024-11-20 00:00:00" } } 
            ]
          }
        },
        aggs: {
          by_city: {
            terms: { field: 'actual_selling_city.keyword', size: 10 }, // Top 10 cities by listing count
            aggs: {
              average_price: { avg: { field: 'price' } } // Average price per city
            }
          }
        },
        size: 0 // No need to return document hits
      }
    });

    // Format the response for rendering
    const insights = result.body.aggregations.by_city.buckets.map(bucket => ({
      city: bucket.key,
      listings: bucket.doc_count,
      average_price: bucket.average_price.value ? bucket.average_price.value.toFixed(2) : "N/A"
    }));

    return insights;

  } catch (error) {
    console.error('Error retrieving inventory location insights:', error);
    throw error;
  }
}

// Example usage: Fetch insights for a specific dealer
module.exports = {getInventoryLocationInsights};

