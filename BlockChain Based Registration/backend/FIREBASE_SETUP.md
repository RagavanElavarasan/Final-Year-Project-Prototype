# Firebase Setup Instructions

The backend has been migrated from MongoDB to Firebase Firestore. Follow these steps to set up Firebase credentials:

## Option 1: Using Service Account File (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `touristgeofence`
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Rename it to `firebase-service-account.json`
7. Place it in the `backend` folder

## Option 2: Using Environment Variables

Add the following to your `.env` file with actual values from Firebase Console:

```
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@touristgeofence.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id_here
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40touristgeofence.iam.gserviceaccount.com
```

## Option 3: Using Service Account File Path

Set the environment variable:
```
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/your/service-account.json
```

## Changes Made

1. **Database Migration**: Switched from MongoDB/Mongoose to Firebase Firestore
2. **Dependencies**: Added `firebase-admin` package
3. **Tourist Model**: Rewritten to use Firestore operations instead of Mongoose
4. **API Endpoints**: Updated to work with new Firebase Tourist model
5. **Configuration**: Added Firebase configuration file

## Firebase Collections

The app will create the following Firestore collection:
- `tourists`: Contains all tourist registration data

## Running the Application

After setting up Firebase credentials, run:
```bash
npm start
```

The backend will connect to Firebase automatically and create the necessary collections.