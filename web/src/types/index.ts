export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type WasteCategory = 'ORGANIC' | 'PLASTIC' | 'PAPER';

export type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface Report {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: WasteCategory;
  status: ReportStatus;
  image_url: string;
  latitude: number;
  longitude: number;
  address?: string;
  ai_prediction?: string;
  ai_confidence?: number;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface StatusCounts {
  pending: number;
  in_progress: number;
  completed: number;
  rejected: number;
}

export interface CategoryCounts {
  organic: number;
  plastic: number;
  paper: number;
}

export interface MonthlyStat {
  month: string;
  total: number;
}

export interface DashboardStats {
  total_reports: number;
  total_users: number;
  status_counts: StatusCounts;
  category_counts: CategoryCounts;
  monthly_trend: MonthlyStat[];
  recent_reports: Array<{
    id: number;
    title: string;
    category: WasteCategory;
    status: ReportStatus;
    image_url: string;
    latitude: number;
    longitude: number;
    address?: string;
    ai_prediction?: string;
    ai_confidence?: number;
    created_at: string;
    user_name: string;
  }>;
}

export interface PredictionResult {
  category: string;
  confidence: number;
  probabilities: Record<string, number>;
  message: string;
}

