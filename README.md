# BidRight.app

BidRight.app is a professional freelance project estimation tool that helps freelancers create accurate project estimates based on industry benchmarks. Stop undercharging for your work and maximize your profits with data-backed pricing.

![BidRight.app Logo](https://bidright.app/logo.svg)

## Features

- **Project Estimation**: Generate accurate project estimates based on industry, project type, complexity, and features
- **Cost Calculator**: Calculate project costs with customizable rates
- **Timeline Planner**: Get realistic time estimates for project phases
- **Proposal Generator**: Create professional-looking proposals for clients
- **Premium Features**: 
  - Detailed project breakdowns
  - Risk assessment
  - Competitor rate analysis
  - PDF export with white-labeling
  - Client management

## Technology Stack

- React 18 with functional components and hooks
- Firebase Authentication & Firestore
- Tailwind CSS for styling
- jsPDF for PDF generation
- Stripe for payment processing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- NPM (v8 or higher)
- Firebase account
- (Optional) Stripe account for subscription functionality

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bidright.git
cd bidright
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Firebase configuration:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. (Optional) Add your Stripe publishable key for subscription functionality:
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

5. Start the development server:
```bash
npm start
```

The app should now be running at [http://localhost:3000](http://localhost:3000).

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google sign-in methods
3. Create a Firestore database
4. Set up the following Firestore collections:
   - `users` - User profiles
   - `estimates` - Saved estimates (optional, as we use localStorage by default)

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase:
```bash
firebase init
```
   - Select Hosting
   - Select your Firebase project
   - Set the public directory to `build`
   - Configure as a single-page app: Yes
   - Set up automatic deploys with GitHub: Optional

4. Build the app:
```bash
npm run build
```

5. Deploy to Firebase:
```bash
firebase deploy
```

### Cloudflare Pages

BidRight.app is currently deployed via Cloudflare Pages. To set up:

1. Push your code to GitHub
2. Connect your GitHub account with Cloudflare Pages
3. Create a new project and select your repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Build output directory: `build`
   - Set environment variables as needed

## Project Structure

```
bidright/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── premium/
│   │   ├── pricing/
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── data/
│   │   └── industryData.js
│   ├── firebase/
│   │   └── index.js
│   ├── services/
│   │   ├── analytics.js
│   │   ├── pdfExport.js
│   │   └── subscription.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── premiumAccess.js
│   │   └── storage.js
│   ├── views/
│   │   ├── HomeView.js
│   │   ├── EstimatorView.js
│   │   ├── ResultView.js
│   │   └── ...
│   ├── App.js
│   ├── index.js
│   └── ...
├── .env.local
├── .gitignore
├── package.json
├── tailwind.config.js
└── README.md
```

## Future Enhancements

- Mobile app versions for iOS and Android
- Advanced analytics dashboard for tracking project success rates
- Client portal for collaboration
- Integration with popular project management tools
- API for custom integrations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

BidRight Team - support@bidright.app

Project Link: [https://github.com/tyler-tee/bidright-app](https://github.com/tyler-tee/bidright-app)