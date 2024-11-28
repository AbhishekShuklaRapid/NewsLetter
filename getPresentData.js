const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443',
  auth: {
    username: 'raju@rapidious',
    password: '1raju@Rapidious'
  }
});

// Function to get data with dynamic parameters
async function getPresentData(statusDate, model, make, trim, lat, lon, distance) {
  try {
    const result = await client.search({
      index: 'rv-*',
      body:{
	  "size": 0,
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "status_date": "2024-11-26 00:00:00"
          }
        },
        {
          "range": {
            "price": {
              "gt": -1
            }
          }
        },
        {
          "term": {
            "model_updated.keyword": "Four Winds"
          }
        },
        {
          "term": {
            "make_updated.keyword": "Thor"
          }
        },
        {
          "term": {
            "trim_updated.keyword": "28A"
          }
        },
        {
          "term": {
            "year_modified.keyword": "2024"
          }
        }
      ],
      "must_not": [
        {
          "term": {
            "make_updated.keyword": "nan"
          }
        },
        {
          "term": {
            "model_updated.keyword": "nan"
          }
        },
        {
          "term": {
            "price": 0
          }
        },
        {
          "term": {
            "msrp": 0
          }
        }
      ],
      "filter": [
        {
          "geo_distance": {
            "distance": `${distance}miles`,
            "actual_listing_point": "28.851637,-81.902011"
          }
        }
      ]
    }
  },
  "aggs": {
    "count_by_state": {
      "terms": {
        "field": "listing_state.keyword",
        "size": 200
      },
      "aggs": {
        "value": {
          "avg": {
            "field": "price"
          }
        }
      }
    },
    "price": {
      "stats": {
        "field": "price"
      }
    }
  }
   }});
    console.log("present", JSON.stringify(result.body, null, 2));
    return result.body;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
module.exports = { getPresentData }
