// E number ranges and their categories
const E_NUMBER_RANGES = {
  colors: { start: 100, end: 199 },
  preservatives: { start: 200, end: 299 },
  antioxidants: { start: 300, end: 399 },
  emulsifiers: { start: 400, end: 499 },
  stabilizers: { start: 500, end: 599 },
  flavorEnhancers: { start: 600, end: 699 },
  antibiotics: { start: 700, end: 799 },
  miscellaneous: { start: 900, end: 999 },
  additionalChemicals: { start: 1000, end: 1599 }
};

export interface ValidationResult {
  isValid: boolean;
  category?: string;
  message: string;
}

export const validateENumber = (input: string): ValidationResult => {
  // Remove any spaces and convert to uppercase
  const cleanInput = input.trim().toUpperCase();
  
  // Check if the input starts with 'E'
  if (!cleanInput.startsWith('E')) {
    return {
      isValid: false,
      message: 'E number must start with "E"'
    };
  }

  // Extract the number part
  const numberPart = cleanInput.substring(1);
  
  // Check if the remaining part is a valid number
  const number = parseInt(numberPart);
  if (isNaN(number)) {
    return {
      isValid: false,
      message: 'Invalid E number format'
    };
  }

  // Find the category for the number
  let category: string | undefined;
  for (const [key, range] of Object.entries(E_NUMBER_RANGES)) {
    if (number >= range.start && number <= range.end) {
      category = key.charAt(0).toUpperCase() + key.slice(1);
      break;
    }
  }

  if (!category) {
    return {
      isValid: false,
      message: 'E number is out of valid range'
    };
  }

  return {
    isValid: true,
    category,
    message: `Valid E number (${category})`
  };
};

export const isValidENumber = (input: string): boolean => {
  return validateENumber(input).isValid;
}; 