// opensearch-query.js
const { Client } = require('@opensearch-project/opensearch');
const moment = require('moment'); // For handling date calculations

// Initialize OpenSearch client
const client = new Client({
	node: 'https://search-rvrapidious-2xne6fu6abebslz6my4wyppg64.us-east-1.es.amazonaws.com:443', // Replace with your OpenSearch endpoint
  auth: {
    username: 'raju@rapidious', // Replace with your username
    password: '1raju@Rapidious'  // Replace with your password
  }
});

// Define the query function
async function queryOpenSearch() {
  try {
    // Calculate the date for 'now - 2 days'
    const sevenDaysAgo = moment().subtract(7, 'days').toISOString();

    // Perform the search with aggregations
    const result = await client.search({
      index: 'rv-*', // Index pattern
      body: {
        query: {
          range: {
            status_date: {
              gte: 'now-7d/d'// Get documents where status_date is greater than two days ago
            }
          }
        },
        aggs: {
          make_aggregation: {
            terms: { field: 'make.keyword' } // Aggregation by 'make' field
          },
          year_aggregation: {
            terms: { field: 'year' } // Aggregation by 'year' field
          },
          model_aggregation: {
            terms: { field: 'model.keyword' } // Aggregation by 'model' field
          },
	  state_aggregation: {
            terms: { field: 'state.keyword' } // Aggregation by 'state' field
        }
      }
     }
    });

    // Return the results
    return result.body.aggregations;
  } catch (error) {
    console.error('Error querying OpenSearch: ', error);
    throw error;
  }
}

// Export the query function
module.exports = { queryOpenSearch };

