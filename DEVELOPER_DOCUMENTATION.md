# CureeX AI Agent - Developer Documentation

## 📋 Project Overview

A comprehensive healthcare management AI agent built with modern web technologies, featuring advanced AI capabilities, real-time safety features, and complete healthcare service integration.

## 🏗️ Technology Stack

### **Core Framework & Runtime**
- **Framework**: Next.js 15.3.2 (React Framework)
- **Runtime**: Node.js with TypeScript
- **Package Manager**: pnpm 9.12.3
- **Language**: TypeScript 5.6.3

### **Frontend Technologies**
- **UI Framework**: React 19.1.0
- **Styling**: Tailwind CSS 3.4.1
- **Component Library**: Radix UI (Dialog, Avatar, Button, etc.)
- **Icons**: Lucide React 0.446.0
- **Theme Management**: next-themes 0.3.0
- **Animations**: Framer Motion 11.3.19

### **Backend & Database**
- **Database**: PostgreSQL with Drizzle ORM 0.34.0
- **Authentication**: NextAuth.js 5.0.0-beta.25
- **API Routes**: Next.js App Router
- **Database Migrations**: Drizzle Kit 0.25.0

### **AI & Machine Learning**
- **AI Framework**: AI SDK 4.3.13
- **Primary Provider**: OpenRouter (Multiple OpenAI models)
- **Secondary Provider**: Groq (High-performance inference)
- **Models**:
  - `openai/gpt-4.1-nano` - General chat (OpenRouter)
  - `openai/gpt-5-nano` - Advanced reasoning (OpenRouter)
  - `openai/gpt-oss-20b` - Specialized tasks (Groq)

### **External Services & APIs**
- **File Storage**: Vercel Blob 0.24.1
- **Push Notifications**: Web Push API with VAPID keys
- **Geolocation**: Vercel Functions 2.0.0
- **Weather Data**: Open-Meteo API
- **Email**: Web Push notifications

### **Development Tools**
- **Code Quality**: Biome 1.9.4 (Linting & Formatting)
- **Type Checking**: TypeScript 5.6.3
- **Testing**: Playwright 1.50.1
- **Build Tool**: Next.js Turbo Mode
- **Database**: Drizzle Studio for schema management

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (chat)/                   # Main chat interface
│   ├── admin/                    # Admin dashboard
│   ├── api/                      # API routes
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   └── *.tsx                     # Feature components
├── lib/                          # Core business logic
│   ├── ai/                       # AI models & tools
│   │   ├── tools/                # AI tool implementations
│   │   ├── providers.ts          # AI provider configuration
│   │   └── prompts.ts            # System prompts
│   ├── db/                       # Database configuration
│   └── *.ts                      # Utility functions
├── tests/                        # Test suites
├── public/                       # Static assets
└── *.md                          # Documentation
```

## 🚀 Getting Started

### **Prerequisites**
- Bun
- PostgreSQL database
- OpenRouter API key
- Groq API key


## 🗄️ Database Schema

### **Core Tables**

#### **User Management**
- `User` - Authentication and user profiles
- `Chat` - Conversation sessions
- `Message` - Chat messages with parts and attachments

#### **Healthcare Services**
- `doctors` - Healthcare provider information
- `appointments` - Medical appointment scheduling
- `ambulanceBookings` - Emergency transportation
- `labs` - Laboratory information
- `labTests` - Available tests and pricing
- `labBookings` - Test appointment scheduling

#### **Medication Management**
- `medications` - User medication tracking
- `medicationReminders` - Automated reminders
- `prescriptions` - Digital prescription management

#### **System Features**
- `pushSubscriptions` - Web push notification subscriptions
- `documents` - User-created content artifacts
- `suggestions` - AI-powered content improvement suggestions




### **Tool System**

#### **Safety & Emergency Tools**
- `analyzeSymptoms` - Advanced symptom triage and emergency detection
- `checkMedicationInteractions` - Real-time drug interaction checking
- `emergencyCoordination` - Multi-service emergency response

#### **Healthcare Management Tools**
- `listDoctors` / `doctorDetails` - Healthcare provider information
- `bookAppointment` / `listAppointments` - Appointment scheduling
- `bookAmbulance` / `listAmbulanceBookings` - Emergency transportation
- `listLabs` / `bookLabTest` - Laboratory services
- `addMedication` / `listMedications` - Medication tracking

#### **Content & Utility Tools**
- `createDocument` / `updateDocument` - Content creation
- `requestSuggestions` - AI-powered writing assistance
- `getWeather` - Location-based health advice


### **Security Features**
- **Session Management**: Secure JWT-based authentication
- **Rate Limiting**: Message quotas (20/day guest, 100/day regular)
- **Input Validation**: Zod schema validation for all inputs
- **API Key Security**: Environment-based key management
- **Data Encryption**: Secure sensitive health information

## 📱 API Architecture

### **RESTful Endpoints**

#### **Chat API**
```
POST /api/chat
- Body: { id, message, selectedChatModel, selectedVisibilityType }
- Response: Streaming AI response with tool execution
```

#### **Healthcare Services**
```
GET /api/doctors          # List doctors
POST /api/appointments    # Book appointments
GET /api/labs            # List labs
POST /api/medications    # Add medications
```

#### **Push Notifications**
```
POST /api/push/subscribe     # Subscribe to notifications
POST /api/push/send-reminders # Send medication reminders
```
