// src/pages/AdminSettings.tsx — NEW FILE, create it in src/pages/

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Lock, Mail, Save } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

const AdminSettings = () => {
  const [emailData, setEmailData] = useState({ newEmail: "" });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailData.newEmail) return;
    setLoadingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: emailData.newEmail,
      });
      if (error) throw error;
      toast.success("تم إرسال رابط التأكيد إلى البريد الجديد");
      setEmailData({ newEmail: "" });
    } catch (error: any) {
      toast.error(error.message || "خطأ في تحديث البريد الإلكتروني");
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل");
      return;
    }
    setLoadingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });
      if (error) throw error;
      toast.success("تم تحديث كلمة المرور بنجاح");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "خطأ في تحديث كلمة المرور");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">الإعدادات</h1>
          <p className="text-gray-500 mt-1">Paramètres du compte administrateur</p>
        </div>

        {/* Update Email */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Mail className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold">تغيير البريد الإلكتروني</h2>
          </div>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div>
              <Label htmlFor="newEmail">البريد الإلكتروني الجديد</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="nouveau@email.com"
                value={emailData.newEmail}
                onChange={(e) => setEmailData({ newEmail: e.target.value })}
                className="mt-1"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                سيتم إرسال رابط تأكيد إلى البريد الجديد قبل التغيير.
              </p>
            </div>
            <Button
              type="submit"
              disabled={loadingEmail}
              className="bg-accent hover:bg-accent/90 text-white gap-2"
            >
              <Save className="h-4 w-4" />
              {loadingEmail ? "جاري التحديث..." : "تحديث البريد الإلكتروني"}
            </Button>
          </form>
        </Card>

        {/* Update Password */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold">تغيير كلمة المرور</h2>
          </div>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="mt-1"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loadingPassword}
              className="bg-accent hover:bg-accent/90 text-white gap-2"
            >
              <Save className="h-4 w-4" />
              {loadingPassword ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </Button>
          </form>
        </Card>

        {/* Store Info */}
        <Card className="p-6 bg-blue-50 border-blue-100">
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800">معلومات المتجر</h3>
              <p className="text-sm text-blue-600 mt-1">
                لتغيير اسم المتجر أو رقم الهاتف أو العنوان، عدّل ملف{" "}
                <code className="bg-blue-100 px-1 rounded">Footer.tsx</code> و{" "}
                <code className="bg-blue-100 px-1 rounded">Header.tsx</code> مباشرة في الكود.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;