const { getAuth } = require ("@clerk/clerk-sdk-node"); // or "@clerk/clerk-sdk-node" if not using Next.js

const getUserIdFromRequest = (req) => {
  const { userId } = getAuth(req);
  return userId;
};
module.exports = {getUserIdFromRequest};