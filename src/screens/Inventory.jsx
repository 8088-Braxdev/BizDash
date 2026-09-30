import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useActiveBusiness } from '../hooks/useActiveBusiness';
import { useProfile } from '../hooks/useProfile';

const FREE_PRODUCT_LIMIT = 10;

function Inventory() {
  const { business, loading: businessLoading } = useActiveBusiness();
  const { profile, loading: profileLoading } = useProfile();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const isLoading = businessLoading || productsLoading || profileLoading;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

const isPremium =
  profile &&
  profile.is_premium &&
  profile.premium_expires_at &&
  new Date(profile.premium_expires_at) > new Date();

  const atLimit = !isPremium && products.length >= FREE_PRODUCT_LIMIT;

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

  function showToast(message, type) {
    setToast({ message: message, type: type });
    setTimeout(() => setToast(null), 3000);
  }

  function getSortedProducts() {
    const sorted = [...products];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'stock') {
      sorted.sort((a, b) => a.stock - b.stock);
    } else if (sortBy === 'price') {
      sorted.sort((a, b) => a.price - b.price);
    }
    return sorted;
  }

  function openAddForm() {
    setEditingId(null);
    setName('');
    setPrice('');
    setStock('');
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setShowForm(true);
  }

  async function handleSaveProduct() {
    if (editingId) {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: name,
          price: Number(price),
          stock: Number(stock),
        })
        .eq('id', editingId)
        .select();

      if (error) {
        console.error(error);
        showToast("Couldn't save changes — try again", 'error');
        return;
      }

      setProducts(products.map((p) => (p.id === editingId ? data[0] : p)));
      showToast('Product updated', 'success');
    } else {
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
        showToast("Couldn't add product — try again", 'error');
        return;
      }

      setProducts([...products, data[0]]);
      showToast('Product added', 'success');
    }

    closeForm();
  }

  async function handleDeleteProduct(product) {
    const ok = window.confirm(
      'Delete "' + product.name + '"? This cannot be undone.',
    );
    if (!ok) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);

    if (error) {
      console.error(error);
      showToast("Couldn't delete product — try again", 'error');
      return;
    }

    setProducts(products.filter((p) => p.id !== product.id));
    showToast('Product deleted', 'success');
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setPrice('');
    setStock('');
  }

  if (businessLoading || profileLoading) {
    return (
      <div className="inventory">
        <div className="topbar">
          <div className="biz-name">Inventory</div>
        </div>
        <div className="empty-state">Loading...</div>
      </div>
    );
  }

  const sortedProducts = getSortedProducts();

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

      {!isLoading && products.length > 0 && (
        <div className="sort-row">
          <span className="sort-label">Sort by</span>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="stock">Stock (low to high)</option>
            <option value="price">Price (low to high)</option>
          </select>
        </div>
      )}

      {sortedProducts.map((p) => (
        <div key={p.id} className="glass-card inv-item">
          <div className="inv-main">
            <div className="inv-name">{p.name}</div>
            <div className={p.stock <= 5 ? 'inv-stock low' : 'inv-stock ok'}>
              {p.stock <= 5 ? p.stock + ' left — low stock' : p.stock + ' in stock'}
            </div>
            <div className="inv-actions">
              <button className="inv-btn" onClick={() => openEditForm(p)}>
                Edit
              </button>
              <button
                className="inv-btn danger"
                onClick={() => handleDeleteProduct(p)}
              >
                Delete
              </button>
            </div>
          </div>
          <div className="inv-price">{p.price}</div>
        </div>
      ))}

      {!isPremium && (
        <div className="product-limit-note">
          {products.length}/{FREE_PRODUCT_LIMIT} products used on Free tier
        </div>
      )}

      <button className="fab" onClick={atLimit ? undefined : openAddForm} disabled={atLimit}>
        +
      </button>

      {atLimit && !showForm && (
        <div className="glass-card limit-card">
          <div className="badge">PREMIUM</div>
          <p>
            You've hit the {FREE_PRODUCT_LIMIT}-product limit on Free tier.
            Upgrade in Settings for unlimited products.
          </p>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="glass-card modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Edit product' : 'Add product'}</h3>

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
              placeholder="Stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />

            <button
              className="big-btn"
              disabled={!name || !price || !stock}
              onClick={handleSaveProduct}
            >
              {editingId ? 'Save changes' : 'Save product'}
            </button>


          </div>
        </div>
      )}

      {toast && <div className={'toast toast-' + toast.type}>{toast.message}</div>}
    </div>
  );
}

export default Inventory;