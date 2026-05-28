Digital Prescription Management Platform 
_________________________________________
A full-stack MERN application for managing digital prescriptions online.
Doctors can create and manage prescriptions while patients can securely view and download them.
-----------------------------------------
Features :

Doctor
Login & Registration
Create prescriptions
Edit/Delete prescriptions
Download prescription PDF
Search patient prescriptions
------------------------------------------
Patient
Secure login
View prescription history
Download prescriptions as PDF
Filter prescriptions
Tech Stack
Frontend
React.js
Vite
Tailwind CSS
Axios
------------------------------------------
Backend
Node.js
Express.js
MongoDB
JWT Authentication
PDFKit
Project Structure
Installation
-------------------------------------------
Backend
cd backend
npm install
npm run dev
------------------------------------
Frontend
cd frontend
npm install
npm run dev
Environment Variables
Backend .env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
Frontend .env
VITE_API_URL=http://localhost:5000/api
______________________________________________________________
Challenges Resolved
Implementing role-based authentication for doctors and patients
Managing secure JWT authentication
Generating dynamic prescription PDFs
_______________________________________________________________
This project helped me in improve understanding of full-stack development, API integration, authentication, and backend architecture.
_______________________________________________________________
Future Improvements

Appointment booking
Admin dashboard
Email notifications
Better filtering & pagination

Author ~
Ayush Gupta
