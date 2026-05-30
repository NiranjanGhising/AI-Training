import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Loader2, Plus } from 'lucide-react';
import { getCategories, getInventory, getItems, createItem } from '../api';
import type { Category, Inventory, Item, ItemCreate } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

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

export default function CategoryDetail() {
  const { invId, catId } = useParams<{ invId: string; catId: string }>();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New item form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<ItemCreate, 'category_id'>>({
    name: '',
    sku: '',
    quantity: 0,
    min_stock: 0,
    price: 0,
    cost: 0,
    supplier: '',
    unit: 'piece',
    status: 'in-stock',
  });

  useEffect(() => {
    if (!invId || !catId) {
      setLoading(false);
      setError('Category not found');
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([getInventory(invId), getCategories(invId), getItems({ cat_id: catId })])
      .then(([inventoryData, categoriesData, itemsData]) => {
        if (!active) return;
        setInventory(inventoryData);
        setCategory(categoriesData.find((cat) => cat.id === catId) ?? null);
        setItems(itemsData);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load category');
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
  }, [invId, catId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!inventory || !category) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">{error ?? 'Category not found'}</p>
      </div>
    );
  }

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catId) return;
    setIsSubmitting(true);
    try {
      const newItem = await createItem({
        ...formData,
        category_id: catId,
      });
      setItems(prev => [...prev, newItem]);
      setIsDialogOpen(false);
      setFormData({
        name: '',
        sku: '',
        quantity: 0,
        min_stock: 0,
        price: 0,
        cost: 0,
        supplier: '',
        unit: 'piece',
        status: 'in-stock',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 overflow-x-auto">
        <Link to="/inventories" className="hover:text-indigo-400">
          Inventories
        </Link>
        <ChevronRight size={16} className="flex-shrink-0" />
        <Link to={`/inventories/${invId}`} className="hover:text-indigo-400">
          {inventory.name}
        </Link>
        <ChevronRight size={16} className="flex-shrink-0" />
        <span className="text-slate-200">{category.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{category.name}</h1>
          <p className="text-slate-400">{category.description}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium">
              <Plus size={20} />
              New Item
            </button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Item</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a new item to {category.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateItem} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData(f => ({ ...f, sku: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.quantity}
                    onChange={(e) => setFormData(f => ({ ...f, quantity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Min Stock</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.min_stock}
                    onChange={(e) => setFormData(f => ({ ...f, min_stock: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Price</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(f => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Cost</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData(f => ({ ...f, cost: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier || ''}
                    onChange={(e) => setFormData(f => ({ ...f, supplier: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData(f => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(f => ({ ...f, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim() || !formData.sku.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Item
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items Table */}
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
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-white">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{item.sku}</td>
                  <td className="px-6 py-4 text-sm text-slate-200 font-medium">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{item.min_stock}</td>
                  <td className="px-6 py-4 text-sm text-green-400">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">${item.cost.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{item.supplier}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{item.unit}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(item.status)}`}>
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

      {/* Summary */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Category Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Total Items</p>
            <p className="text-2xl font-bold text-slate-200">{items.length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Total Quantity</p>
            <p className="text-2xl font-bold text-blue-400">{items.reduce((sum, item) => sum + item.quantity, 0)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-green-400">
              ${items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-purple-400">
              ${items.reduce((sum, item) => sum + item.cost * item.quantity, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
