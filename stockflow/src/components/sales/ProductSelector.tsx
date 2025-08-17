import React, { useState, useEffect } from 'react';
import { X, Search, Plus, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/currency';
import QuaggaScanner from '../common/QuaggaScanner';
import { productService } from '../../services/productService';
import { useAuth } from '../../contexts/AuthContext';

interface ProductSelectorProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  onClose: () => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  onAddToCart,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities({
      ...quantities,
      [productId]: Math.max(1, quantity)
    });
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > product.quantity) {
      alert(`Only ${product.quantity} units available`);
      return;
    }
    onAddToCart(product, quantity);
    setQuantities({ ...quantities, [product.id]: 1 });
  };

  const handleBarcodeScanned = async (barcode: string) => {
    if (!currentUser?.companyId) return;
    
    setScanError(null);
    setScannedProduct(null);
    
    try {
      // First try to find by exact barcode match
      const product = await productService.findProductByBarcode(barcode, currentUser.companyId);
      
      if (product) {
        setScannedProduct(product);
        setSearchTerm(product.name); // Set search term to product name for better UX
        setQuantities({ ...quantities, [product.id]: 1 });
      } else {
        // If no exact match, set the barcode as search term
        setSearchTerm(barcode);
        setScanError('Product not found. Please check the barcode or add the product.');
      }
    } catch (error) {
      console.error('Error finding product by barcode:', error);
      setScanError('Error searching for product. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl my-2 sm:my-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Select Products
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-3 sm:p-4 lg:p-6">
          <div className="relative mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <span className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              />
            </span>
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            >
              <span className="hidden sm:inline">Scan Barcode</span>
              <span className="sm:hidden">Scan</span>
            </button>
          </div>

          {/* Barcode Scanner Modal */}
          {scannerOpen && (
            <QuaggaScanner
              onDetected={handleBarcodeScanned}
              onClose={() => setScannerOpen(false)}
            />
          )}

          {/* Scan Error Message */}
          {scanError && (
            <div className="flex items-start mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-red-600 dark:text-red-400">{scanError}</span>
            </div>
          )}

          {/* Scanned Product Highlight */}
          {scannedProduct && (
            <div className="mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 text-sm sm:text-base">
                ✓ Product Found via Barcode
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 truncate">
                    {scannedProduct.name} - {formatCurrency(scannedProduct.price)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Stock: {scannedProduct.quantity} | SKU: {scannedProduct.sku}
                  </p>
                </div>
                <button
                  onClick={() => handleAddToCart(scannedProduct)}
                  className="px-3 py-1.5 bg-green-600 text-white rounded text-xs sm:text-sm hover:bg-green-700 font-medium"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-64 sm:max-h-96 overflow-y-auto scrollbar-thin">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-1 text-sm lg:text-base truncate">
                  {product.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                  SKU: {product.sku}
                </p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Stock: {product.quantity}
                </p>
                
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={quantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                    className="w-14 sm:w-16 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-xs sm:text-sm font-medium"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Add</span>
                    <span className="sm:hidden">+</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-6 sm:py-8">
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                No products found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;