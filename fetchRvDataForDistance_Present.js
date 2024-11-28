const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443',
  auth: {
    username: 'raju@rapidious',
    password: '1raju@Rapidious'
  }
});


// Function to execute the query for a given distance
async function fetchRvDataForDistance_Present(distance) {
    try {
    const response = await client.search({
      index: 'rv-*',
      body: {
        size: 1000,
        query: {
          bool: {
            must: [
              {
                term: {
                  "status_date": "2024-11-20 00:00:00"
                }
              },
              {
                range: {
                  inventory_age: {
                    gte: 140
                  }
                }
              },
              {
                range: {
                  price: {
                    gt: -1
                  }
                }
              },
			  {
                term: {
                  "model_updated.keyword": "Four Winds"
                }
              },
              {
                term: {
                  "make_updated.keyword": "Thor"
                }
              },
              {
                term: {
                  "trim_updated.keyword": "28A"
                }
              },
              {
                term: {
                  "year_modified.keyword": "2024"
                }
              }
            ],
			must_not: [
              {
                term: {
                  "make_updated.keyword": "nan"
                }
              },
              {
                term: {
                  "model_updated.keyword": "nan"
                }
              },
              {
                term: {
                  "price": 0
                }
              },
              {
                term: {
                  "msrp": 0
                }
              }
            ],
			filter: {
              geo_distance: {
                distance: `${distance}miles`,
                actual_listing_point: "28.851637,-81.902011"
              }
            }
          }
        },
        aggs: {
          avg_values: {
            date_histogram: {
              field: "status_date",
              calendar_interval: "month",
              format: "yyyy-MM",
              min_doc_count: 0,
              extended_bounds: {
                min: "now-5M/M",
                max: "2024-07"
              }
            },
			aggs: {
              avg_price: {
                avg: {
                  field: "price"
                }
              },
              avg_discount: {
                avg: {
                  script: {
                    source: `
                      double msrp = Double.parseDouble(doc['msrp'].value.toString());
                      double price = Double.parseDouble(doc['price'].value.toString());
                      if (msrp != 0) {
                        return ((msrp - price) / msrp) * 100;
                      } else {
                        return 0;
                      }
                    `,
                    lang: "painless"
                  }
                }
				},
              avg_dts: {
                avg: {
                  script: {
                    source: `
                      (doc['status_date'].getValue().toEpochSecond() - 
                      doc['first_scraped_at'].getValue().toEpochSecond()) / 86400
                    `
                  }
                }
              }
            }
          }
        }
      }
    });
    return response.body.aggregations;
	} catch (error) {
    console.error(`Error executing query for distance ${distance} miles:`, error);
    throw error;
  }
}
module.exports = { fetchRvDataForDistance_Present }

