const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443',
  auth: {
    username: 'raju@rapidious',
    password: '1raju@Rapidious'
  }
});

async function queryTopMakes() {
  try {
    const result = await client.search({
      index: 'rv-new',
      body: {
        size: 0,  // No need for document hits, just aggregations
        _source: [
          "listing_city", "city", "msrp", "class", "dp_url", "engine", "exterior_color", "photo_link",
          "heading", "first_scraped_at", "status_date", "seller_name", "latitude", "longitude",
          "state", "zip", "price", "vin", "point", "rprice", "stock_no", "year", "make", "model",
          "trim", "stats_avg_price", "stats_count", "recommendedprice_pricingalgo",
          "priceofftarget_stats_avg_price", "listing_point", "price_rank", "default_distance",
          "default_distance_price_rank", "revised_price", "stats_max_price", "stats_min_price",
          "similar_inv_rv_count", "actual_selling_city", "actual_selling_state",
          "actual_listing_point", "actual_listing_latitude", "actual_listing_longitude"
        ],
        script_fields: {
          age: {
            script: {
              source: "(doc['status_date'].getValue().toEpochSecond() - doc['first_scraped_at'].getValue().toEpochSecond())/86400",
              lang: "painless"
            }
          },
          discountpercent: {
            script: {
              source: "if (doc['msrp'].value > 0) { return ((Double.parseDouble(doc['msrp'].value.toString()) - Double.parseDouble(doc['price'].value.toString())) / Double.parseDouble(doc['msrp'].value.toString())) * 100; } else { return 0; }",
              lang: "painless"
            }
          }
        },
        query: {
          bool: {
            must: [
              { term: { status_date: "2024-11-08 00:00:00" } },
              { range: { price: { gt: -1 } } },
              { term: { "actual_seller_name.keyword": "Ancira RV" } }
            ],
            must_not: [
              { term: { "make.keyword": "nan" } },
              { term: { "model.keyword": "nan" } },
              { term: { price: 0 } },
              { term: { msrp: 0 } }
            ],
            filter: {
              script: {
                script: {
                  source: "if (doc['status_date'].size() == 0 || doc['pricechange_statusdate'].size() == 0) { return false; } else { return ((doc['status_date'].getValue().toEpochSecond() - doc['pricechange_statusdate'].getValue().toEpochSecond()) / 86400 > params.threshold) && ((doc['status_date'].getValue().toEpochSecond() - doc['first_scraped_at'].getValue().toEpochSecond())/86400 > params.threshold); }",
                  params: { threshold: 14 }
                }
              }
            }
          }
        },
        aggs: {
          top_makes: {
            terms: {
              field: "make.keyword",
              size: 5,
              order: {
                max_price: "desc"
              }
            },
            aggs: {
              max_price: {
                max: {
                  field: "price"
                }
              },
              top_make_hits: {
                top_hits: {
                  _source: {
                    includes: ["price", "make", "model", "stock_no"]
                  },
                  size: 1,
                  sort: [
                    { price: "desc" }
                  ]
                }
              }
            }
          }
        }
      }
    });
    
    return result.body.aggregations.top_makes.buckets.map(bucket => ({
      make: bucket.key,
      price: bucket.max_price.value
    }));

  } catch (error) {
    console.error('Error querying OpenSearch for Top Makes: ', error);
    throw error;
  }
}

module.exports = {queryTopMakes};

