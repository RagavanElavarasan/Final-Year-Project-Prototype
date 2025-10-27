require('dotenv').config();
const { admin, db } = require('./firebase-config');

async function testFirebaseConnection() {
    try {
        console.log('Testing Firebase connection...');
        console.log('Project ID:', admin.app().options.projectId);
        
        // Test Firestore connection
        const testDoc = await db.collection('test').doc('connection-test').set({
            timestamp: new Date(),
            message: 'Firebase connection successful!'
        });
        
        console.log('✅ Firebase Firestore connection successful!');
        
        // Clean up test document
        await db.collection('test').doc('connection-test').delete();
        console.log('✅ Test document cleaned up');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Firebase connection failed:', error.message);
        console.error('Please check your Firebase credentials and configuration.');
        process.exit(1);
    }
}

testFirebaseConnection();