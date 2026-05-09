import { APP_CONFIG } from "@/config/appConfig";
import { mockAnalytics, mockShipments, mockDrivers, mockVehicles, mockCustomers } from "@/data/mockData";

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
}

export const getShipmentReport = async (filters?: ReportFilters) => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const statusCounts = mockShipments.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      summary: {
        total: mockShipments.length,
        growth: 12.5,
        deliveryRate: 94.5,
      },
      byStatus: mockAnalytics.statusDistribution.map(item => ({
        name: item.status,
        value: item.count,
      })),
      byRegion: mockAnalytics.revenueByRegion.map(item => ({
        name: item.region,
        value: Math.floor(item.revenue / 1000),
      })),
      trends: mockAnalytics.shipmentTrend.map(item => ({
        date: item.date,
        shipments: item.shipments,
      })),
    };
  }
  
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/reports/shipments?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};

export const getDriverReport = async (filters?: ReportFilters) => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      totalDrivers: mockDrivers.length,
      activeDrivers: mockDrivers.filter(d => d.status === 'Active' || d.status === 'On Duty').length,
      averageRating: (mockDrivers.reduce((sum, d) => sum + d.rating, 0) / mockDrivers.length).toFixed(1),
      totalTrips: mockDrivers.reduce((sum, d) => sum + d.totalTrips, 0),
      performanceData: mockAnalytics.driverPerformance,
    };
  }
  
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/reports/drivers?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};

export const getFleetReport = async (filters?: ReportFilters) => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      summary: {
        utilization: 78.3,
      },
      byStatus: [
        { name: 'Available', value: mockVehicles.filter(v => v.status === 'Available').length },
        { name: 'On Route', value: mockVehicles.filter(v => v.status === 'On Route').length },
        { name: 'Maintenance', value: mockVehicles.filter(v => v.status === 'Maintenance').length },
        { name: 'Inactive', value: mockVehicles.filter(v => v.status === 'Inactive').length },
      ],
      byType: mockAnalytics.fleetUtilization.map(item => ({
        name: item.type,
        value: item.total,
      })),
      performance: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(2024, 11, 17 + i).toISOString().split('T')[0],
        trips: Math.floor(Math.random() * 20) + 10,
        distance: Math.floor(Math.random() * 500) + 200,
      })),
    };
  }
  
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/reports/fleet?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};

export const getRevenueReport = async (filters?: ReportFilters) => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const totalRevenue = mockAnalytics.monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
    const totalExpenses = mockAnalytics.monthlyRevenue.reduce((sum, m) => sum + m.expenses, 0);
    
    return {
      summary: {
        total: totalRevenue,
        growth: 15.3,
      },
      trends: mockAnalytics.monthlyRevenue.map(item => ({
        date: item.month,
        revenue: item.revenue,
        expenses: item.expenses,
      })),
      byService: [
        { name: 'Express', value: Math.floor(totalRevenue * 0.4) },
        { name: 'Standard', value: Math.floor(totalRevenue * 0.35) },
        { name: 'Freight', value: Math.floor(totalRevenue * 0.25) },
      ],
      expenses: [
        { name: 'Fuel', value: Math.floor(totalExpenses * 0.3) },
        { name: 'Maintenance', value: Math.floor(totalExpenses * 0.2) },
        { name: 'Salaries', value: Math.floor(totalExpenses * 0.4) },
        { name: 'Other', value: Math.floor(totalExpenses * 0.1) },
      ],
    };
  }
  
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/reports/revenue?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};

export const getCustomerReport = async (filters?: ReportFilters) => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      totalCustomers: mockCustomers.length,
      businessCustomers: mockCustomers.filter(c => c.type === 'Business').length,
      individualCustomers: mockCustomers.filter(c => c.type === 'Individual').length,
      totalOutstanding: mockCustomers.reduce((sum, c) => sum + c.outstandingBalance, 0),
      topCustomers: mockCustomers
        .sort((a, b) => b.totalShipments - a.totalShipments)
        .slice(0, 10)
        .map(c => ({ name: c.name, shipments: c.totalShipments, type: c.type })),
    };
  }
  
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/reports/customers?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};
