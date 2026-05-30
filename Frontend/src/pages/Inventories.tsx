import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Archive, Loader2 } from 'lucide-react';
import { getInventories, createInventory } from '../api';
import type { Inventory } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

export default function Inventories() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getInventories()
      .then((data) => {
        if (active) {
          setInventories(data);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load inventories');
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newInv = await createInventory(newName, newDescription);
      setInventories((prev) => [...prev, newInv]);
      setIsDialogOpen(false);
      setNewName('');
      setNewDescription('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Inventories</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium">
              <Plus size={20} />
              New Inventory
            </button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
            <DialogHeader>
              <DialogTitle>Create New Inventory</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a new inventory location or warehouse.
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
                  placeholder="Main Warehouse"
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

      {/* Inventories Grid */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventories.map((inv) => (
          <Link
            key={inv.id}
            to={`/inventories/${inv.id}`}
            className="bg-slate-900 border border-slate-700 rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-900/30 hover:border-indigo-500/30"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{inv.name}</h3>
                <p className="text-sm text-slate-400">{inv.description}</p>
              </div>
              <Archive className="text-indigo-400 flex-shrink-0" size={24} />
            </div>

            <div className="border-t border-slate-700 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Categories</p>
                <p className="text-xl font-bold text-cyan-400">{inv.category_count}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Items</p>
                <p className="text-xl font-bold text-blue-400">{inv.item_count}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500">Created: {inv.created_at}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
