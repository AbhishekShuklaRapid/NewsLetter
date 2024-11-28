const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443',
  auth: {
    username: 'raju@rapidious',
    password: '1raju@Rapidious'
  }
});

// Function to retrieve inventory with age >= 140
async function getInventoryAgeGt140(statusDate, dealerName) {
  try {
    const result = await client.search({
      index: 'rv-*',
      body: {
        query: {
          bool: {
            must: [
              { term: { status_date: "2024-11-20 00:00:00" } },
              { range: { price: { gt: -1 } } },
              { range: { inventory_age: { gte: 140 } } },
              { term: { "dealer_name.keyword": dealerName } }
            ],
            must_not: [
              { term: { "make_updated.keyword": "nan" } },
              { term: { "model_updated.keyword": "nan" } },
              { term: { price: 0 } },
              { term: { msrp: 0 } }
            ]
          }
        },
        _source: [
          "listing_city", "city", "msrp", "class", "dp_url", "engine", "exterior_color", "photo_link",
          "heading", "first_scraped_at", "status_date", "seller_name", "actual_seller_name", "latitude",
          "longitude", "state", "zip", "price", "vin", "point", "rprice", "stock_no", "year", "make",
          "model", "trim", "year_modified", "make_updated", "model_updated", "trim_updated",
          "stats_avg_price", "stats_count", "recommendedprice_pricingalgo", "DTSbucketname",
          "priceofftarget_stats_avg_price", "listing_point", "price_rank", "default_distance",
          "default_distance_price_rank", "revised_price", "stats_max_price", "stats_min_price",
          "similar_inv_rv_count", "actual_selling_city", "actual_selling_state", "actual_listing_point",
          "actual_listing_latitude", "actual_listing_longitude", "inventory_age"
        ],
        sort: [
          { inventory_age: { order: "desc" } }
        ],
        size: 15
      }
    });

    // Extract the relevant document from the response
    const inventoryData = result.body.hits.hits.map(hit => hit._source);
    return inventoryData;

  } catch (error) {
    console.error('Error retrieving inventory data:', error);
    throw error;
  }
}

// Example usage: Fetch inventory data for a specific status date and dealer
module.exports = { getInventoryAgeGt140 };

