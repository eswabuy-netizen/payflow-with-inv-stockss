const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } = require('firebase/firestore');

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateBuyingPrice() {
  console.log('Starting buying price migration...');
  
  try {
    // Get all products
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    
    console.log(`Found ${querySnapshot.size} products to migrate`);
    
    if (querySnapshot.size === 0) {
      console.log('No products found to migrate');
      return;
    }
    
    // Use batch writes for better performance
    const batch = writeBatch(db);
    let updateCount = 0;
    
    querySnapshot.forEach((docSnapshot) => {
      const productData = docSnapshot.data();
      
      // Check if buyingPrice field already exists
      if (productData.buyingPrice === undefined) {
        // Set buyingPrice to 0 for existing products
        // You can modify this logic to set a different default value
        const defaultBuyingPrice = 0;
        
        batch.update(doc(db, 'products', docSnapshot.id), {
          buyingPrice: defaultBuyingPrice
        });
        
        updateCount++;
        console.log(`Updated product: ${productData.name} (${docSnapshot.id})`);
      } else {
        console.log(`Product already has buyingPrice: ${productData.name} (${docSnapshot.id})`);
      }
    });
    
    if (updateCount > 0) {
      // Commit the batch
      await batch.commit();
      console.log(`Successfully migrated ${updateCount} products`);
    } else {
      console.log('No products needed migration');
    }
    
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run the migration
migrateBuyingPrice()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
