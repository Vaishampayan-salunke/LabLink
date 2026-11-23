import sys
import uuid
from datetime import datetime, timezone, timedelta, time
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.department import Department, Laboratory
from app.models.equipment import (
    Equipment,
    EquipmentStatus,
    EquipmentSpecification,
    EquipmentAccessPolicy,
    AvailabilityRule,
    MaintenanceRecord,
    MaintenanceStatus,
)
from app.models.booking import Booking, BookingStatus, ProjectRequest
from app.models.notification import Notification, NotificationType
from app.models.equipment_unit import EquipmentUnit, QRCheckEvent


def seed_database():
    """Deterministic database seed for LabLink – 28 equipment items."""
    print("Seeding LabLink database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        now = datetime.now(timezone.utc)

        # ------------------------------------------------------------------ #
        # 1. Departments (Idempotent Get or Create)
        # ------------------------------------------------------------------ #
        def get_or_create_dept(name: str, code: str, desc: str) -> Department:
            dept = db.query(Department).filter(Department.code == code).first()
            if not dept:
                dept = Department(name=name, code=code, description=desc)
                db.add(dept)
                db.flush()
            return dept

        dept_cse = get_or_create_dept("Computer Science & Engineering", "CSE", "Computing infrastructure, AI clusters, and software systems.")
        dept_ece = get_or_create_dept("Electronics & Communication Engineering", "ECE", "Embedded systems, VLSI design, RF, and communications.")
        dept_eee = get_or_create_dept("Electrical & Electronics Engineering", "EEE", "Power electronics, renewable energy, and control instrumentation.")
        dept_mech = get_or_create_dept("Mechanical & Robotics Engineering", "MECH", "Additive manufacturing, robotics actuators, and CNC machining.")
        dept_bio = get_or_create_dept("Biotechnology & Chemical Engineering", "BIO", "Spectroscopy, chromatography, and biological workstations.")

        # ------------------------------------------------------------------ #
        # 2. Users (Idempotent Get or Create with Guaranteed Password Sync)
        # ------------------------------------------------------------------ #
        def get_or_create_user(email: str, password: str, full_name: str, role: UserRole, department_id: str = None, student_id: str = None) -> User:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    email=email,
                    hashed_password=get_password_hash(password),
                    full_name=full_name,
                    role=role,
                    department_id=department_id,
                    student_id=student_id,
                    is_active=True,
                )
                db.add(u)
                db.flush()
            else:
                u.hashed_password = get_password_hash(password)
                u.is_active = True
                if department_id and not u.department_id:
                    u.department_id = department_id
                if student_id and not u.student_id:
                    u.student_id = student_id
                db.flush()
            return u

        admin_user = get_or_create_user("admin@lablink.demo", "LabLink@Demo2026", "Dr. Arthur Vance (Dean of Labs)", UserRole.ADMIN)
        faculty_ece = get_or_create_user("faculty.ece@lablink.demo", "LabLink@Faculty2026", "Prof. Elena Rostova", UserRole.FACULTY, dept_ece.id)
        faculty_cse = get_or_create_user("faculty.cse@lablink.demo", "LabLink@Faculty2026", "Prof. David Chen", UserRole.FACULTY, dept_cse.id)
        faculty_eee = get_or_create_user("faculty.eee@lablink.demo", "LabLink@Faculty2026", "Prof. Sarah Okonkwo", UserRole.FACULTY, dept_eee.id)
        student_alex = get_or_create_user("student.alex@lablink.demo", "LabLink@Student2026", "Alex Rivera", UserRole.STUDENT, dept_ece.id, "STU-2026-081")
        student_priya = get_or_create_user("student.priya@lablink.demo", "LabLink@Student2026", "Priya Sharma", UserRole.STUDENT, dept_cse.id, "STU-2026-142")
        student_jordan = get_or_create_user("student.jordan@lablink.demo", "LabLink@Student2026", "Jordan Hayes", UserRole.STUDENT, dept_mech.id, "STU-2026-219")
        student_rafi = get_or_create_user("student.rafi@lablink.demo", "LabLink@Student2026", "Rafi Hasan", UserRole.STUDENT, dept_eee.id, "STU-2026-305")

        # ------------------------------------------------------------------ #
        # 3. Laboratories (Idempotent Get or Create)
        # ------------------------------------------------------------------ #
        def get_or_create_lab(dept_id: str, name: str, room: str, building: str, hours: str, coord_id: str = None) -> Laboratory:
            lab = db.query(Laboratory).filter(Laboratory.department_id == dept_id, Laboratory.name == name).first()
            if not lab:
                lab = Laboratory(
                    department_id=dept_id,
                    name=name,
                    room_number=room,
                    building=building,
                    operating_hours=hours,
                    faculty_coordinator_id=coord_id,
                )
                db.add(lab)
                db.flush()
            return lab

        lab_iot = get_or_create_lab(dept_ece.id, "Advanced IoT & Embedded Systems Lab", "ECE-302", "Edison Hall", "08:30 - 18:30", faculty_ece.id)
        lab_ai = get_or_create_lab(dept_cse.id, "AI & High-Performance Computing Lab", "CSE-415", "Turing Complex", "08:00 - 20:00", faculty_cse.id)
        lab_robotics = get_or_create_lab(dept_mech.id, "Robotics & Digital Prototyping Lab", "ME-108", "Faraday Pavilion", "09:00 - 17:30")
        lab_instrumentation = get_or_create_lab(dept_eee.id, "Precision Instrumentation & Measurements Lab", "EEE-204", "Tesla Tower", "08:30 - 18:00")
        lab_bio = get_or_create_lab(dept_bio.id, "Bioprocess & Analytical Chemistry Lab", "BIO-101", "Franklin Science Centre", "09:00 - 17:00")
        lab_vlsi = get_or_create_lab(dept_ece.id, "VLSI Design & Verification Lab", "ECE-205", "Edison Hall", "09:00 - 18:00", faculty_ece.id)

        # ------------------------------------------------------------------ #
        # 4. Equipment catalogue – 28 items
        # ------------------------------------------------------------------ #
        IMG = {
            "embedded": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
            "rpi":      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
            "fpga":     "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=600&auto=format&fit=crop&q=80",
            "gpu":      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80",
            "osc":      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
            "print3d":  "https://images.unsplash.com/photo-1631557559445-5d2aa38914ba?w=600&auto=format&fit=crop&q=80",
            "plc":      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80",
            "sensor":   "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80",
            "robot":    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80",
            "circuit":  "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80",
            "server":   "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
            "vr":       "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&auto=format&fit=crop&q=80",
            "scope":    "https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?w=600&auto=format&fit=crop&q=80",
            "laser":    "https://images.unsplash.com/photo-1565689157206-0fddef7589a2?w=600&auto=format&fit=crop&q=80",
            "cnc":      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&auto=format&fit=crop&q=80",
        }

        equipments_data = [
            # ---- ECE / IoT Lab ----
            {
                "dept": dept_ece, "lab": lab_iot,
                "name": "ESP32-S3 Dual-Core AIoT Dev Kit",
                "category": "Embedded Systems", "model": "ESP32-S3-WROOM-1", "serial": "ESP-2026-001",
                "desc": "Espressif dual-core 240 MHz MCU with Wi-Fi, BLE 5.0, 8 MB PSRAM, and AI vector instructions.",
                "image": IMG["embedded"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("MCU", "Xtensa 32-bit LX7"), ("Clock", "240 MHz"), ("Wireless", "Wi-Fi + BLE 5.0"), ("PSRAM", "8 MB")],
                "max_hours": 8, "requires_approval": False,
            },
            {
                "dept": dept_ece, "lab": lab_iot,
                "name": "Raspberry Pi 5 Developer Workstation (8 GB)",
                "category": "Single Board Computers", "model": "RPi-5-8GB", "serial": "RPI-2026-002",
                "desc": "Arm Cortex-A76 quad-core @ 2.4 GHz with PCIe 2.0, dual 4Kp60 HDMI, active cooling.",
                "image": IMG["rpi"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("SoC", "BCM2712 Cortex-A76"), ("RAM", "8 GB LPDDR4X"), ("Networking", "GbE + Wi-Fi"), ("Ports", "2× USB 3.0, PCIe 2.0")],
                "max_hours": 6, "requires_approval": False,
            },
            {
                "dept": dept_ece, "lab": lab_iot,
                "name": "Arduino Mega 2560 Prototyping Kit",
                "category": "Embedded Systems", "model": "Arduino Mega 2560 R3", "serial": "ARD-2026-003",
                "desc": "ATmega2560-based board with 54 digital I/O, 16 analog inputs, and 4 hardware serial ports for large-scale prototyping.",
                "image": IMG["embedded"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("MCU", "ATmega2560 @ 16 MHz"), ("Flash", "256 KB"), ("Digital I/O", "54 pins"), ("Analog Inputs", "16 pins")],
                "max_hours": 6, "requires_approval": False,
            },
            {
                "dept": dept_ece, "lab": lab_iot,
                "name": "NodeMCU V3 LoRa Gateway Kit",
                "category": "IoT & Networking", "model": "NodeMCU-ESP8266 + RFM95W", "serial": "NODE-2026-004",
                "desc": "Wi-Fi + LoRaWAN 868/915 MHz gateway kit ideal for long-range sensor mesh network experiments.",
                "image": IMG["sensor"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("MCU", "ESP8266 80 MHz"), ("LoRa", "RFM95W 868 MHz"), ("Range", "Up to 10 km LoS"), ("Protocol", "LoRaWAN v1.0.3")],
                "max_hours": 6, "requires_approval": False,
            },
            {
                "dept": dept_ece, "lab": lab_iot,
                "name": "DHT22 Sensor Array & Data Logger Kit",
                "category": "Sensor Arrays", "model": "SenseCap LoRaWAN Pro", "serial": "SNS-2026-005",
                "desc": "Industrial SDI-12 soil temperature, VWC, and conductivity probe cluster with LoRaWAN solar gateway.",
                "image": IMG["sensor"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("VWC Range", "0–100% ± 2%"), ("Temp Range", "-40 °C to 80 °C"), ("Interface", "RS485/SDI-12"), ("IP Rating", "IP68")],
                "max_hours": 6, "requires_approval": False,
            },
            {
                "dept": dept_ece, "lab": lab_iot,
                "name": "16-Channel Logic Analyser (500 MSps)",
                "category": "Measurement & Testing", "model": "Saleae Logic Pro 16", "serial": "LA-2026-006",
                "desc": "USB 3.0 logic analyser with 16 digital + 2 analogue channels at 500 MSps, protocol decode for SPI/I2C/UART/CAN.",
                "image": IMG["osc"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("Digital Channels", "16"), ("Analogue Channels", "2"), ("Sample Rate", "500 MSps"), ("Protocols", "SPI, I2C, UART, CAN, 1-Wire")],
                "max_hours": 4, "requires_approval": False,
            },
            # ---- ECE / VLSI Lab ----
            {
                "dept": dept_ece, "lab": lab_vlsi,
                "name": "Xilinx Artix-7 FPGA Development Board",
                "category": "FPGA & Reconfigurable Logic", "model": "Nexys A7-100T", "serial": "FPGA-2026-007",
                "desc": "High-capacity FPGA with 101,440 logic cells, 240 DSP slices, USB-JTAG programming, and VGA output.",
                "image": IMG["fpga"], "status": EquipmentStatus.AVAILABLE, "is_restricted": True,
                "specs": [("Logic Cells", "101,440"), ("DSP Slices", "240"), ("BRAM", "4,860 Kbits"), ("Memory", "128 MB DDR2")],
                "max_hours": 4, "requires_approval": True,
            },
            {
                "dept": dept_ece, "lab": lab_vlsi,
                "name": "ARM Cortex-M7 Embedded Systems Trainer",
                "category": "Embedded Systems", "model": "STM32H7B3I-DK", "serial": "ARM-2026-008",
                "desc": "STM32H7 480 MHz Cortex-M7 discovery kit with 2 MB Flash, touchscreen LCD, Ethernet, and DSP/FPU.",
                "image": IMG["embedded"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("Core", "Cortex-M7 @ 480 MHz"), ("Flash", "2 MB"), ("SRAM", "1.4 MB"), ("Display", "2.0\" 480×272 LCD Touch")],
                "max_hours": 4, "requires_approval": False,
            },
            {
                "dept": dept_ece, "lab": lab_vlsi,
                "name": "PCB Prototyping & SMD Rework Station",
                "category": "PCB Design & Fabrication", "model": "JBC CD-2BHE", "serial": "PCB-2026-009",
                "desc": "Precision hot-air rework station with temperature-controlled solder iron and BGA reballing stencils.",
                "image": IMG["circuit"], "status": EquipmentStatus.AVAILABLE, "is_restricted": True,
                "specs": [("Iron Temp", "90–450 °C ± 1 °C"), ("Air Flow", "Up to 120 L/min"), ("Hot Air Range", "100–480 °C"), ("Weight", "420 g")],
                "max_hours": 3, "requires_approval": True,
            },
            # ---- CSE / AI Lab ----
            {
                "dept": dept_cse, "lab": lab_ai,
                "name": "NVIDIA RTX 4090 Deep Learning Workstation",
                "category": "High Performance Computing", "model": "Alienware Aurora R16 AI Edition", "serial": "HPC-2026-010",
                "desc": "AI research node with Intel Core i9-14900KF, 64 GB DDR5, and RTX 4090 24 GB VRAM, CUDA 12.x.",
                "image": IMG["gpu"], "status": EquipmentStatus.AVAILABLE, "is_restricted": True,
                "specs": [("GPU", "RTX 4090 24 GB VRAM"), ("CPU", "Intel i9-14900KF 24-Core"), ("RAM", "64 GB DDR5 5600"), ("Storage", "2 TB NVMe PCIe 4.0")],
                "max_hours": 6, "requires_approval": True,
            },
            {
                "dept": dept_cse, "lab": lab_ai,
                "name": "NVIDIA Jetson Orin Nano Edge AI Kit",
                "category": "Edge AI & Computer Vision", "model": "NVIDIA Jetson Orin Nano 8 GB", "serial": "JET-2026-011",
                "desc": "Compact edge AI module with 1024-core Ampere GPU, 8 GB LPDDR5, and 40 TOPS inference for robotics.",
                "image": IMG["gpu"], "status": EquipmentStatus.AVAILABLE, "is_restricted": True,
                "specs": [("GPU", "1024-core Ampere"), ("AI Performance", "40 TOPS"), ("RAM", "8 GB LPDDR5"), ("Power", "7–15 W")],
                "max_hours": 4, "requires_approval": True,
            },
            {
                "dept": dept_cse, "lab": lab_ai,
                "name": "VR Research Workstation (Meta Quest Pro)",
                "category": "Extended Reality", "model": "Meta Quest Pro + RTX 4080", "serial": "VR-2026-012",
                "desc": "Full VR/AR research station with eye tracking, mixed reality passthrough, and tethered PC rendering via RTX 4080.",
                "image": IMG["vr"], "status": EquipmentStatus.AVAILABLE, "is_restricted": True,
                "specs": [("Display", "2160×2160 per eye LCD"), ("Refresh", "90 Hz"), ("Tracking", "Eye + Hand + 6DoF"), ("Render GPU", "RTX 4080 16 GB")],
                "max_hours": 3, "requires_approval": True,
            },
            {
                "dept": dept_cse, "lab": lab_ai,
                "name": "HPC Cluster Node (Dual Xeon)",
                "category": "High Performance Computing", "model": "Dell PowerEdge R750", "serial": "SRV-2026-013",
                "desc": "2× Intel Xeon Gold 6338 32-core server node with 512 GB ECC DDR4, 10 GbE, and NVMe RAID array.",
                "image": IMG["server"], "status": EquipmentStatus.AVAILABLE, "is_restricted": True,
                "specs": [("CPUs", "2× Xeon Gold 6338 @ 2.0 GHz"), ("Cores", "64 total"), ("RAM", "512 GB ECC DDR4"), ("Networking", "2× 10GbE")],
                "max_hours": 8, "requires_approval": True,
            },
            # ---- EEE / Instrumentation Lab ----
            {
                "dept": dept_eee, "lab": lab_instrumentation,
                "name": "Tektronix 4-Channel 100 MHz Digital Oscilloscope",
                "category": "Measurement & Testing", "model": "TBS1104B-EDU", "serial": "OSC-2026-014",
                "desc": "4-channel DSO with 1 GS/s sample rate, FFT analysis, automated frequency measurements, and USB data logging.",
                "image": IMG["osc"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("Bandwidth", "100 MHz"), ("Channels", "4 Analog"), ("Sample Rate", "1 GS/s"), ("Record", "2.5k points")],
                "max_hours": 4, "requires_approval": False,
            },
            {
                "dept": dept_eee, "lab": lab_instrumentation,
                "name": "Keysight 33600A Series Waveform Generator",
                "category": "Signal Generation", "model": "Keysight 33622A", "serial": "FGN-2026-015",
                "desc": "Dual-channel arbitrary waveform generator up to 120 MHz with 16-bit DAC, 64 MSa/ch memory, and IQ modulation.",
                "image": IMG["osc"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("Frequency", "Up to 120 MHz"), ("DAC", "16-bit resolution"), ("Waveforms", "Sine, Square, Ramp, Pulse, Arb"), ("Memory", "64 MSa/ch")],
                "max_hours": 4, "requires_approval": False,
            },
            {
                "dept": dept_eee, "lab": lab_instrumentation,
                "name": "Triple-Output Regulated DC Power Supply",
                "category": "Power Supplies", "model": "Keysight E36313A", "serial": "PSU-2026-016",
                "desc": "Triple-output bench PSU: 2× 0–30 V / 1 A + 1× 6 V / 5 A with LAN/USB control and auto-series/parallel tracking.",
                "image": IMG["circuit"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("Output 1 & 2", "0–30 V / 0–1 A"), ("Output 3", "6 V / 5 A fixed"), ("Regulation", "<0.01% load/line"), ("Remote Control", "LAN / USB / GPIB")],
                "max_hours": 4, "requires_approval": False,
            },
            {
                "dept": dept_eee, "lab": lab_instrumentation,
                "name": "Siemens S7-1200 Industrial PLC Training Rig",
                "category": "Industrial Automation", "model": "SIMATIC S7-1200 CPU 1214C", "serial": "PLC-2026-017",
                "desc": "PLC bench with digital/analog I/O expansion, PROFINET Ethernet, and HMI touch panel for ladder-logic programming.",
                "image": IMG["plc"], "status": EquipmentStatus.MAINTENANCE, "is_restricted": True,
                "specs": [("CPU", "1214C AC/DC/Relay"), ("Digital I/O", "14 DI / 10 DO"), ("Analog In", "2 AI 0–10 V"), ("Comms", "PROFINET Ethernet")],
                "max_hours": 4, "requires_approval": True,
            },
            {
                "dept": dept_eee, "lab": lab_instrumentation,
                "name": "Digital Multimeter Pro Set (Fluke 87V)",
                "category": "Measurement & Testing", "model": "Fluke 87V", "serial": "DMM-2026-018",
                "desc": "True-RMS digital multimeter with 1000 V CAT III, temperature measurement, and low-pass filter for VFD.",
                "image": IMG["osc"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("Voltage", "Up to 1000 V DC/AC"), ("Current", "Up to 10 A"), ("Resistance", "Up to 50 MΩ"), ("True RMS", "Yes")],
                "max_hours": 2, "requires_approval": False,
            },
            # ---- MECH / Robotics Lab ----
            {
                "dept": dept_mech, "lab": lab_robotics,
                "name": "Ultimaker S5 Industrial Dual-Extrusion 3D Printer",
                "category": "Additive Manufacturing", "model": "Ultimaker S5 Pro", "serial": "3DP-2026-019",
                "desc": "Dual-extrusion 3D printer with 330×240×300 mm build volume, active levelling, and composite material support.",
                "image": IMG["print3d"], "status": EquipmentStatus.AVAILABLE, "is_restricted": True,
                "specs": [("Build Volume", "330×240×300 mm"), ("Layer Resolution", "≥20 µm"), ("Extrusion", "Dual + PVA support"), ("Materials", "PLA, ABS, PETG, TPU, CF")],
                "max_hours": 6, "requires_approval": True,
            },
            {
                "dept": dept_mech, "lab": lab_robotics,
                "name": "Universal Robots UR5e Collaborative Arm",
                "category": "Industrial Robotics", "model": "Universal Robots UR5e", "serial": "ROB-2026-020",
                "desc": "6-DoF collaborative robot arm, 850 mm reach, 5 kg payload, force/torque wrist sensor, and PolyScope 5 programming.",
                "image": IMG["robot"], "status": EquipmentStatus.AVAILABLE, "is_restricted": True,
                "specs": [("Reach", "850 mm"), ("Payload", "5 kg"), ("DoF", "6"), ("Safety", "ISO/TS 15066 Collaborative")],
                "max_hours": 4, "requires_approval": True,
            },
            {
                "dept": dept_mech, "lab": lab_robotics,
                "name": "Dobot Magician Lite Desktop Robot Arm",
                "category": "Educational Robotics", "model": "Dobot Magician Lite", "serial": "DOB-2026-021",
                "desc": "4-DoF desktop robot arm for pick-and-place, laser engraving, and pen writing with 320 mm reach and suction cup end-effector.",
                "image": IMG["robot"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("Reach", "320 mm"), ("Payload", "500 g"), ("DoF", "4"), ("End-Effectors", "Gripper, Suction, Laser, Pen")],
                "max_hours": 3, "requires_approval": False,
            },
            {
                "dept": dept_mech, "lab": lab_robotics,
                "name": "CNC Router Training Machine (Mini Mill)",
                "category": "CNC Machining", "model": "Genmitsu 4040-PRO CNC Router", "serial": "CNC-2026-022",
                "desc": "400×400 mm 3-axis CNC router for aluminium, wood, and PCB milling with GRBL offline controller.",
                "image": IMG["cnc"], "status": EquipmentStatus.AVAILABLE, "is_restricted": True,
                "specs": [("Work Area", "400×400×110 mm"), ("Spindle", "50 W brushless"), ("Control", "GRBL + LaserGRBL"), ("Materials", "Aluminium, Wood, Acrylic")],
                "max_hours": 4, "requires_approval": True,
            },
            {
                "dept": dept_mech, "lab": lab_robotics,
                "name": "Laser Cutter & Engraver (60 W CO₂)",
                "category": "Laser Fabrication", "model": "xTool P2 55 W", "serial": "LAS-2026-023",
                "desc": "55 W CO₂ laser cutter with 600×305 mm bed, autofocus, passthrough slot, and air assist for wood, acrylic, leather.",
                "image": IMG["laser"], "status": EquipmentStatus.AVAILABLE, "is_restricted": True,
                "specs": [("Laser Power", "55 W CO₂"), ("Work Area", "600×305 mm"), ("Speed", "Up to 600 mm/s"), ("Materials", "Wood, Acrylic, Leather, Glass")],
                "max_hours": 3, "requires_approval": True,
            },
            # ---- Additional cross-dept items ----
            {
                "dept": dept_ece, "lab": lab_iot,
                "name": "Portable USB Digital Oscilloscope (Hantek)",
                "category": "Measurement & Testing", "model": "Hantek 6022BE", "serial": "USB-OSC-024",
                "desc": "2-channel 48 MSa/s USB oscilloscope for field measurements with OpenHantek open-source software.",
                "image": IMG["scope"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("Bandwidth", "20 MHz"), ("Sample Rate", "48 MSa/s"), ("Channels", "2"), ("Interface", "USB 2.0")],
                "max_hours": 2, "requires_approval": False,
            },
            {
                "dept": dept_cse, "lab": lab_ai,
                "name": "Google Coral USB Edge TPU Accelerator (Pack of 5)",
                "category": "Edge AI & Computer Vision", "model": "Coral USB Accelerator G950-01455-01", "serial": "TPU-2026-025",
                "desc": "Pack of 5 Coral USB TPU accelerators providing up to 4 TOPS each for on-device TensorFlow Lite inference.",
                "image": IMG["embedded"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("Performance", "4 TOPS per unit"), ("Interface", "USB 3.0 SuperSpeed"), ("ML Framework", "TensorFlow Lite"), ("Power", "~2 W")],
                "max_hours": 4, "requires_approval": False,
            },
            {
                "dept": dept_eee, "lab": lab_instrumentation,
                "name": "Energy Harvesting & Solar MPPT Evaluation Kit",
                "category": "Renewable Energy", "model": "Texas Instruments EVM430-FR6047", "serial": "SOL-2026-026",
                "desc": "Ultrasonic flow metering + solar MPPT evaluation board for energy-harvesting application development.",
                "image": IMG["circuit"], "status": EquipmentStatus.AVAILABLE, "is_restricted": False,
                "specs": [("MCU", "MSP430FR6047 @ 16 MHz"), ("MPPT", "Integrated 300 mA Buck"), ("Input Voltage", "2.8–5 V"), ("Comms", "UART / SPI / I2C")],
                "max_hours": 4, "requires_approval": False,
            },
            {
                "dept": dept_bio, "lab": lab_bio,
                "name": "UV-Vis Spectrophotometer (200–1100 nm)",
                "category": "Analytical Instruments", "model": "JASCO V-750 UV-Vis", "serial": "SPEC-2026-027",
                "desc": "Double-beam UV-Vis spectrophotometer with 190–1100 nm range, 0.5 nm resolution, and temperature-controlled cell holder.",
                "image": IMG["scope"], "status": EquipmentStatus.AVAILABLE, "is_restricted": True,
                "specs": [("Range", "190–1100 nm"), ("Resolution", "0.5 nm"), ("Stray Light", "<0.00005%T @ 220 nm"), ("Detector", "PMT + PbS dual")],
                "max_hours": 3, "requires_approval": True,
            },
            {
                "dept": dept_bio, "lab": lab_bio,
                "name": "Real-Time PCR System (qPCR)",
                "category": "Molecular Biology", "model": "Bio-Rad CFX96 Dx", "serial": "PCR-2026-028",
                "desc": "96-well real-time quantitative PCR system with 5-colour multiplexing, fast 2 h run time, and CFX Maestro software.",
                "image": IMG["scope"], "status": EquipmentStatus.AVAILABLE, "is_restricted": True,
                "specs": [("Wells", "96 × 0.2 mL"), ("Channels", "5-colour fluorescence"), ("Ramp Rate", "3.5 °C/s"), ("Detection", "0.1 nM Cq sensitivity")],
                "max_hours": 4, "requires_approval": True,
            },
        ]

        created_equipments = []
        for eq_data in equipments_data:
            eq = db.query(Equipment).filter(Equipment.serial_number == eq_data["serial"]).first()
            if not eq:
                eq = Equipment(
                    department_id=eq_data["dept"].id,
                    laboratory_id=eq_data["lab"].id,
                    name=eq_data["name"],
                    category=eq_data["category"],
                    model_number=eq_data["model"],
                    serial_number=eq_data["serial"],
                    description=eq_data["desc"],
                    image_url=eq_data["image"],
                    status=eq_data["status"],
                    is_restricted=eq_data["is_restricted"],
                    total_quantity=2,
                    available_quantity=2 if eq_data["status"] == EquipmentStatus.AVAILABLE else 0,
                )
                db.add(eq)
                db.flush()

                for s_name, s_val in eq_data["specs"]:
                    spec = EquipmentSpecification(equipment_id=eq.id, spec_name=s_name, spec_value=s_val)
                    db.add(spec)

                pol = EquipmentAccessPolicy(
                    equipment_id=eq.id,
                    allowed_roles="STUDENT,FACULTY,ADMIN",
                    max_booking_hours=eq_data["max_hours"],
                    requires_approval=eq_data["requires_approval"],
                    auto_approve_eligible=not eq_data["requires_approval"],
                )
                db.add(pol)

                # Availability rules Mon-Sat 09:00-18:00
                for day in range(6):
                    rule = AvailabilityRule(
                        equipment_id=eq.id,
                        day_of_week=day,
                        start_time=time(9, 0),
                        end_time=time(18, 0),
                        is_available=True,
                    )
                    db.add(rule)

                # Create 2 EquipmentUnits with QR tokens per equipment
                for unit_num in range(1, 3):
                    serial_base = eq_data["serial"].replace("-", "")
                    unit = EquipmentUnit(
                        equipment_id=eq.id,
                        unit_serial=f"{eq_data['serial']}-U{unit_num:02d}",
                        qr_code_token=str(uuid.uuid4()).replace("-", ""),
                        is_functional=eq_data["status"] != EquipmentStatus.MAINTENANCE,
                        is_available=eq_data["status"] == EquipmentStatus.AVAILABLE,
                    )
                    db.add(unit)

            created_equipments.append(eq)

        db.flush()

        # ------------------------------------------------------------------ #
        # ------------------------------------------------------------------ #
        # 5. Project requests & bookings (if not already present)
        # ------------------------------------------------------------------ #
        if db.query(Booking).count() == 0 and len(created_equipments) >= 20:
            project_alex = ProjectRequest(
                student_id=student_alex.id,
                title="Autonomous Precision Irrigation Telemetry Node",
                description="Edge-based IoT solar mesh using ESP32, environmental sensors, and LoRaWAN backhaul for agricultural soil monitoring.",
                deadline=now + timedelta(days=20),
            )
            db.add(project_alex)

            project_priya = ProjectRequest(
                student_id=student_priya.id,
                title="Federated Learning on Edge AI Cluster",
                description="Federated model training across Jetson Orin Nano devices with privacy-preserving aggregation.",
                deadline=now + timedelta(days=35),
            )
            db.add(project_priya)
            db.flush()

            # Confirmed booking
            booking_alex = Booking(
                equipment_id=created_equipments[0].id,  # ESP32
                student_id=student_alex.id,
                project_request_id=project_alex.id,
                start_time=now + timedelta(days=1, hours=2),
                end_time=now + timedelta(days=1, hours=5),
                status=BookingStatus.CONFIRMED,
                purpose="Firmware flashing and low-power sleep profiling.",
            )
            db.add(booking_alex)

            # Pending booking (awaiting faculty approval)
            booking_pending = Booking(
                equipment_id=created_equipments[6].id,  # FPGA
                student_id=student_alex.id,
                project_request_id=project_alex.id,
                start_time=now + timedelta(days=2, hours=1),
                end_time=now + timedelta(days=2, hours=4),
                status=BookingStatus.PENDING,
                purpose="Synthesis and implementation of hardware acceleration filters.",
            )
            db.add(booking_pending)

            # Priya's AI booking
            booking_priya = Booking(
                equipment_id=created_equipments[10].id,  # Jetson Orin Nano
                student_id=student_priya.id,
                project_request_id=project_priya.id,
                start_time=now + timedelta(days=3, hours=4),
                end_time=now + timedelta(days=3, hours=8),
                status=BookingStatus.PENDING,
                purpose="Benchmarking federated learning inference on edge TPU.",
            )
            db.add(booking_priya)

            # Jordan's robotics booking
            booking_jordan = Booking(
                equipment_id=created_equipments[19].id,  # UR5e Robot Arm
                student_id=student_jordan.id,
                start_time=now + timedelta(days=4, hours=1),
                end_time=now + timedelta(days=4, hours=4),
                status=BookingStatus.PENDING,
                purpose="Pick-and-place task programming for assembly automation study.",
            )
            db.add(booking_jordan)

        # ------------------------------------------------------------------ #
        # 6. Maintenance record (PLC)
        # ------------------------------------------------------------------ #
        if db.query(MaintenanceRecord).count() == 0 and len(created_equipments) > 16:
            plc_eq = created_equipments[16]  # Siemens PLC (index 16, 0-based)
            maint_plc = MaintenanceRecord(
                equipment_id=plc_eq.id,
                scheduled_by_id=faculty_eee.id,
                start_time=now - timedelta(days=1),
                end_time=now + timedelta(days=3),
                reason="Firmware security update and relay contact calibration.",
                status=MaintenanceStatus.IN_PROGRESS,
                notes="Vendor field technician scheduled for firmware flashing.",
            )
            db.add(maint_plc)

        # ------------------------------------------------------------------ #
        # 7. Notifications
        # ------------------------------------------------------------------ #
        if db.query(Notification).count() == 0:
            for user, msg in [
                (student_alex, "Your student profile STU-2026-081 is active. Discover equipment and reserve lab slots."),
                (student_priya, "Welcome Priya! Explore AI & HPC equipment in the CSE department."),
                (student_jordan, "Welcome Jordan! Robotics Lab resources are now available for booking."),
                (faculty_ece, "ECE equipment catalogue has been updated with 9 new items."),
            ]:
                db.add(Notification(
                    user_id=user.id,
                    title="Welcome to LabLink",
                    message=msg,
                    type=NotificationType.SYSTEM,
                    is_read=False,
                ))

        db.commit()
        print(f"Database successfully seeded with {len(equipments_data)} equipment items and realistic academic data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
