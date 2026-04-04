# PolluAware AI

> **Breathe Easier. Govern Smarter.** A real-time geospatial intelligence platform bridging the gap between citizen safety and data-driven climate policy.

**Track:** Hack 'N' Solve  Open Innovation
**Team:** Vikings  
**Deployed App:** (https://pollu-aware-ai.web.app/)  

---

## Problem Statement
The critical lack of hyperlocal air quality intelligence leaves urban populations vulnerable to invisible pollution spikes and prevents policymakers from enacting rapid, source-specific interventions. Without neighborhood-level environmental data, citizens stay at risk, and governments cannot take targeted action.

## Solution Overview & Impact
PolluAware AI is a dual-portal ecosystem that provides actionable intelligence for both the public and the government:
- **For Citizens:** Real-time localized hotspot alerts, geo-fenced safe routing to avoid severe exposure zones, and a direct portal to report pollution sources.
- **For Authorities:** A unified command dashboard featuring live IoT/API data aggregation and an AI Policy Engine that translates raw environmental metrics into instant, actionable intervention protocols.
- **Impact:** Reduces public exposure to harmful AQI levels while cutting down government response times to localized environmental hazards.

---

## Technical Architecture
PolluAware AI is built as a lightweight, scalable software ecosystem:
1. **Data Ingestion:** Aggregates real-time pollution metrics from public environmental APIs and crowdsourced citizen reports.
2. **Cloud Intelligence:** A centralized Firebase backend structures geospatial data for immediate, live-synced analysis.
3. **AI Policy Engine:** JavaScript-based predictive algorithms cross-reference severe AQI spikes to generate source-specific intervention steps.
4. **Application Layer:** A responsive, dual-portal web ecosystem built in React.

### Tech Stack
* **Frontend:** React.js (Vite), Tailwind CSS, React Router
* **Backend & Database:** Firebase (Firestore NoSQL, Authentication, Hosting)
* **Geospatial & Mapping:** Leaflet.js (Open-Source Maps), HTML5 Geolocation API
* **UI/Icons:** Lucide-React

---

## Setup Instructions & Local Deployment
Follow these steps to run the PolluAware AI platform on your local machine.

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn installed
- A Firebase account (for database and authentication)

### 1. Clone the Repository
git clone (https://github.com/Kinshuk-18/polluaware-ai.git)
cd polluaware-ai

### 2. Install Dependencies
npm install

### 3. Environment Variables
Create a .env file in the root directory of the project and add your Firebase configuration keys:

Code snippet

VITE_FIREBASE_API_KEY=your_api_key

VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain

VITE_FIREBASE_PROJECT_ID=your_project_id

VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket

VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

VITE_FIREBASE_APP_ID=your_app_id

### 4. Run the Development Server
npm run dev
The application will be running live at http://localhost:5173.

Usage Guide
Landing Page: Users are greeted with the App Gateway. Select either "Citizen" or "Government Admin".

Citizen Portal: Log in to view live AQI, check the map for nearby Red Zones, calculate AI Safe Routes for commutes, and report local pollution sources.

Government Portal: Log in to access the Unified Dashboard, view incoming citizen grievances, and utilize the AI Policy Engine to generate response protocols based on active hotspots.

Built by Team Vikings | Code Pirates for Social Good

## Team Members:
Divyansh Choudhary,
Manya Rawat,
Kinshuk Sen,
Siddhant Parihar
