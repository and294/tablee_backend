// Function to check if no field is empty nor null:
const checkBody = (array) => {
  let isValid = true; //? Initialisation at true

  for (const index of array) {
    if (!index || index === "") {
      isValid = false;
    }
  }

  return isValid;
};

// Module export:
module.exports = { checkBody };
