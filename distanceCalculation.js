const { Client } = require('@opensearch-project/opensearch');
const client = new Client({
  node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443',
  auth: {
    username: 'raju@rapidious',
    password: '1raju@Rapidious'
  }
});

async function distanceCalculation(trims) {
  try {
    const { body } = await client.search({
      index: 'rv-used',
      size: 0,
      body: {
        query: {
          bool: {
            must: [
              { terms: { "trim_updated.keyword": trims }},
              { term: { "status_date": "2024-11-14 00:00:00" }},
            ],
          },
        },
        aggs: {
          price_by_distance: {
            filters: {
              filters: {
                "100_miles": { geo_distance: { distance: "100miles", listing_point: "29.893137,-98.685719" }},
                "250_miles": { geo_distance: { distance: "250miles", listing_point: "29.893137,-98.685719" }},
                "500_miles": { geo_distance: { distance: "500miles", listing_point: "29.893137,-98.685719" }},
                "1000_miles": { geo_distance: { distance: "1000miles", listing_point: "29.893137,-98.685719" }},
                "2000_miles": { geo_distance: { distance: "2000miles", listing_point: "29.893137,-98.685719" }},
                "10000+_miles": { geo_distance: { distance: "10000miles", listing_point: "29.893137,-98.685719" }},
              },
            },
            aggs: {
              avg_price: { avg: { field: "price" }},
            },
          },
        },
      },
    });

    // Process the response to return distance metrics
    return body.aggregations.price_by_distance.buckets;
  } catch (error) {
    console.error("Error in distance calculation:", error);
  }
}

module.exports = { distanceCalculation };
