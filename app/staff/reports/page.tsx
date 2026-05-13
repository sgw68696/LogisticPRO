"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, ShoppingCart, Warehouse, FileText, TrendingUp, TrendingDown,
  BarChart3, PieChart, Activity
} from 'lucide-react';

export default function StaffReports() {
  const reportCards = [
    {
      title: "Shipment Summary",
      icon: Package,
      stats: [
        { label: "Total Shipments", value: "1,245", change: "+12%", trend: "up" },
        { label: "Delivered", value: "1,089", change: "+8%", trend: "up" },
        { label: "In Transit", value: "156", change: "-3%", trend: "down" },
        { label: "Pending", value: "45", change: "+5%", trend: "up" },
      ],
      color: "blue"
    },
    {
      title: "Order Summary",
      icon: ShoppingCart,
      stats: [
        { label: "Total Orders", value: "892", change: "+15%", trend: "up" },
        { label: "Completed", value: "756", change: "+12%", trend: "up" },
        { label: "Processing", value: "89", change: "+4%", trend: "up" },
        { label: "Returned", value: "12", change: "-2%", trend: "down" },
      ],
      color: "green"
    },
    {
      title: "Inventory Report",
      icon: Warehouse,
      stats: [
        { label: "Total Items", value: "184,500", change: "+8%", trend: "up" },
        { label: "In Stock", value: "162,300", change: "+6%", trend: "up" },
        { label: "Low Stock", value: "23", change: "-15%", trend: "down" },
        { label: "Out of Stock", value: "8", change: "-20%", trend: "down" },
      ],
      color: "purple"
    },
    {
      title: "Invoice Report",
      icon: FileText,
      stats: [
        { label: "Total Invoices", value: "456", change: "+10%", trend: "up" },
        { label: "Paid", value: "389", change: "+8%", trend: "up" },
        { label: "Unpaid", value: "45", change: "+5%", trend: "up" },
        { label: "Overdue", value: "22", change: "-8%", trend: "down" },
      ],
      color: "orange"
    },
  ];

  const getStatColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getCardColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200',
      orange: 'bg-orange-50 border-orange-200',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-50 border-gray-200';
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
    };
    return colors[color as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <PageWrapper 
      title="Reports" 
      description="View available reports and analytics"
    >
      <div className="space-y-6">
        {/* Report Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportCards.map((report, index) => {
            const Icon = report.icon;
            return (
              <Card key={index} className={`border ${getCardColor(report.color)}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${getIconColor(report.color)}`} />
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {report.stats.map((stat, statIndex) => (
                      <div key={statIndex} className="space-y-1">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-semibold">{stat.value}</span>
                          <div className={`flex items-center gap-1 text-sm ${getStatColor(stat.trend)}`}>
                            {getTrendIcon(stat.trend)}
                            <span>{stat.change}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-lg">Monthly Performance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="font-semibold">₹18.5L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Month</span>
                  <span className="font-semibold">₹16.2L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Growth</span>
                  <span className="text-green-600 font-semibold">+14.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <PieChart className="w-6 h-6 text-green-600" />
                <CardTitle className="text-lg">Service Distribution</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Express</span>
                  <span className="font-semibold">45%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Standard</span>
                  <span className="font-semibold">35%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Freight</span>
                  <span className="font-semibold">20%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-purple-600" />
                <CardTitle className="text-lg">Efficiency Metrics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">On-Time Delivery</span>
                  <span className="font-semibold">94.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Delivery Time</span>
                  <span className="font-semibold">2.3 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                  <span className="font-semibold">4.7/5.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
