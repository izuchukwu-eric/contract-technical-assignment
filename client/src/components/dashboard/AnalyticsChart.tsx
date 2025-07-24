'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllTransactions, useUserTransactions, useAllUsers } from '@/hooks/useContractData';
import { useWeb3 } from '@/contexts/Web3Provider';
import { UserRole } from '@/types/contract';
import { WalletAlert } from '@/components/ui/WalletAlert';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
  label: string;
}

interface AnalyticsChartProps {
  userRole?: number;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ userRole }) => {
  const { address, isConnected } = useWeb3();
  const [selectedMetric, setSelectedMetric] = useState('volume');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Determine which data source to use based on user role
  const isAdminOrManager = userRole === UserRole.Admin || userRole === UserRole.Manager;
  
  // Always call both hooks but use appropriate data
  const { data: allTransactions, isLoading: allTxLoading } = useAllTransactions();
  const { data: userTransactions, isLoading: userTxLoading } = useUserTransactions(address || undefined);
  const { data: users, isLoading: usersLoading } = useAllUsers();
  
  // Use appropriate transaction data
  const transactions = isAdminOrManager ? allTransactions : userTransactions;
  const transactionsLoading = isAdminOrManager ? allTxLoading : userTxLoading;
  
  // Check if wallet is connected
  if (!isConnected) {
    return <WalletAlert />;
  }

  // Ensure regular users don't access the "users" metric
  useEffect(() => {
    if (!isAdminOrManager && selectedMetric === 'users') {
      setSelectedMetric('volume');
    }
  }, [isAdminOrManager, selectedMetric]);

  // Process real contract data - this must be called on every render
  const data = useMemo(() => {
    if (transactionsLoading || usersLoading || !transactions) {
      return [];
    }

    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const dataPoints: DataPoint[] = [];
    
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (days - 1));

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayStartTimestamp = Math.floor(dayStart.getTime() / 1000);
      const dayEndTimestamp = Math.floor(dayEnd.getTime() / 1000);

      let value = 0;

      if (selectedMetric === 'volume') {
        // Calculate total transaction volume for this day
        const dayTransactions = transactions.filter(tx => {
          const txTimestamp = Number(tx.timestamp);
          return txTimestamp >= dayStartTimestamp && txTimestamp <= dayEndTimestamp;
        });
        
        value = dayTransactions.reduce((sum, tx) => {
          // Convert from wei to ether (assuming amounts are in wei)
          const ethAmount = Number(tx.amount) / 1e18;
          return sum + ethAmount;
        }, 0);
        
      } else if (selectedMetric === 'transactions') {
        // Count transactions for this day
        value = transactions.filter(tx => {
          const txTimestamp = Number(tx.timestamp);
          return txTimestamp >= dayStartTimestamp && txTimestamp <= dayEndTimestamp;
        }).length;
        
      } else if (selectedMetric === 'users') {
        // Count unique active users for this day (users who made transactions)
        const dayTransactions = transactions.filter(tx => {
          const txTimestamp = Number(tx.timestamp);
          return txTimestamp >= dayStartTimestamp && txTimestamp <= dayEndTimestamp;
        });
        
        const uniqueUsers = new Set();
        dayTransactions.forEach(tx => {
          uniqueUsers.add(tx.from);
          uniqueUsers.add(tx.to);
        });
        
        value = uniqueUsers.size;
      }

      dataPoints.push({
        date: currentDate.toISOString().split('T')[0],
        value,
        label: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    return dataPoints;
  }, [transactions, users, selectedMetric, selectedPeriod, transactionsLoading, usersLoading]);

  const isLoading = transactionsLoading || usersLoading;
  
  // Handle empty data
  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0;
  const minValue = data.length > 0 ? Math.min(...data.map(d => d.value)) : 0;
  const range = maxValue - minValue || 1; // Prevent division by zero

  const getMetricInfo = (metric: string) => {
    switch (metric) {
      case 'volume':
        return {
          title: 'Transaction Volume',
          icon: DollarSign,
          color: 'from-blue-500 to-purple-600',
          fillColor: 'from-blue-500/20 to-purple-600/20',
          strokeColor: '#6366f1',
          format: (value: number) => {
            if (value >= 1) return `${value.toFixed(2)} ETH`;
            if (value >= 0.001) return `${(value * 1000).toFixed(1)}m ETH`;
            if (value > 0) return `${(value * 1000000).toFixed(0)}μ ETH`;
            return '0 ETH';
          }
        };
      case 'users':
        return {
          title: 'Active Users',
          icon: Users,
          color: 'from-emerald-500 to-teal-600',
          fillColor: 'from-emerald-500/20 to-teal-600/20',
          strokeColor: '#10b981',
          format: (value: number) => value.toFixed(0)
        };
      case 'transactions':
        return {
          title: 'Transaction Count',
          icon: Activity,
          color: 'from-orange-500 to-red-600',
          fillColor: 'from-orange-500/20 to-red-600/20',
          strokeColor: '#f97316',
          format: (value: number) => value.toFixed(0)
        };
      default:
        return {
          title: 'Analytics',
          icon: BarChart3,
          color: 'from-slate-500 to-slate-600',
          fillColor: 'from-slate-500/20 to-slate-600/20',
          strokeColor: '#64748b',
          format: (value: number) => value.toFixed(0)
        };
    }
  };

  const metricInfo = getMetricInfo(selectedMetric);
  const MetricIcon = metricInfo.icon;

  // Calculate percentage change
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const percentChange = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 
    (lastValue > 0 ? 100 : 0); // If starting from 0, show 100% if we have any value, otherwise 0
  const isPositive = percentChange >= 0;

  // Generate SVG path for area chart
  const generatePath = (data: DataPoint[], type: 'line' | 'area' = 'line') => {
    if (data.length === 0) return '';

    const width = 800;
    const height = 200;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + ((maxValue - point.value) / range) * chartHeight;
      return { x, y };
    });

    if (type === 'area') {
      const pathData = points.reduce((path, point, index) => {
        if (index === 0) {
          return `M ${point.x} ${height - padding} L ${point.x} ${point.y}`;
        }
        return `${path} L ${point.x} ${point.y}`;
      }, '');
      return `${pathData} L ${points[points.length - 1].x} ${height - padding} Z`;
    } else {
      return points.reduce((path, point, index) => {
        if (index === 0) {
          return `M ${point.x} ${point.y}`;
        }
        return `${path} L ${point.x} ${point.y}`;
      }, '');
    }
  };

  const linePath = generatePath(data, 'line');
  const areaPath = generatePath(data, 'area');

  // Show loading state
  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-xl" />
              <div>
                <div className="h-6 bg-slate-200 rounded w-40 mb-1" />
                <div className="h-4 bg-slate-200 rounded w-32" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="h-8 bg-slate-200 rounded w-32 animate-pulse" />
            <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-6 bg-slate-200 rounded w-16 mx-auto animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded w-12 mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no data
  if (data.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${metricInfo.color} rounded-xl flex items-center justify-center`}>
              <MetricIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">{metricInfo.title}</CardTitle>
              <p className="text-sm text-slate-600">Analytics Overview</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-medium text-slate-900 mb-2">No Data Available</h3>
            <p className="text-sm text-slate-500">
              {selectedMetric === 'volume' && 'No transactions have been made yet.'}
              {selectedMetric === 'transactions' && 'No transactions have been recorded yet.'}
              {selectedMetric === 'users' && 'No user activity has been recorded yet.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${metricInfo.color} rounded-xl flex items-center justify-center`}>
              <MetricIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">{metricInfo.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600">Analytics Overview</span>
                <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="font-medium">{Math.abs(percentChange).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-48 bg-white border-slate-200">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="volume" className="cursor-pointer">Transaction Volume</SelectItem>
                {isAdminOrManager && (
                  <SelectItem value="users" className="cursor-pointer">Active Users</SelectItem>
                )}
                <SelectItem value="transactions" className="cursor-pointer">Transaction Count</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32 bg-white border-slate-200">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="7d" className="cursor-pointer">7 days</SelectItem>
                <SelectItem value="30d" className="cursor-pointer">30 days</SelectItem>
                <SelectItem value="90d" className="cursor-pointer">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Current Value Display */}
          <div className="flex items-end gap-4">
            <div>
              <h3 className="text-3xl font-bold text-slate-900">
                {metricInfo.format(lastValue)}
              </h3>
              <p className="text-sm text-slate-600">Current Value</p>
            </div>
            <div className="text-sm text-slate-500">
              vs {metricInfo.format(firstValue)} {selectedPeriod === '7d' ? 'last week' : selectedPeriod === '30d' ? 'last month' : 'last quarter'}
            </div>
          </div>

          {/* Chart Container */}
          <div className="relative">
            <div className="w-full h-64 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 800 200" className="absolute inset-0">
                {/* Grid Lines */}
                <defs>
                  <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                  </pattern>
                  <linearGradient id={`areaGradient-${selectedMetric}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={metricInfo.strokeColor} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={metricInfo.strokeColor} stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Area Fill */}
                <path
                  d={areaPath}
                  fill={`url(#areaGradient-${selectedMetric})`}
                  className="transition-all duration-500"
                />
                
                {/* Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={metricInfo.strokeColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
                
                {/* Data Points */}
                {data.map((point, index) => {
                  const x = 20 + (index / (data.length - 1)) * 760;
                  const y = 20 + ((maxValue - point.value) / range) * 160;
                  
                  return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="white"
                        stroke={metricInfo.strokeColor}
                        strokeWidth="2"
                        className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                      >
                        <title>{point.label}: {metricInfo.format(point.value)}</title>
                      </circle>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-3 px-5 text-xs text-slate-500">
              {data.filter((_, index) => index % Math.ceil(data.length / 6) === 0).map((point, index) => (
                <span key={index}>{point.label}</span>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">{metricInfo.format(maxValue)}</p>
              <p className="text-xs text-slate-500">Peak Value</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">{metricInfo.format(minValue)}</p>
              <p className="text-xs text-slate-500">Lowest Value</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">
                {data.length > 0 ? metricInfo.format(data.reduce((sum, d) => sum + d.value, 0) / data.length) : metricInfo.format(0)}
              </p>
              <p className="text-xs text-slate-500">Average</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500">Change</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 