import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Receipt, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "@/components/HeaderBar";
import { AccountSidebar } from "@/components/Account-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import TransactionFilter from "@/pages/transaction/TransactionFilter";
import TransactionCard from "@/pages/transaction/TransactionCard";
import TransactionStats from "@/pages/transaction/TransactionStats";
import PaymentService from "@/service/PaymentService";
import { toast } from "react-toastify";

export default function Transactions() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [allHistory, setAllHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    package: "ALL",
    timeRange: "ALL",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchHistory();
  }, [isAuthenticated, navigate]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [filters, allHistory]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      try {
        const subRes = await PaymentService.getCurrentSubscription();
        console.log("✅ Current Subscription:", subRes);
        if (subRes.success) {
          if(subRes.data.isExpired) {
            toast.warn(t("transactions.subscription.expired"));
          } else if (subRes.data.subcription) {
            console.log("✅ Subscription Details:", subRes.data.subcription);
          }
        }
      } catch (subErr) {
        console.warn("⚠️ Failed to fetch current subscription:", subErr);
      }
      const res = await PaymentService.getPaymentHistory();

      if (res.success && Array.isArray(res.data)) {
        console.log("✅ History Data:", res.data);
        setAllHistory(res.data);
      } else {
        console.warn("⚠️ No history in response:", res);
        setAllHistory([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch payment history:", err);
      setError(t("transactions.error"));
      toast.error(t("transactions.error"));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...allHistory];

    // Filter by search (transaction ID)
    if (filters.search.trim()) {
      const searchKey = filters.search.trim().toLowerCase();
      result = result.filter((t) => {
        // Ép kiểu về chuỗi một cách an toàn và tìm kiếm
        const payId = String(t.payment_transaction_id || "").toLowerCase();
        const subId = String(t.subscription_id || "").toLowerCase(); // Tìm cả mã sub dự phòng
        
        return payId.includes(searchKey) || subId.includes(searchKey);
      });
    }

    // Filter by status
    if (filters.status !== "ALL") {
      result = result.filter((t) => t.status === filters.status);
    }

    // Filter by package
    if (filters.package !== "ALL") {
      result = result.filter((t) => t.package_details === filters.package);
    }

    // Filter by time range
    if (filters.timeRange !== "ALL") {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.timeRange) {
        case "7_DAYS":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "30_DAYS":
          filterDate.setDate(now.getDate() - 30);
          break;
        case "90_DAYS":
          filterDate.setDate(now.getDate() - 90);
          break;
        case "1_YEAR":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      result = result.filter((t) => {
        const createdAt = t.start_date || t.createdAt;
        return createdAt && new Date(createdAt) >= filterDate;
      });
    }

    setFilteredHistory(result);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      package: "ALL",
      timeRange: "ALL",
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="shrink-0">
          <AccountSidebar />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-background/50">
          <div className="container mx-auto px-8 py-8 max-w-6xl pb-20">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                <Receipt className="h-8 w-8" />
                {t("layout.transactions.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("layout.transactions.subtitle")}
              </p>
            </div>

            {/* Filter Section */}
            <TransactionFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  {t("layout.transactions.loading")}
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="flex items-center gap-3 py-6">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!loading &&
              !error &&
              filteredHistory.length === 0 &&
              allHistory.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <Receipt className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-xl font-medium text-muted-foreground mb-2">
                      {t("layout.transactions.empty")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("layout.transactions.emptyDescription")}
                    </p>
                  </CardContent>
                </Card>
              )}

            {/* No Results After Filter */}
            {!loading &&
              !error &&
              filteredHistory.length === 0 &&
              allHistory.length > 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <AlertCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-xl font-medium text-muted-foreground mb-2">
                      {t("layout.transactions.noResults")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("layout.transactions.noResultsDescription")}
                    </p>
                  </CardContent>
                </Card>
              )}

            {/* Transaction List */}
            {!loading && !error && filteredHistory.length > 0 && (
              <>
                <div className="space-y-4 mb-8">
                  {filteredHistory.map((transaction) => (
                    <TransactionCard
                      key={transaction.subcription_id}
                      transaction={transaction}
                    />
                  ))}
                </div>

                {/* Statistics Summary */}
                <TransactionStats history={filteredHistory} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
