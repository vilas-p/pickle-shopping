export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  ordersLast30Days: number;
  revenueLast30Days: string;
  lowStockItems: number;
  unhandledContacts: number;
  pendingReviews: number;
  ordersByStatus: Record<string, number>;
}