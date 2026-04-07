// src/pages/Cart.tsx — REPLACE your existing file

import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: "320px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🛍️</div>
          <h2 style={{ fontFamily: "'Syne', Georgia, serif", fontSize: "22px", fontWeight: 800, marginBottom: "8px", color: "#1a1916" }}>
            سلة التسوق فارغة
          </h2>
          <p style={{ color: "#888680", fontSize: "14px", marginBottom: "4px" }}>Votre panier est vide</p>
          <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "28px" }}>ابدأ التسوق الآن!</p>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#0f0f0e", color: "#fff", border: "none",
              padding: "12px 28px", borderRadius: "10px",
              fontSize: "14px", fontWeight: 500, cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#2a2a28"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#0f0f0e"}
          >
            عرض المنتجات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f7f6f3", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');`}</style>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "36px 20px" }}>
        <h1 style={{ fontFamily: "'Syne', Georgia, serif", fontSize: "26px", fontWeight: 800, color: "#1a1916", marginBottom: "4px" }}>
          سلة التسوق
        </h1>
        <p style={{ color: "#888680", fontSize: "13px", marginBottom: "28px" }}>Mon Panier — {items.length} article{items.length > 1 ? "s" : ""}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {items.map((item) => (
              <div key={item.id} style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e8e6e0",
                padding: "16px",
                display: "flex",
                gap: "16px",
                alignItems: "center",
              }}>
                <div style={{
                  width: "80px", height: "80px",
                  borderRadius: "8px", background: "#f5f4f0",
                  overflow: "hidden", flexShrink: 0,
                }}>
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: "14px", color: "#1a1916", marginBottom: "3px" }}>{item.name}</div>
                  <div style={{ fontSize: "12px", color: "#888680" }}>
                    المقاس: {item.size} · اللون: {item.color}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#c8a96e", marginTop: "6px" }}>
                    {item.price.toLocaleString()} DA
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "#ccc", padding: "4px", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c94f4f"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#ccc"}
                  >
                    <Trash2 size={15} />
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: "28px", height: "28px", borderRadius: "7px",
                        border: "1.5px solid #e8e6e0", background: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", color: "#4a4845",
                      }}
                    ><Minus size={12} /></button>
                    <span style={{ width: "24px", textAlign: "center", fontWeight: 600, fontSize: "14px" }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: "28px", height: "28px", borderRadius: "7px",
                        border: "1.5px solid #e8e6e0", background: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", color: "#4a4845",
                      }}
                    ><Plus size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e6e0", padding: "22px", position: "sticky", top: "80px" }}>
            <h2 style={{ fontFamily: "'Syne', Georgia, serif", fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>ملخص الطلب</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#888680" }}>المجموع الفرعي</span>
                <span>{getTotalPrice().toLocaleString()} DA</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#888680" }}>التوصيل</span>
                <span style={{ color: "#2d6a4f", fontSize: "11px", fontWeight: 500 }}>يُحسب حسب الولاية</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e8e6e0", paddingTop: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                <span>المجموع</span>
                <span style={{ color: "#c8a96e", fontSize: "17px" }}>{getTotalPrice().toLocaleString()} DA</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              style={{
                width: "100%", background: "#0f0f0e", color: "#fff",
                border: "none", padding: "14px", borderRadius: "10px",
                fontSize: "14px", fontWeight: 600, cursor: "pointer",
                transition: "background 0.15s", marginBottom: "10px",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#2a2a28"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#0f0f0e"}
            >
              تأكيد الطلب ←
            </button>

            <button
              onClick={() => navigate("/")}
              style={{
                width: "100%", background: "transparent", color: "#4a4845",
                border: "1.5px solid #e8e6e0", padding: "12px", borderRadius: "10px",
                fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "border-color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#c8a96e"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "#e8e6e0"}
            >
              متابعة التسوق
            </button>

            {/* Payment info */}
            <div style={{
              marginTop: "16px", background: "#fdf6ec",
              border: "1px solid #f0ddb5", borderRadius: "8px",
              padding: "10px 12px", fontSize: "12px", color: "#a07030",
              textAlign: "center",
            }}>
              💵 الدفع عند الاستلام — Cash on Delivery
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;