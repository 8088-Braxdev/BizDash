import { useState } from 'react';

function Log() {
const [type, setType] = useState('sale');
const [amount, setAmount] = useState('');
const products = [];
const isLoadingProducts = false;

return (
<div className="log">
<div className="topbar">
<div className="biz-name">Log a transaction</div>
</div>

<div className="toggle-group">
<button
className={`toggle-btn ${type === 'sale' ? 'on sale' : ''}} onClick={() =&gt; setType('sale')} &gt; Sale &lt;/button&gt; &lt;button className={toggle-btn ${type === 'expense' ? 'on expense' : ''}`}
onClick={() => setType('expense')}
>
Expense
</button>
</div>

<div className="glass-card amount-wrap">
<div className="cur">TZS</div>
<input
className="amount-input"
type="number"
inputMode="numeric"
placeholder="0"
value={amount}
onChange={(e) => setAmount(e.target.value)}
/>
</div>

{type === 'sale' && (
<>
<div className="section-head">
<h3>Link to a product (optional)</h3>
</div>

{isLoadingProducts && (
<div className="empty-state">Loading your inventory...</div>
)}

{!isLoadingProducts && products.length === 0 && (
<div className="empty-state">
No products yet. Add items in Inventory to link sales.
</div>
)}
</>
)}

<button className="big-btn" disabled={!amount}>
Save transaction
</button>
</div>
);
}

export default Log;