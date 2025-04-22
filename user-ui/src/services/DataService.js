import { loadCsvFile } from '../utils/csvToJson';

/**
 * Service to handle operations on the IP dataset
 */
class DataService {
  constructor() {
    this.ipDataset = [];
    this.isLoading = false;
    this.isLoaded = false;
    this.loadPromise = null;
    
    // Load the dataset when the service is instantiated
    this.loadDataset();
  }

  /**
   * Load the CSV dataset
   * @returns {Promise<Array>} Promise resolving to the loaded dataset
   */
  async loadDataset() {
    if (this.isLoaded) return this.ipDataset;
    if (this.loadPromise) return this.loadPromise;
    
    this.isLoading = true;
    
    try {
      this.loadPromise = loadCsvFile('/data/ipDataset.csv');
      this.ipDataset = await this.loadPromise;
      this.isLoaded = true;
      console.log('CSV dataset loaded successfully:', this.ipDataset.length, 'items');
    } catch (error) {
      console.error('Error loading CSV dataset:', error);
      this.ipDataset = [];
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
    
    return this.ipDataset;
  }

  /**
   * Get all IPs from the dataset
   * @returns {Promise<Array>} Promise resolving to array of IP objects
   */
  async getAllIPs() {
    if (!this.isLoaded) {
      await this.loadDataset();
    }
    return this.ipDataset;
  }

  /**
   * Search IPs by various criteria
   * @param {string} searchTerm - The term to search for
   * @param {Object} filters - Filters to apply (e.g., { name: true, country: false })
   * @returns {Promise<Array>} Promise resolving to array of matching IP objects
   */
  async searchIPs(searchTerm, filters = { name: true, owner: true, country: true, description: true }) {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    if (!this.isLoaded) {
      await this.loadDataset();
    }

    const term = searchTerm.toLowerCase().trim();
    
    return this.ipDataset.filter(ip => {
      const matchName = filters.name && ip.IPname && ip.IPname.toLowerCase().includes(term);
      const matchOwner = filters.owner && ip.fullname && ip.fullname.toLowerCase().includes(term);
      const matchCountry = filters.country && ip.country && ip.country.toLowerCase().includes(term);
      const matchDescription = filters.description && ip.description && ip.description.toLowerCase().includes(term);
      const matchCategory = filters.category && ip.category && ip.category.toLowerCase().includes(term);
      
      return matchName || matchOwner || matchCountry || matchDescription || matchCategory;
    });
  }

  /**
   * Get an IP by its token ID
   * @param {string} tokenId - The token ID to look for
   * @returns {Promise<Object|null>} Promise resolving to the IP object or null if not found
   */
  async getIPByTokenId(tokenId) {
    if (!this.isLoaded) {
      await this.loadDataset();
    }
    
    return this.ipDataset.find(ip => ip.tokenId === tokenId) || null;
  }

  /**
   * Get IPs by category
   * @param {string} category - The category to filter by
   * @returns {Promise<Array>} Promise resolving to array of matching IP objects
   */
  async getIPsByCategory(category) {
    if (!this.isLoaded) {
      await this.loadDataset();
    }
    
    if (!category) return this.ipDataset;
    
    return this.ipDataset.filter(ip => 
      ip.category && ip.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get IPs by status
   * @param {string} status - The status to filter by (e.g., "Approved", "Pending")
   * @returns {Promise<Array>} Promise resolving to array of matching IP objects
   */
  async getIPsByStatus(status) {
    if (!this.isLoaded) {
      await this.loadDataset();
    }
    
    if (!status) return this.ipDataset;
    
    return this.ipDataset.filter(ip => 
      ip.status && ip.status.toLowerCase() === status.toLowerCase()
    );
  }

  /**
   * Get all available categories
   * @returns {Promise<Array>} Promise resolving to array of unique categories
   */
  async getCategories() {
    if (!this.isLoaded) {
      await this.loadDataset();
    }
    
    const categories = new Set();
    
    this.ipDataset.forEach(ip => {
      if (ip.category) {
        categories.add(ip.category);
      }
    });
    
    return Array.from(categories).sort();
  }

  /**
   * Get all available countries
   * @returns {Promise<Array>} Promise resolving to array of unique countries
   */
  async getCountries() {
    if (!this.isLoaded) {
      await this.loadDataset();
    }
    
    const countries = new Set();
    
    this.ipDataset.forEach(ip => {
      if (ip.country) {
        countries.add(ip.country);
      }
    });
    
    return Array.from(countries).sort();
  }

  /**
   * Upload and process a new CSV file
   * @param {File} file - The CSV file to upload
   * @returns {Promise<Array>} Promise resolving to the processed dataset
   */
  async uploadCsvFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const csvData = event.target.result;
          const { csvToJson } = await import('../utils/csvToJson');
          this.ipDataset = csvToJson(csvData);
          this.isLoaded = true;
          console.log('CSV file uploaded and processed successfully:', this.ipDataset.length, 'items');
          resolve(this.ipDataset);
        } catch (error) {
          console.error('Error processing CSV file:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }
}

// Create a singleton instance
const dataService = new DataService();

export default dataService;