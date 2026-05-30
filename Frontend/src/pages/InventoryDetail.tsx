import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Folder, Loader2, Plus } from 'lucide-react';
import { getCategories, getInventory, createCategory } from '../api';
import type { Category, Inventory } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

export default function InventoryDetail() {
  const { invId } = useParams<{ invId: string }>();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!invId) {
      setLoading(false);
      setError('Inventory not found');
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([getInventory(invId), getCategories(invId)])
      .then(([inventoryData, categoryData]) => {
        if (active) {
          setInventory(inventoryData);
          setCategories(categoryData);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load inventory');
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
  }, [invId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">{error ?? 'Inventory not found'}</p>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !invId) return;
    
    setIsSubmitting(true);
    try {
      const newCat = await createCategory(invId, newName, newDescription);
      setCategories((prev) => [...prev, newCat]);
      // Update inventory's category count for completeness, though it's optional here
      setInventory(prev => prev ? { ...prev, category_count: prev.category_count + 1 } : prev);
      setIsDialogOpen(false);
      setNewName('');
      setNewDescription('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
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
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/inventories" className="hover:text-indigo-400">
          Inventories
        </Link>
        <ChevronRight size={16} />
        <span className="text-slate-200">{inventory.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{inventory.name}</h1>
          <p className="text-slate-400">{inventory.description}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium">
              <Plus size={20} />
              New Category
            </button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a new category to {inventory.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Electronics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>
              <DialogFooter>
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
                  disabled={isSubmitting || !newName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/inventories/${inventory.id}/${cat.id}`}
            className="bg-slate-900 border border-slate-700 rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-900/30 hover:border-indigo-500/30"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{cat.name}</h3>
                <p className="text-sm text-slate-400">{cat.description}</p>
              </div>
              <Folder className="text-indigo-400 flex-shrink-0" size={24} />
            </div>

            <div className="border-t border-slate-700 pt-4">
              <p className="text-sm text-slate-400 mb-1">Items in Category</p>
              <p className="text-2xl font-bold text-blue-400">{cat.item_count}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
