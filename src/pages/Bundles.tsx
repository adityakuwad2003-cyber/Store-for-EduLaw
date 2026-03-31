import { useState, useMemo } from 'react';
import { Package, Sparkles, Check, ShoppingCart } from 'lucide-react';
import { bundles, notesData } from '@/data/notes';
import { BundleCard } from '@/components/ui/BundleCard';
import { useCartStore } from '@/store';

export function Bundles() {
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const { addBundle } = useCartStore();

  // Calculate custom bundle pricing
  const customBundlePrice = useMemo(() => {
    const count = selectedNotes.length;
    if (count === 0) return 0;
    if (count === 3) return 450;
    if (count === 5) return 750;
    if (count === 10) return 1300;
    if (count === 20) return 2000;
    if (count === 36) return 3000;
    if (count === 46) return 3500;
    // Default: 15% discount for custom bundles
    return Math.round(count * 199 * 0.85);
  }, [selectedNotes]);

  const customBundleOriginalPrice = selectedNotes.length * 199;
  const customSavings = customBundleOriginalPrice - customBundlePrice;

  const toggleNote = (noteId: number) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleAddCustomBundle = () => {
    if (selectedNotes.length > 0) {
      const customBundle = {
        id: `custom-${Date.now()}`,
        name: `Custom Bundle (${selectedNotes.length} notes)`,
        slug: 'custom-bundle',
        description: `Your custom selection of ${selectedNotes.length} subjects`,
        noteIds: selectedNotes,
        price: customBundlePrice,
        originalPrice: customBundleOriginalPrice,
        isActive: true,
        savingsPercent: Math.round((customSavings / customBundleOriginalPrice) * 100),
      };
      addBundle(customBundle);
      setSelectedNotes([]);
      setShowBuilder(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-parchment">
      {/* Hero */}
      <div className="bg-ink py-16">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1 px-4 py-2 bg-gold/20 rounded-full mb-6">
              <Package className="w-4 h-4 text-gold" />
              <span className="font-ui text-sm text-gold">Save Up to 62%</span>
            </span>
            <h1 className="font-display text-4xl lg:text-5xl text-parchment mb-4">
              The Smart Way to Buy <span className="text-gold">Legal Notes</span>
            </h1>
            <p className="font-body text-lg text-parchment/70">
              Bundle multiple subjects and save big. The more you buy, the more you save!
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-16">
        {/* Pre-made Bundles */}
        <div className="mb-16">
          <h2 className="font-display text-2xl text-ink mb-8 text-center">
            Pre-made Bundles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle, index) => (
              <BundleCard key={bundle.id} bundle={bundle} index={index} />
            ))}
          </div>
        </div>

        {/* Custom Bundle Builder */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-burgundy to-burgundy-light">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-gold" />
                <div>
                  <h2 className="font-display text-xl text-parchment">Custom Bundle Builder</h2>
                  <p className="text-parchment/70 text-sm">Pick any subjects you want</p>
                </div>
              </div>
              <button
                onClick={() => setShowBuilder(!showBuilder)}
                className="px-4 py-2 bg-gold text-ink rounded-lg font-ui font-medium hover:bg-gold-light transition-colors"
              >
                {showBuilder ? 'Hide Builder' : 'Build Your Bundle'}
              </button>
            </div>
          </div>

          {showBuilder && (
            <div className="p-6">
              {/* Selected Summary */}
              {selectedNotes.length > 0 && (
                <div className="mb-6 p-4 bg-parchment/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-ui font-medium text-ink">
                        {selectedNotes.length} subjects selected
                      </p>
                      <p className="text-sm text-mutedgray">
                        Original price: ₹{customBundleOriginalPrice}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl text-gold">
                        ₹{customBundlePrice}
                      </p>
                      {customSavings > 0 && (
                        <p className="text-sm text-green-600">
                          Save ₹{customSavings}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleAddCustomBundle}
                    className="w-full py-3 bg-burgundy text-parchment rounded-lg font-ui font-medium hover:bg-burgundy-light transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add Custom Bundle to Cart
                  </button>
                </div>
              )}

              {/* Notes Selection */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {notesData.map((note) => {
                  const isSelected = selectedNotes.includes(note.id);
                  return (
                    <button
                      key={note.id}
                      onClick={() => toggleNote(note.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        isSelected 
                          ? 'border-burgundy bg-burgundy/5' 
                          : 'border-parchment-dark hover:border-burgundy/30'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-burgundy border-burgundy' 
                          : 'border-mutedgray'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-ui font-medium text-sm text-ink truncate">{note.title}</p>
                        <p className="text-xs text-mutedgray">{note.category}</p>
                      </div>
                      <span className="text-gold font-display text-sm">₹{note.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Table */}
        <div className="mt-16">
          <h2 className="font-display text-2xl text-ink mb-8 text-center">
            Bundle Pricing Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-card overflow-hidden">
              <thead className="bg-parchment-dark">
                <tr>
                  <th className="px-6 py-4 text-left font-display text-ink">Bundle</th>
                  <th className="px-6 py-4 text-center font-display text-ink">Subjects</th>
                  <th className="px-6 py-4 text-center font-display text-ink">Original Price</th>
                  <th className="px-6 py-4 text-center font-display text-ink">Bundle Price</th>
                  <th className="px-6 py-4 text-center font-display text-ink">You Save</th>
                </tr>
              </thead>
              <tbody>
                {bundles.map((bundle) => (
                  <tr key={bundle.id} className="border-t border-parchment-dark">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-ui font-medium">{bundle.name}</span>
                        {bundle.tag && (
                          <span className="px-2 py-0.5 bg-gold/20 text-gold text-xs rounded">
                            {bundle.tag}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-ui">{bundle.noteIds.length > 0 ? bundle.noteIds.length : 'Any ' + bundle.name.split(' ')[0]}</td>
                    <td className="px-6 py-4 text-center font-ui text-mutedgray line-through">
                      ₹{bundle.originalPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-display text-gold text-lg">₹{bundle.price.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-ui">
                        {bundle.savingsPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
