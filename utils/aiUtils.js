const crypto = require('crypto')

const generateCrypto = (query) => {
  const standardQuery = query.toLowerCase().trim()
  return crypto.createHash('sha256').update(standardQuery).digest('hex')
};

module.exports = { generateCrypto };
