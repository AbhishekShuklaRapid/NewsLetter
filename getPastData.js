const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443',
  auth: {
    username: 'raju@rapidious',
    password: '1raju@Rapidious'
  }
});

// Function to get data with dynamic parameters
async function getPastData(statusDate, year, model, make, trim, lat, lon, distance) {
  try {
   const latitude = Number(lat);
    const longitude = Number(lon);

    // Validate that they are numbers
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Latitude and Longitude must be valid numbers.');
    }
    const result = await client.search({
      index: 'rv-*',
      body: {
        size: 0, // No hits returned, only aggregations
        query: {
          bool: {
            must: [
              {
                range: {
                  status_date: {
                    gte: "now-6M/M",
                    lt: statusDate
                  }
                }
              },
              { range: { price: { gt: -1 } } },
              { term: { "model_updated.keyword": model } },
              { term: { "make_updated.keyword": make } },
              { term: { "trim_updated.keyword": trim } },
              { term: { "year_modified.keyword": year } }
            ],
            must_not: [
              { term: { "make_updated.keyword": "nan" } },
              { term: { "model_updated.keyword": "nan" } },
              { term: { price: 0 } },
              { term: { msrp: 0 } }
            ],
            filter: [
              {
                geo_distance: {
                  distance: `${distance}miles`,
                  actual_listing_point: `${latitude},${longitude}`
                }
              }
            ]
          }
        },
        aggs: {
          value: {
            avg: {
              field: "price"
            }
          },
          price: {
            stats: {
              field: "price"
            }
          }
        }
      }
    });

    return result.body;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

module.exports = { getPastData };

