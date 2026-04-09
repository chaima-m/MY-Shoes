// src/pages/Checkout.tsx

import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
  "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
  "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
  "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès",
  "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Menia",
  "Aflou", "Barika", "Ksar Chellala", "Messaad", "Aïn Oussera", "Boussaâda",
  "El Abiodh Sidi Cheikh", "El Kantara", "Bir El Ater", "Ksar El Boukhari", "El Aricha"
];

const METHOD_TO_COLUMN: Record<string, "price_domicile" | "price_stopdesk" | "price_yalidine"> = {
  domicile: "price_domicile",
  stopdesk: "price_stopdesk",
  yalidine: "price_yalidine",
};

const DELIVERY_METHOD_LABELS: Record<string, string> = {
  domicile: "🏠 التوصيل للمنزل (Domicile)",
  stopdesk: "📦 Stop Desk",
  yalidine: "🚚 Yalidine",
};

interface WilayaPrices {
  price_domicile: number;
  price_stopdesk: number;
  price_yalidine: number;
}

const orderSchema = z.object({
  fullName: z.string().min(3, "الاسم الكامل يجب أن يحتوي على 3 أحرف على الأقل"),
  wilaya: z.string().min(1, "الرجاء اختيار الولاية"),
  commune: z.string().min(2, "البلدية مطلوبة"),
  phone: z.string().regex(/^(0|\+213)[5-7][0-9]{8}$/, "رقم الهاتف غير صحيح"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  deliveryMethod: z.string().min(1, "الرجاء اختيار طريقة التوصيل"),
});

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%", padding: "11px 14px", borderRadius: "9px",
  border: `1.5px solid ${hasError ? "#c94f4f" : "#e8e6e0"}`,
  background: "#fff", fontSize: "14px", color: "#1a1916",
  outline: "none", transition: "border-color 0.15s", fontFamily: "inherit", boxSizing: "border-box",
});
const labelStyle: React.CSSProperties = { fontSize: "12.5px", fontWeight: 500, color: "#4a4845", display: "block", marginBottom: "6px" };
const errorStyle: React.CSSProperties = { fontSize: "11px", color: "#c94f4f", marginTop: "4px" };

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [wilayaPrices, setWilayaPrices] = useState<WilayaPrices | null>(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", wilaya: "", commune: "", phone: "", email: "", deliveryMethod: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.wilaya) fetchWilayaPrices(formData.wilaya);
    else setWilayaPrices(null);
  }, [formData.wilaya]);

  const fetchWilayaPrices = async (wilaya: string) => {
    setLoadingDelivery(true);
    try {
      const { data } = await supabase
        .from("delivery_prices")
        .select("price_domicile, price_stopdesk, price_yalidine")
        .eq("wilaya", wilaya)
        .single();
      setWilayaPrices(data || { price_domicile: 0, price_stopdesk: 0, price_yalidine: 0 });
    } catch {
      setWilayaPrices({ price_domicile: 0, price_stopdesk: 0, price_yalidine: 0 });
    } finally { setLoadingDelivery(false); }
  };

  const getMethodPrice = (method: string): number => {
    if (!wilayaPrices || !method) return 0;
    return wilayaPrices[METHOD_TO_COLUMN[method]] ?? 0;
  };

  const deliveryPrice = getMethodPrice(formData.deliveryMethod);
  const totalWithDelivery = getTotalPrice() + deliveryPrice;
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      orderSchema.parse(formData);
      if (!items.length) { toast.error("سلة التسوق فارغة"); return; }
      setLoading(true);

      // ── 1. Insert all orders ──────────────────────────────────────────
      await Promise.all(
        items.map(item =>
          supabase.from("orders").insert({
            full_name: formData.fullName,
            wilaya: formData.wilaya,
            commune: formData.commune,
            address: `${formData.commune}, ${formData.wilaya}`,
            phone: formData.phone,
            email: formData.email || null,
            shoe_size: item.size,
            shoe_color: item.color,
            payment_method: "Cash on Delivery",
            delivery_method: formData.deliveryMethod,
            product_id: item.productId,
            quantity: item.quantity,
            delivery_price: deliveryPrice,
          })
        )
      );

      // ── 2. Decrement stock for each cart item (per color+size variant) ─
      // Uses the SECURITY DEFINER function so anon users can decrement stock.
      await Promise.all(
        items.map(item =>
          supabase.rpc("decrement_variant_stock", {
            p_product_id: item.productId,
            p_size: item.size,
            p_color: item.color,
            p_qty: item.quantity,
          })
        )
      );

      toast.success("تم تأكيد الطلب بنجاح!");
      clearCart();
      navigate("/order-success");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fe: Record<string, string> = {};
        error.errors.forEach(err => { if (err.path[0]) fe[err.path[0] as string] = err.message; });
        setErrors(fe);
        toast.error("يرجى تصحيح الأخطاء");
      } else {
        console.error(error);
        toast.error("حدث خطأ أثناء تقديم الطلب");
      }
    } finally { setLoading(false); }
  };

  if (!items.length) { navigate("/"); return null; }

  return (
    <div style={{ background: "#f7f6f3", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        input:focus, select:focus { border-color: #c8a96e !important; box-shadow: 0 0 0 3px rgba(200,169,110,0.15); }
        @media (max-width: 900px) { .co-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) { .co-row2 { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "36px 20px" }}>
        <h1 style={{ fontFamily: "'Syne',Georgia,serif", fontSize: "26px", fontWeight: 800, color: "#1a1916", marginBottom: "4px" }}>تأكيد الطلب</h1>
        <p style={{ color: "#888680", fontSize: "13px", marginBottom: "28px" }}>Finaliser la commande</p>

        <form onSubmit={handleSubmit}>
          <div className="co-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", alignItems: "start" }}>

            {/* ── Left: form ── */}
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e6e0", padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
                <span style={{ fontSize: "20px" }}>📍</span>
                <div>
                  <div style={{ fontFamily: "'Syne',Georgia,serif", fontSize: "15px", fontWeight: 700 }}>معلومات التوصيل</div>
                  <div style={{ fontSize: "12px", color: "#888680" }}>Informations de livraison</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={labelStyle}>اللقب والاسم <span style={{ color: "#888680", fontWeight: 400 }}>(Nom complet)</span></label>
                  <input style={inputStyle(!!errors.fullName)} value={formData.fullName} onChange={set("fullName")} placeholder="مثال: أحمد بن محمد" />
                  {errors.fullName && <div style={errorStyle}>{errors.fullName}</div>}
                </div>

                <div className="co-row2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={labelStyle}>الولاية <span style={{ color: "#888680", fontWeight: 400 }}>(Wilaya)</span></label>
                    <select style={{ ...inputStyle(!!errors.wilaya), appearance: "none", cursor: "pointer" }} value={formData.wilaya} onChange={set("wilaya")}>
                      <option value="">اختر الولاية</option>
                      {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                    {errors.wilaya && <div style={errorStyle}>{errors.wilaya}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>البلدية <span style={{ color: "#888680", fontWeight: 400 }}>(Commune)</span></label>
                    <input style={inputStyle(!!errors.commune)} value={formData.commune} onChange={set("commune")} placeholder="مثال: باب الزوار" />
                    {errors.commune && <div style={errorStyle}>{errors.commune}</div>}
                  </div>
                </div>

                <div className="co-row2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={labelStyle}>الهاتف (WhatsApp)</label>
                    <input style={inputStyle(!!errors.phone)} type="tel" value={formData.phone} onChange={set("phone")} placeholder="0555 123 456" />
                    {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>البريد الإلكتروني <span style={{ color: "#888680", fontWeight: 400 }}>(optionnel)</span></label>
                    <input style={inputStyle(!!errors.email)} type="email" value={formData.email} onChange={set("email")} placeholder="exemple@email.com" />
                    {errors.email && <div style={errorStyle}>{errors.email}</div>}
                  </div>
                </div>

                {/* Delivery method cards with live prices */}
                <div>
                  <label style={labelStyle}>طريقة التوصيل <span style={{ color: "#888680", fontWeight: 400 }}>(Méthode de livraison)</span></label>
                  {errors.deliveryMethod && <div style={errorStyle}>{errors.deliveryMethod}</div>}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
                    {(["domicile", "stopdesk", "yalidine"] as const).map((method) => {
                      const mp = wilayaPrices ? getMethodPrice(method) : null;
                      const isSel = formData.deliveryMethod === method;
                      return (
                        <div key={method} onClick={() => setFormData(p => ({ ...p, deliveryMethod: method }))} style={{
                          border: `1.5px solid ${isSel ? "#c8a96e" : "#e8e6e0"}`, borderRadius: "10px",
                          padding: "12px 14px", cursor: "pointer", background: isSel ? "#fdf6ec" : "#fff",
                          display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${isSel ? "#c8a96e" : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {isSel && <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#c8a96e" }} />}
                            </div>
                            <span style={{ fontSize: "13px", fontWeight: 500 }}>{DELIVERY_METHOD_LABELS[method]}</span>
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: mp === 0 && wilayaPrices ? "#2d6a4f" : "#1a1916" }}>
                            {loadingDelivery ? "..." : !formData.wilaya
                              ? <span style={{ color: "#bbb", fontSize: "11px", fontWeight: 400 }}>اختر الولاية أولاً</span>
                              : mp === 0 ? <span style={{ color: "#2d6a4f" }}>مجاني</span>
                              : `${mp?.toLocaleString()} DA`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: "#fdf6ec", border: "1px solid #f0ddb5", borderRadius: "10px", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "24px" }}>💵</span>
                  <div>
                    <div style={{ fontWeight: 600, color: "#a07030", fontSize: "13px" }}>الدفع عند الاستلام</div>
                    <div style={{ fontSize: "12px", color: "#b8883a", marginTop: "2px" }}>Cash on Delivery — تدفع عند وصول طلبك</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: summary ── */}
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e6e0", padding: "22px", position: "sticky", top: "80px" }}>
              <h2 style={{ fontFamily: "'Syne',Georgia,serif", fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>ملخص الطلب</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#4a4845" }}>{item.name} (×{item.quantity})</span>
                    <span style={{ fontWeight: 500 }}>{(item.price * item.quantity).toLocaleString()} DA</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #e8e6e0", paddingTop: "12px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#888680" }}>المجموع الفرعي</span>
                  <span>{getTotalPrice().toLocaleString()} DA</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#888680" }}>
                    التوصيل
                    {formData.deliveryMethod && <span style={{ display: "block", fontSize: "10px", color: "#bbb" }}>{DELIVERY_METHOD_LABELS[formData.deliveryMethod]}{formData.wilaya && ` · ${formData.wilaya}`}</span>}
                  </span>
                  <span style={{ fontWeight: 600, color: deliveryPrice === 0 && formData.deliveryMethod && wilayaPrices ? "#2d6a4f" : "#1a1916" }}>
                    {loadingDelivery ? "..." : !formData.wilaya || !formData.deliveryMethod
                      ? <span style={{ color: "#bbb", fontSize: "11px", fontWeight: 400 }}>يُحسب لاحقاً</span>
                      : deliveryPrice === 0 ? "مجاني"
                      : `${deliveryPrice.toLocaleString()} DA`}
                  </span>
                </div>
                {(!formData.wilaya || !formData.deliveryMethod) && (
                  <p style={{ fontSize: "11px", color: "#aaa", fontStyle: "italic" }}>اختر الولاية وطريقة التوصيل لمعرفة الرسوم</p>
                )}
              </div>
              <div style={{ borderTop: "1px solid #e8e6e0", paddingTop: "14px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>المجموع الكلي</span>
                  <span style={{ color: "#c8a96e", fontSize: "18px" }}>{totalWithDelivery.toLocaleString()} DA</span>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{
                width: "100%", background: loading ? "#888" : "#0f0f0e", color: "#fff",
                border: "none", padding: "14px", borderRadius: "10px",
                fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.15s",
              }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#2a2a28"; }}
                onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#0f0f0e"; }}
              >
                {loading ? "جاري المعالجة..." : "✅ تأكيد الطلب"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;