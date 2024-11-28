const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443',
  auth: {
    username: 'raju@rapidious',
    password: '1raju@Rapidious'
  }
});

async function getPopularModels(dealerName) {
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
          popular_models: {
            terms: { field: 'model_updated.keyword', size: 10 } // Top 10 models by listing count
          }
        },
        size: 0 // No need to return document hits
      }
    });

    // Format response for rendering
    const models = result.body.aggregations.popular_models.buckets.map(bucket => ({
      model: bucket.key,
      listings: bucket.doc_count
    }));

    return models;

  } catch (error) {
    console.error('Error retrieving popular models:', error);
    throw error;
  }
}

// Example usage: Fetch popular models for a specific dealer
module.exports = { getPopularModels };

