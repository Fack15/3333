import { useState } from 'react';
import { validateENumber, ValidationResult } from '../utils/eNumberValidator';

export const ENumberValidator = () => {
  const [input, setInput] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    if (value.trim()) {
      setValidation(validateENumber(value));
    } else {
      setValidation(null);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">E Number Validator</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="enumber" className="block text-sm font-medium text-gray-700 mb-1">
            Enter E Number
          </label>
          <input
            id="enumber"
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="e.g. E100"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {validation && (
          <div
            className={`p-4 rounded-md ${
              validation.isValid
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <p className="font-medium">{validation.message}</p>
            {validation.isValid && validation.category && (
              <p className="text-sm mt-1">Category: {validation.category}</p>
            )}
          </div>
        )}

        <div className="text-sm text-gray-600 mt-4">
          <h3 className="font-medium mb-2">E Number Categories:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>E100-E199: Colors</li>
            <li>E200-E299: Preservatives</li>
            <li>E300-E399: Antioxidants</li>
            <li>E400-E499: Emulsifiers</li>
            <li>E500-E599: Stabilizers</li>
            <li>E600-E699: Flavor Enhancers</li>
            <li>E700-E799: Antibiotics</li>
            <li>E900-E999: Miscellaneous</li>
            <li>E1000-E1599: Additional Chemicals</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 