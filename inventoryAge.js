const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443',
  auth: {
    username: 'raju@rapidious',
    password: '1raju@Rapidious'
  }
});

// Function to get the dealer's inventory overview with inventory age >= 140
async function inventoryAge(dealerName) {
  try {
    const result = await client.search({
      index: 'rv-*',
      body: {
        query: {
          bool: {
            must: [
              { term: { 'dealer_name.keyword': dealerName } },
              { term: { status_date: '2024-11-14 00:00:00' } },
              { range: { price: { gt: -1 } } },
              {
                script: {
                  script: {
                    source: `
                      if (doc['status_date'].size() > 0 && doc['first_scraped_at'].size() > 0) {
                        return (doc['status_date'].value.toEpochSecond() - doc['first_scraped_at'].value.toEpochSecond()) / 86400 >= params.age;
                      } else {
                        return false;
                      }
                    `,
                    params: { age: 140 }
                  }
                }
              }
            ]
          }
        },
        _source: [
          "listing_city", "city", "msrp", "class", "dp_url", "engine", "exterior_color", "photo_link", 
          "heading", "first_scraped_at", "status_date", "seller_name", "latitude", "longitude", "state", 
          "zip", "price", "vin", "point", "rprice", "stock_no", "year", "make", "model", "trim", 
          "year_modified", "make_updated", "model_updated", "trim_updated", "stats_avg_price", 
          "stats_count", "recommendedprice_pricingalgo", "DTSbucketname", "priceofftarget_stats_avg_price", 
          "listing_point", "price_rank", "default_distance", "default_distance_price_rank", "revised_price", 
          "stats_max_price", "stats_min_price", "similar_inv_rv_count", "actual_selling_city", 
          "actual_selling_state", "actual_listing_point", "actual_listing_latitude", "actual_listing_longitude","trim_updated"
        ],
        script_fields: {
          inventory_age: {
            script: {
              source: "if (doc['status_date'].size() > 0 && doc['first_scraped_at'].size() > 0) { return (doc['status_date'].value.toEpochSecond() - doc['first_scraped_at'].value.toEpochSecond()) / 86400; } else { return null; }",
              lang: "painless"
            }
          },
          discountpercent: {
            script: {
              source: `
                if (doc['msrp'].size() > 0 && doc['price'].size() > 0 && doc['msrp'].value > 0) { 
                  return ((doc['msrp'].value - doc['price'].value) / doc['msrp'].value) * 100; 
                } else { 
                  return 0; 
                }
              `,
              lang: "painless"
            }
          }
        },
        size: 10000
      }
    });

    // Extract the hits from the response
    const hits = result.body.hits.hits.map(hit => ({
      ...hit._source,
      inventory_age: hit.fields.inventory_age ? hit.fields.inventory_age[0] : null,
      discountpercent: hit.fields.discountpercent ? hit.fields.discountpercent[0] : null
    }));
   
    return hits;

  } catch (error) {
    console.error('Error retrieving inventory overview:', error);
    throw error;
  }
}

// Example usage: Fetch the inventory overview for a specific dealer
module.exports = { inventoryAge };

