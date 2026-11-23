export type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: string | null;
  student_id?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  laboratories: Laboratory[];
}

export interface Laboratory {
  id: string;
  department_id: string;
  name: string;
  room_number: string;
  building: string;
  operating_hours: string;
  faculty_coordinator_id?: string;
}

export type EquipmentStatus = "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "RETIRED";

export interface EquipmentSpecification {
  id: string;
  spec_name: string;
  spec_value: string;
}

export interface EquipmentAccessPolicy {
  id: string;
  allowed_roles: string;
  max_booking_hours: number;
  requires_approval: boolean;
  auto_approve_eligible: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  department_id: string;
  laboratory_id: string;
  model_number?: string;
  serial_number?: string;
  description?: string;
  image_url?: string;
  status: EquipmentStatus;
  is_restricted: boolean;
  total_quantity: number;
  available_quantity: number;
  department_name?: string;
  laboratory_name?: string;
  specifications?: EquipmentSpecification[];
  access_policy?: EquipmentAccessPolicy;
}

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "CHECKED_OUT"
  | "RETURNED"
  | "COMPLETED";

export interface Booking {
  id: string;
  equipment_id: string;
  equipment_name?: string;
  equipment_category?: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  department_name?: string;
  laboratory_name?: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  purpose: string;
  rejection_reason?: string;
  project_title?: string;
  created_at: string;
}

export interface AlternativeSlot {
  start_time: string;
  end_time: string;
  score: number;
  feasibility: boolean;
  explanation: string;
  equipment_id: string;
  equipment_name: string;
}

export interface SchedulingRecommendationResponse {
  is_requested_slot_available: boolean;
  recommended_slot?: AlternativeSlot | null;
  alternative_slots: AlternativeSlot[];
  conflict_reason?: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  metadata_json?: string;
  created_at: string;
}

export interface ExtractedRequirement {
  category: string;
  name_hint?: string;
  specifications: Record<string, string>;
  reason?: string;
}

export interface ProjectAnalysis {
  project_title: string;
  summary: string;
  deadline?: string;
  extracted_requirements: ExtractedRequirement[];
  compatibility_notes: string[];
}

export interface EquipmentMatchResult {
  equipment_id: string;
  equipment_name: string;
  category: string;
  department_name: string;
  laboratory_name: string;
  is_available: boolean;
  status: string;
  compatibility_score: number;
  relevance_explanation: string;
}
