import { useEffect, useState } from 'react';
import { Search, Package, Loader2 } from 'lucide-react';
import { getItems } from '../api';
import type { Item } from '../types';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'in-stock':
      return 'bg-green-500/10 text-green-400 border border-green-500/30';
    case 'low-stock':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    case 'out-of-stock':
      return 'bg-red-500/10 text-red-400 border border-red-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'in-stock':
      return 'In Stock';
    case 'low-stock':
      return 'Low Stock';
    case 'out-of-stock':
      return 'Out of Stock';
    default:
      return status;
  }
};

export default function AllItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getItems()
      .then((data) => {
        if (active) {
          setItems(data);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load items');
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

  const displayItems = searchQuery.trim()
    ? items.filter((item) => {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
      })
    : items;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Header with Search */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-4">All Items</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-400">
        Showing <span className="text-indigo-400 font-semibold">{displayItems.length}</span> item
        {displayItems.length !== 1 ? 's' : ''}
      </div>

      {/* Items Table */}
      {displayItems.length > 0 ? (
        <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">SKU</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Quantity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Min Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Cost</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Supplier</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Unit</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {displayItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{item.sku}</td>
                    <td className="px-6 py-4 text-sm text-slate-200 font-medium">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{item.min_stock}</td>
                    <td className="px-6 py-4 text-sm text-green-400">${item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">${item.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">{item.supplier}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{item.unit}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadge(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.last_updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900 border border-slate-700 rounded-lg">
          <Package className="text-slate-600 mb-4" size={48} />
          <p className="text-slate-400 text-lg mb-1">No items found</p>
          <p className="text-slate-500 text-sm">Try adjusting your search query</p>
        </div>
      )}

      {/* Summary Stats */}
      {displayItems.length > 0 && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Search Results Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Items</p>
              <p className="text-2xl font-bold text-slate-200">{displayItems.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Quantity</p>
              <p className="text-2xl font-bold text-blue-400">{displayItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-green-400">
                ${displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-purple-400">
                ${displayItems.reduce((sum, item) => sum + item.cost * item.quantity, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
