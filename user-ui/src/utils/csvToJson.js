/**
 * Converts CSV string to JSON array
 * @param {string} csv - CSV string to convert
 * @param {Object} options - Conversion options
 * @returns {Array} Array of objects representing CSV data
 */
export const csvToJson = (csv, options = {}) => {
  const lines = csv.split('\n');
  const result = [];
  const headers = lines[0].split(',').map(header => header.trim());

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    const obj = {};
    const currentLine = lines[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      let value = currentLine[j] ? currentLine[j].trim() : '';
      
      // Handle quoted values that might contain commas
      if (value.startsWith('"') && !value.endsWith('"')) {
        let k = j + 1;
        while (k < currentLine.length && !currentLine[k].includes('"')) {
          value += ',' + currentLine[k];
          k++;
        }
        if (k < currentLine.length) {
          value += ',' + currentLine[k].substring(0, currentLine[k].indexOf('"') + 1);
          j = k;
        }
      }
      
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      
      obj[headers[j]] = value;
    }

    result.push(obj);
  }

  return result;
};

/**
 * Loads a CSV file and converts it to JSON
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} Promise resolving to array of objects
 */
export const loadCsvFile = async (filePath) => {
  try {
    const response = await fetch(filePath);
    const csvData = await response.text();
    return csvToJson(csvData);
  } catch (error) {
    console.error('Error loading CSV file:', error);
    return [];
  }
};