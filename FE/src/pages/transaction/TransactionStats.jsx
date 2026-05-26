import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function TransactionStats({ history }) {
  const { t } = useTranslation();
  const getPackagePrice = (pkg) => {
    const prices = { "3_THANG": 99000, "6_THANG": 179000, "12_THANG": 299000 };
    return prices[pkg] || 0;
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalTransactions = history.length;
  const successfulTransactions = history.filter(
    (t) => t.status === "ACTIVE"
  ).length;
  const totalSpent = history
    .filter((t) => t.status === "ACTIVE")
    .reduce((sum, t) => sum + getPackagePrice(t.package_details), 0);

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg">{t("layout.transactions.stats.overview")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {totalTransactions}
            </p>
            <p className="text-sm text-muted-foreground">{t("layout.transactions.stats.totalTransactions")}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {successfulTransactions}
            </p>
            <p className="text-sm text-muted-foreground">{t("layout.transactions.stats.successful")}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-sm text-muted-foreground">{t("layout.transactions.stats.totalSpent")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
