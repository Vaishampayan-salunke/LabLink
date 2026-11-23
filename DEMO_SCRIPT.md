# LabLink — Live Hackathon Demonstration Script (5-Minute Walkthrough)

**Objective**: Deliver a compelling, flawless live demonstration of LabLink highlighting genuine full-stack architecture, deterministic scheduling, and GenAI assistance.

---

## Demo Accounts Reference

| Role | Account Email | Password | Primary Demo Flow |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@lablink.demo` | `LabLink@Demo2026` | Institution Analytics, User Management, Audit Logs |
| **Faculty Coordinator** | `faculty.ece@lablink.demo` | `LabLink@Faculty2026` | Review Approval Queue, Resolve Equipment Maintenance |
| **Student** | `student.alex@lablink.demo` | `LabLink@Student2026` | AI Matching, Conflict Resolution, Book Slot, QR Scan |

---

## 5-Minute Presentation Walkthrough

### Minute 1: The Problem & The Solution (Admin View)
1. **Login Page**:
   - Point out the clean Navy/Indigo branding and the **Demo Admin One-Click Button**.
   - Click "Admin Demo" (auto-fills `admin@lablink.demo`) and click **Sign In**.
2. **Admin Dashboard**:
   - Showcase real aggregate metrics computed from database: Total Equipment ($28$), Utilization Rate ($76\%$), Active Bookings ($4$).
   - Show the interactive Recharts charts: Equipment Utilization by Department and Monthly Trends.
   - Demonstrate **Export CSV** button: Click to show immediate streaming download of all booking records.

### Minute 2: Student Discovery & GenAI Recommendation
1. **Switch to Student**:
   - Sign out and log in as `student.alex@lablink.demo` / `LabLink@Student2026`.
2. **AI Assistant (`/student/assistant`)**:
   - Enter prompt: *"I am building an autonomous IoT solar-powered irrigation station with LoRaWAN telemetry and soil moisture sensing."*
   - Click **Analyze Project with AI**.
   - Observe real-time Gemini extraction: Extracts domain (`IoT & Embedded Systems`), requirements (`Microcontroller with Wi-Fi/BLE`, `LoRaWAN Gateway`, `SDI-12 Soil Moisture Probe`).
   - Show the matched equipment from the actual database: **ESP32-S3 AIoT Dev Kit**, **SenseCap Soil Probe**, **NodeMCU LoRa Gateway**.
   - Click "Book Selected Equipment" directly from the AI recommendation.

### Minute 3: Smart Scheduling & Conflict Detection
1. **Equipment Detail & Booking (`/student/equipment`)**:
   - Navigate to the **Xilinx Artix-7 FPGA Development Board**.
   - Show technical specs: $101,440$ Logic Cells, $240$ DSP Slices, $4$ Pmod Ports.
   - Point out the **"Restricted Equipment: Requires Faculty Approval"** badge.
   - Select a time slot that overlaps with an existing reservation.
   - Submit booking: System instantly detects conflict, displays clear warning, and presents **Alternative Available Slots** computed mathematically.
   - Select an alternative slot and submit request. Booking transitions to `PENDING` state.

### Minute 4: Faculty Approval Workflow & Maintenance
1. **Switch to Faculty Coordinator**:
   - Log in as `faculty.ece@lablink.demo` / `LabLink@Faculty2026`.
2. **Pending Approvals (`/faculty/approvals`)**:
   - Open pending queue: Student Alex's FPGA reservation request is visible with his project justification.
   - Demonstrate the Approval action: Click **Approve**. The request instantly moves to `CONFIRMED`, and a notification is dispatched to Alex.
3. **Equipment & Maintenance (`/faculty/equipment`)**:
   - Show how faculty can toggle equipment availability and schedule calibration/maintenance downtime.

### Minute 5: Physical Logistics (QR Check-In) & Dark Mode
1. **Switch back to Student Alex**:
   - Notice the in-app notification bell showing 1 new approval update.
   - Go to **My Bookings (`/student/bookings`)**: Alex's booking now shows `CONFIRMED`.
   - Click **QR Check-In**: Simulate scanning physical unit serial `FPGA-2026-007-U01`. Status updates to `CHECKED_IN`.
2. **Theme System & Wrap-Up**:
   - Click the theme toggle icon in the top header or sidebar: Smooth transition between Light Mode and Dark Mode.
   - Reiterate key architectural differentiators: **Zero mock data**, **Argon2id security**, **real PostgreSQL schema**, and **45 automated tests**.
