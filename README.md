# Modern Voter Verification System 🗳️

A secure and efficient voter verification system built for the Google Developer Group Hackathon 2024, leveraging Firebase and modern web technologies. This system enables election officials to verify voter identities through a multi-step verification process.

## 🌟 Features

- **Secure Authentication**
  - JWT-based authentication system
  - Phone number verification with OTP
  - Firebase Authentication integration
  - Session management

- **Voter Verification**
  - Real-time voter ID verification
  - Secure data storage in Firestore
  - Status tracking and updates

- **User Interface**
  - Clean and intuitive design
  - Mobile-responsive layout
  - Real-time feedback

## 🚀 Tech Stack

- **Frontend**
  - HTML5, CSS3, JavaScript
  - Firebase Web SDK
  - Modern UI/UX design

- **Backend**
  - Node.js with Express
  - Firebase Admin SDK
  - Firestore Database

- **Authentication**
  - Firebase Authentication
  - Phone number verification
  - Secure session management

## 🛠️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/voter-verification.git
   cd voter-verification
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Phone Authentication
   - Set up Firestore Database
   - Add your Firebase configuration

4. **Set up environment variables**
   - Create `.env` file in backend directory
   - Add your Firebase service account credentials

5. **Run the application**
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend (in a new terminal)
   cd frontend
   npm start
   ```

## 📱 Demo Mode

The application includes a demo mode that allows testing without sending actual SMS messages:

### Test Credentials
- Email: demo@example.com
- Password: demo123

### Demo Flow
1. Login with the demo credentials
2. Enter any phone number on the verification page
3. The OTP will be displayed on screen (in a modal) instead of being sent via SMS
4. Enter the OTP to complete verification
5. Proceed to voter ID verification

## 🔒 Security Features

- Secure phone number verification with OTP
- JWT-based authentication
- Encrypted data transmission
- Protected API endpoints
- Rate limiting and attempt tracking
- Input validation and sanitization
- Session management

## 🎯 Future Enhancements

- Admin dashboard
- Analytics and reporting
- QR code generation
- Mobile app version
- Advanced security features

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Hackathon Team
- Firebase Team
- All contributors and supporters 