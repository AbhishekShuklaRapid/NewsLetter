const sharp = require('sharp');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'us-east-1' });

/**
 * Convert SVG string to base64 PNG.
 * @param {string} svgString - The SVG string to be converted.
 * @returns {Promise<string>} - A promise that resolves to a base64 encoded PNG string.
 */
const convertToPng = async (svgString,name) => {
  
  // Upload the PNG buffer to S3
  const params = {
    Bucket: 'media.rapidious.com',
    Key: `${name}.png`,
    Body: svgString,
    ContentType: 'image/png',
    ACL: 'public-read', // Adjust permissions as needed
  };

  const uploadResult = await s3.upload(params).promise();
  console.log(uploadResult)
  return '.png'
};

module.exports = convertToPng;

