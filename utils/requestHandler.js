/**
 *
 * @param {string} type1
 * @param {string} type2
 * @returns string
 */
const decideResponse = (type1, type2) => {
  if (type1 === "cancel" || type2 === "cancel") {
    return "cancel";
  } else if (type1 === type2) {
    return type1;
  } else if (type1 === "text" || type2 === "text") {
    return "text";
  }
};

/**
 *
 * @param {Array<Request>} requests
 * @param {Object} data
 * @returns [string, number]
 */
const checkForAgreements = (requests, data) => {
  let matchIndex = -1;
  const matchedRequest = requests.filter((request, index) => {
    if (data.toSocId === request.fromSocId) {
      matchIndex = index;
      return true;
    } else {
      return false;
    }
  });
  if (matchedRequest.length > 0) {
    return [decideResponse(matchedRequest[0].type, data.type), matchIndex];
  } else {
    return [false, -1];
  }
};

module.exports = checkForAgreements;
