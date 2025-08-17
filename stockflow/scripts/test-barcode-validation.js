// Simple barcode validation test
function validateBarcode(code) {
  // Remove any non-digit characters
  const cleanCode = code.replace(/\D/g, '');
  
  // Check for common barcode lengths
  const validLengths = [8, 12, 13, 14]; // EAN-8, UPC-A, EAN-13, GTIN-14
  if (!validLengths.includes(cleanCode.length)) {
    return false;
  }

  // Basic checksum validation for EAN-13
  if (cleanCode.length === 13) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCode[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    return checksum === parseInt(cleanCode[12]);
  }

  return true;
}

console.log('🧪 Testing Barcode Validation...\n');

const testBarcodes = [
  '1234567890123', // Valid EAN-13
  '12345678',      // Valid EAN-8
  '123456789012',  // Valid UPC-A
  '123',           // Invalid (too short)
  '12345678901234567890', // Invalid (too long)
  '9780140157376', // Valid EAN-13 (real example)
  '4006381333931', // Valid EAN-13 (real example)
  'ABC123',        // Invalid (contains letters)
  '1234567890124'  // Invalid EAN-13 (wrong checksum)
];

console.log('Testing barcode validation:');
testBarcodes.forEach(barcode => {
  const isValid = validateBarcode(barcode);
  console.log(`${isValid ? '✅' : '❌'} ${barcode}: ${isValid ? 'Valid' : 'Invalid'}`);
});

console.log('\n🎉 Barcode validation test completed!');
console.log('\n📋 Next Steps:');
console.log('1. Start your application: npm run dev');
console.log('2. Go to Products page and add a product with barcode');
console.log('3. Go to Sales page and test the "Quick Scan" button');
console.log('4. Point camera at a barcode to test scanning');
