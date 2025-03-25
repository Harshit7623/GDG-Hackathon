#!/bin/bash

# Decode the Base64-encoded Firebase key and save it as a JSON file
echo $FIREBASE_JSON_B64 | base64 --decode > ./secrets/firebase-key.json

# Start the Node.js server
npm start
