import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testBarcodeFunctionality() {
  console.log('🧪 Testing Barcode Scanner Functionality...\n');

  try {
    // Test 1: Add a test product with barcode
    console.log('1. Adding test product with barcode...');
    const testProduct = {
      name: 'Test Product - Barcode Scanner',
      sku: 'TEST001',
      barcode: '1234567890123', // EAN-13 format
      category: 'Electronics',
      price: 99.99,
      buyingPrice: 50.00,
      quantity: 10,
      lowStockThreshold: 2,
      companyId: 'test-company-id',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'products'), testProduct);
    console.log('✅ Test product added with ID:', docRef.id);

    // Test 2: Search for product by barcode
    console.log('\n2. Testing barcode search...');
    const q = query(
      collection(db, 'products'),
      where('companyId', '==', 'test-company-id'),
      where('barcode', '==', '1234567890123')
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const foundProduct = querySnapshot.docs[0].data();
      console.log('✅ Product found by barcode:', foundProduct.name);
    } else {
      console.log('❌ Product not found by barcode');
    }

    // Test 3: Test barcode validation
    console.log('\n3. Testing barcode validation...');
    const testBarcodes = [
      '1234567890123', // Valid EAN-13
      '12345678',      // Valid EAN-8
      '123456789012',  // Valid UPC-A
      '123',           // Invalid (too short)
      '12345678901234567890' // Invalid (too long)
    ];

    testBarcodes.forEach(barcode => {
      const isValid = validateBarcode(barcode);
      console.log(`${isValid ? '✅' : '❌'} ${barcode}: ${isValid ? 'Valid' : 'Invalid'}`);
    });

    console.log('\n🎉 Barcode functionality test completed!');
    console.log('\n📋 Manual Testing Instructions:');
    console.log('1. Open the sales page in your application');
    console.log('2. Click "Quick Scan" button');
    console.log('3. Point camera at a barcode (or use a barcode generator app)');
    console.log('4. Verify the product is found and added to cart');
    console.log('5. Test with invalid barcodes to ensure error handling');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

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

// Run the test
testBarcodeFunctionality();
