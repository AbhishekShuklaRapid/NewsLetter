const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443',
  auth: {
    username: 'raju@rapidious',
    password: '1raju@Rapidious'
  }
});

// Function to get the maximum status_date
async function getStatusDate() {
  try {
    const result = await client.search({
      index: 'rv-*',
      body: {
        size: 0,
        aggs: {
          max_date: {
            max: {
              field: 'status_date'
            }
          }
        }
      }
    });

    // Extract the maximum date from the aggregation result
    const maxDate = result.body.aggregations.max_date.value_as_string;
    console.log('Max status_date:', maxDate);
    return maxDate;

  } catch (error) {
    console.error('Error retrieving max status_date:', error);
    throw error;
  }
}

// Example usage: Fetch the max status_date
module.exports = { getStatusDate };

