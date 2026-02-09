# DPMS App

A comprehensive Flutter application for Disease Prediction Management System (DPMS), designed to facilitate disease prediction, patient management, and health monitoring for both doctors and patients.

## Features

### For Doctors
- **Dashboard**: Overview of patients and recent activities
- **Patient Management**: View and manage patient records
- **Health Trends**: Analyze patient health data with interactive charts
- **Disease Prediction**: AI-powered disease prediction for patients
- **Visit Management**: Add and track patient visits
- **Profile Management**: Manage doctor profile and settings

### For Patients
- **Dashboard**: Personal health overview
- **Disease Prediction**: Self-assessment and prediction tools
- **Health Trends**: Track personal health metrics over time
- **Visit History**: View past medical visits
- **Chat Support**: Communicate with healthcare providers
- **Settings**: Manage account and preferences

### Core Features
- **Secure Authentication**: Role-based login for doctors and patients
- **Real-time Data**: Integration with backend API for live data
- **Data Visualization**: Interactive charts using FL Chart
- **Secure Storage**: Local secure storage for sensitive data
- **Responsive Design**: Optimized for mobile devices
- **Offline Support**: Basic offline functionality

## Screenshots

*Add screenshots of your app here*

## Installation

### Prerequisites
- Flutter SDK (^3.8.1)
- Dart SDK
- Android Studio or VS Code with Flutter extensions
- Backend server running (see backend README)

### Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dpms_app/frontend
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   API_BASE_URL=http://your-backend-url
   ```

4. Generate launcher icons (optional):
   ```bash
   flutter pub run flutter_launcher_icons
   ```

5. Run the app:
   ```bash
   flutter run
   ```

### Build for Production
- **Android APK**:
  ```bash
  flutter build apk --release
  ```

- **iOS**:
  ```bash
  flutter build ios --release
  ```

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── providers/
│   └── auth_provider.dart    # Authentication state management
├── screens/
│   ├── auth/                 # Authentication screens
│   ├── doctor/               # Doctor-specific screens
│   └── patient/              # Patient-specific screens
├── services/
│   └── api_service.dart      # API communication
└── widgets/                  # Reusable UI components
```

## Technologies Used

- **Flutter**: UI framework
- **Dart**: Programming language
- **Provider**: State management
- **Dio**: HTTP client
- **Flutter Secure Storage**: Secure local storage
- **FL Chart**: Data visualization
- **Flutter Dotenv**: Environment variable management
- **Google Fonts**: Typography
- **Flutter Animate**: Animations

## API Integration

This app integrates with a Node.js backend and Python ML service. Ensure the backend is running before using the app.

- Backend API endpoints for authentication, patient management, and predictions
- ML service for disease prediction algorithms

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Testing

Run tests:
```bash
flutter test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [your-email@example.com] or create an issue in the repository.

## Acknowledgments

- Flutter team for the amazing framework
- Contributors to the open-source packages used
- Medical professionals for domain expertise
