import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getDashboardStats } from '../api';
import type { DashboardStats } from '../types';

const StatCard = ({ label, value, color }: { label: string; value: string | number; color: string }) => {
  return (
    <div className={`bg-slate-900 border border-slate-700 rounded-lg p-6 transition-shadow duration-200 hover:shadow-lg hover:shadow-slate-900/50`}>
      <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getDashboardStats()
      .then((data) => {
        if (active) {
          setStats(data);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
        {error ?? 'Failed to load dashboard stats'}
      </div>
    );
  }

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(stats.total_value);

  const formattedCost = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(stats.total_cost);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={stats.total_items} color="text-slate-200" />
        <StatCard label="In Stock" value={stats.in_stock} color="text-green-400" />
        <StatCard label="Low Stock" value={stats.low_stock} color="text-amber-400" />
        <StatCard label="Out of Stock" value={stats.out_of_stock} color="text-red-400" />
        <StatCard label="Total Value" value={formattedValue} color="text-blue-400" />
        <StatCard label="Total Cost" value={formattedCost} color="text-purple-400" />
        <StatCard label="Inventories" value={stats.inventory_count} color="text-indigo-400" />
        <StatCard label="Categories" value={stats.category_count} color="text-cyan-400" />
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Summary */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Inventory Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">In Stock:</span>
              <span className="text-green-400 font-semibold">{stats.in_stock} items</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Low Stock:</span>
              <span className="text-amber-400 font-semibold">{stats.low_stock} items</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Out of Stock:</span>
              <span className="text-red-400 font-semibold">{stats.out_of_stock} items</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Items:</span>
              <span className="text-slate-200 font-semibold">{stats.total_items}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Inventories:</span>
              <span className="text-indigo-400 font-semibold">{stats.inventory_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Categories:</span>
              <span className="text-cyan-400 font-semibold">{stats.category_count}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
