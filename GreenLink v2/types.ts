
export enum UserRole {
  LANDING = 'LANDING',
  NETWORK = 'NETWORK',
  CONSUMER = 'CONSUMER',
  TECHNICIAN = 'TECHNICIAN',
  RECYCLER = 'RECYCLER',
  NGO_GOV = 'NGO_GOV'
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'REPAIR' | 'RECYCLE' | 'COMMUNITY' | 'MILESTONE';
  unlockedAt?: string;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  avatar?: string;
  verificationStep?: 'DOC_UPLOAD' | 'PENDING_REVIEW' | 'COMPLETE';
  profileData?: {
    licenseId?: string;
    organization?: string;
    address?: string;
    specialties?: string[];
  };
}

export interface UserStats {
  points: number;
  level: number;
  rank: string;
  nextLevelAt: number;
  badges: Badge[];
}

export type DeviceCategory = 'Mobile' | 'Computing' | 'Home Appliances' | 'Entertainment' | 'Other';

export interface Device {
  id: string;
  type: string;
  category: DeviceCategory;
  age: string;
  condition: string;
  status: 'Pickup-Requested' | 'Awaiting-Logistics' | 'In-Transit' | 'In-Repair' | 'Repaired' | 'Not-Repairable' | 'Recycled' | 'Verified-Repair' | 'Verified-EOL';
  owner: string;
  impactScore?: number;
  image?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'SUCCESS' | 'INFO' | 'WARNING';
  isRead: boolean;
}
