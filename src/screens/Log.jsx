import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useActiveBusiness } from "../hooks/useActiveBusiness";

function getNowForInput() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function Log() {
  const { business } = useActiveBusiness();
  const [type, setType] = useState("sale");
  const [amount, setAmount] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [transactionDate, setTransactionDate] = useState(getNowForInput());
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  useEffect(() => {
    if (!business) return;

    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", business.id);

      if (error) {
        console.error(error);
      } else {
        setProducts(data);
      }
      setIsLoadingProducts(false);
    }

    loadProducts();
  }, [business]);

  useEffect(() => {
    if (!selectedProductId) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (product) {
      setAmount(String(product.price * Number(quantity)));
    }
  }, [selectedProductId, quantity]);

  function showToast(message, toastType) {
    setToast({ message: message, type: toastType });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSaveTransaction() {
    const { error: insertError } = await supabase.from("transactions").insert({
      business_id: business.id,
      type: type,
      amount: Number(amount),
      product_id: type === "sale" ? selectedProductId : null,
      quantity: type === "sale" && selectedProductId ? Number(quantity) : null,
      created_at: new Date(transactionDate).toISOString(),
    });

    if (insertError) {
      console.error(insertError);
      showToast("Couldn't save transaction — try again", "error");
      return;
    }

    if (type === "sale" && selectedProductId) {
      const product = products.find((p) => p.id === selectedProductId);
      const { error: updateError } = await supabase
        .from("products")
        .update({ stock: product.stock - Number(quantity) })
        .eq("id", selectedProductId);

      if (updateError) {
        console.error(updateError);
      }
    }

    showToast(type === "sale" ? "Sale logged" : "Expense logged", "success");
    setAmount("");
    setSelectedProductId(null);
    setQuantity(1);
    setTransactionDate(getNowForInput());
  }

  return (
    <div className="log">
      <div className="topbar">
        <div className="biz-name">Log a transaction</div>
      </div>

      <div className="toggle-group">
        <button
          className={`toggle-btn ${type === "sale" ? "on sale" : ""}`}
          onClick={() => setType("sale")}
        >
          Sale
        </button>
        <button
          className={`toggle-btn ${type === "expense" ? "on expense" : ""}`}
          onClick={() => setType("expense")}
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

      <div className="glass-card date-wrap">
        <div className="cur">When</div>
        <input
          className="date-input"
          type="datetime-local"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
        />
      </div>

      {type === "sale" && (
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

          {!isLoadingProducts && products.length > 0 && (
            <div className="product-pick-list">
              {products.map((p) => (
                <div
                  key={p.id}
                  className={`glass-card inv-item ${selectedProductId === p.id ? "selected" : ""}`}
                  onClick={() =>
                    setSelectedProductId(
                      selectedProductId === p.id ? null : p.id
                    )
                  }
                >
                  <div className="inv-name">{p.name}</div>
                  <div className="inv-price">{p.price}</div>
                </div>
              ))}
            </div>
          )}
          {selectedProductId && (
            <div className="glass-card amount-wrap">
              <div className="cur">Qty</div>
              <input
                className="amount-input"
                type="number"
                inputMode="numeric"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          )}
        </>
      )}

      <button className="big-btn" disabled={!amount} onClick={handleSaveTransaction}>
        Save transaction
      </button>

      {toast && <div className={"toast toast-" + toast.type}>{toast.message}</div>}
    </div>
  );
}

export default Log;