

import { useState } from 'react';

function Inventory() {
const products = [];
const isLoading = false;
const [showAddForm, setShowAddForm] = useState(false);
const [name, setName] = useState('');
const [price, setPrice] = useState('');
const [stock, setStock] = useState('');

return (
<div className="inventory">
<div className="topbar">
<div className="biz-name">Inventory</div>
</div>

{isLoading && (
<div className="empty-state">Loading your products...</div>
)}

{!isLoading && products.length === 0 && (
<div className="empty-state">
No products yet. Tap + to add your first item.
</div>
)}

{products.map((p) => (
<div key={p.id} className="glass-card inv-item">
<div>
<div className="inv-name">{p.name}</div>
<div className={p.stock <= 5 ? 'inv-stock low' : 'inv-stock ok'}>
{p.stock <= 5 ? p.stock + ' left — low stock' : p.stock + ' in stock'}
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
<div className="glass-card modal-card" onClick={(e) => e.stopPropagation()}>
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

<button className="big-btn" disabled={!name || !price || !stock}>
Save product
</button>
</div>
</div>
)}
</div>
);
}

export default Inventory;