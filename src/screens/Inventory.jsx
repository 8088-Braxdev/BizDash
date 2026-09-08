import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useActiveBusiness } from '../hooks/useActiveBusiness';

function Inventory() {
  const { business, loading: businessLoading } = useActiveBusiness();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const isLoading = businessLoading || productsLoading;
  const [showAddForm, setShowAddForm] = useState(false);
const [name, setName] = useState('');
const [price, setPrice] = useState('');
const [stock, setStock] = useState('');

  useEffect(() => {
    if (!business) return;

    async function loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', business.id);

      if (error) {
        console.error(error);
      } else {
        setProducts(data);
      }
      setProductsLoading(false);
    }

    loadProducts();
  }, [business]);
    async function handleSaveProduct() {
    const { data, error } = await supabase
      .from('products')
      .insert({
        business_id: business.id,
        name: name,
        price: Number(price),
        stock: Number(stock),
      })
      .select();

    if (error) {
      console.error(error);
      return;
    }

    setProducts([...products, data[0]]);
    setName('');
    setPrice('');
    setStock('');
    setShowAddForm(false);
  }

  return (
    <div className="inventory">
      <div className="topbar">
        <div className="biz-name">Inventory</div>
      </div>

      {isLoading && <div className="empty-state">Loading your products...</div>}

      {!isLoading && products.length === 0 && (
        <div className="empty-state">
          No products yet. Tap + to add your first item.
        </div>
      )}

      {products.map((p) => (
        <div key={p.id} className="glass-card inv-item">
          <div>
            <div className="inv-name">{p.name}</div>
            <div className={p.stock <= 5 ? "inv-stock low" : "inv-stock ok"}>
              {p.stock <= 5
                ? p.stock + " left — low stock"
                : p.stock + " in stock"}
            </div>
          </div>
          <div className="inv-price">{p.price}</div>
        </div>
      ))}

      <button className="fab" onClick={() => setShowAddForm(true)}>
        +
      </button>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div
            className="glass-card modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Add product</h3>

            <input
              className="modal-input"
              placeholder="Product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="modal-input"
              type="number"
              inputMode="numeric"
              placeholder="Price (TZS)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input
              className="modal-input"
              type="number"
              inputMode="numeric"
              placeholder="Starting stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />

            <button className="big-btn" disabled={!name || !price || !stock} onClick={handleSaveProduct}>
              Save product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
