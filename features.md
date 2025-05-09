# Doctor Appointment Chatbot Features

This document lists the current capabilities of the doctor appointment chatbot system. It will be updated as new features are added.

---

## Core Features

- **Conversational AI Chatbot**
  - Friendly, helpful assistant for booking and managing doctor appointments, lab tests, ambulances, and checking symptoms
  - Natural language interface for all actions

## Symptom Checker

- Users can describe symptoms in natural language
- AI suggests possible causes (informational only, not a diagnosis)
- AI recommends seeing a doctor if symptoms are serious or unclear

## Doctor Management

- List all available doctors and their specialties
- View detailed information about each doctor, including:
  - Name
  - Specialty
  - **Hospital**
  - **Years of Experience**
  - **Availability** (days/times)
  - **Consultation Fees**
  - **Bio/Description**

## Appointment Booking

- Book an appointment with a selected doctor at a specified time
- See all relevant doctor details (hospital, experience, availability, fees, bio) during booking
- Prevents double-booking and ensures only available times are shown (future enhancement)

## Appointment Management

- View all upcoming appointments for the current user (with doctor name, specialty, hospital, time, and fees)
- Cancel an appointment (with confirmation)
- Reschedule an appointment to a new time (with confirmation)
- All appointment flows now use and display the full doctor profile details

## Lab Test Booking

- List available labs, their addresses, time slots, and offered tests (blood, imaging, etc.)
- Show test prices and available time slots
- Book lab tests at home or at a clinic
- View and cancel lab test bookings

## Ambulance Booking

- Book an ambulance for emergencies or transport
- Specify pickup location, destination, and time
- View and cancel ambulance bookings

## User Experience

- Clean, user-friendly chat UI
- No raw JSON or technical output shown to users
- All tool results are formatted for clarity
- Doctor, appointment, lab, and ambulance details are presented in a rich, readable format

---

## Planned / Future Features

- View doctor availability (time slots)
- View/cancel/reschedule by doctor name and time (natural language)
- Doctor/admin portal for managing schedules
- Notifications/reminders for upcoming appointments
- ...and more!

---

_Last updated: 2024-06-10_
