import { Search, Calendar, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TransactionFilter({ 
  filters, 
  onFilterChange, 
  onReset 
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm p-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search by Transaction ID */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            {t("layout.transactions.filter.transactionId")}
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/30 focus:border-primary dark:focus:border-primary outline-none transition-all"
              placeholder={t("layout.transactions.filter.searchPlaceholder")}
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            {t("layout.transactions.filter.status")}
          </label>
          <Select 
            value={filters.status} 
            onValueChange={(value) => onFilterChange('status', value)}
          >
            <SelectTrigger className="w-full h-[38px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm">
              <SelectValue placeholder={t("layout.transactions.filter.statusAll")} />
            </SelectTrigger>
            {/* 🔧 FIX: Thêm className để override background tối */}
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-[300px]">
              <SelectItem value="ALL" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="font-medium text-sm">{t("layout.transactions.filter.statusAll")}</span>
              </SelectItem>
              <SelectItem value="ACTIVE" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>{t("layout.transactions.filter.statusActive")}</span>
                </div>
              </SelectItem>
              <SelectItem value="PENDING" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>{t("layout.transactions.filter.statusPending")}</span>
                </div>
              </SelectItem>
              <SelectItem value="CANCELLED" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>{t("layout.transactions.filter.statusCancelled")}</span>
                </div>
              </SelectItem>
              <SelectItem value="EXPIRED" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  <span>{t("layout.transactions.filter.statusExpired")}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Package Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            {t("layout.transactions.filter.packageType")}
          </label>
          <Select 
            value={filters.package} 
            onValueChange={(value) => onFilterChange('package', value)}
          >
            <SelectTrigger className="w-full h-[38px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm">
              <SelectValue placeholder={t("layout.transactions.filter.packageAll")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-[300px]">
              <SelectItem value="ALL" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="font-medium text-sm">{t("layout.transactions.filter.packageAll")}</span>
              </SelectItem>
              <SelectItem value="3_THANG" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">{t("layout.transactions.filter.package3m")}</span>
              </SelectItem>
              <SelectItem value="6_THANG" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">{t("layout.transactions.filter.package6m")}</span>
              </SelectItem>
              <SelectItem value="12_THANG" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">{t("layout.transactions.filter.package12m")}</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Range Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {t("layout.transactions.filter.timeRange")}
          </label>
          <Select 
            value={filters.timeRange} 
            onValueChange={(value) => onFilterChange('timeRange', value)}
          >
            <SelectTrigger className="w-full h-[38px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm">
              <SelectValue placeholder={t("layout.transactions.filter.timeAll")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-[300px]">
              <SelectItem value="ALL" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="font-medium text-sm">{t("layout.transactions.filter.timeAll")}</span>
              </SelectItem>
              <SelectItem value="7_DAYS" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">{t("layout.transactions.filter.time7days")}</span>
              </SelectItem>
              <SelectItem value="30_DAYS" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">{t("layout.transactions.filter.time30days")}</span>
              </SelectItem>
              <SelectItem value="90_DAYS" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">{t("layout.transactions.filter.time90days")}</span>
              </SelectItem>
              <SelectItem value="1_YEAR" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">{t("layout.transactions.filter.time1year")}</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters & Reset Button */}
      {(filters.search || filters.status !== 'ALL' || filters.package !== 'ALL' || filters.timeRange !== 'ALL') && (
        <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-2">
          {/* Active filters chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("layout.transactions.filter.filtering")}:</span>
            
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md border border-blue-200/50 dark:border-blue-800/50">
                {t("layout.transactions.filter.code")}: {filters.search}
                <button 
                  onClick={() => onFilterChange('search', '')} 
                  className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.status !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-md border border-green-200/50 dark:border-green-800/50">
                {filters.status === 'ACTIVE' && t("layout.transactions.filter.statusActive")}
                {filters.status === 'PENDING' && t("layout.transactions.filter.statusPending")}
                {filters.status === 'CANCELLED' && t("layout.transactions.filter.statusCancelled")}
                {filters.status === 'EXPIRED' && t("layout.transactions.filter.statusExpired")}
                <button 
                  onClick={() => onFilterChange('status', 'ALL')} 
                  className="hover:text-green-900 dark:hover:text-green-100 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.package !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-md border border-purple-200/50 dark:border-purple-800/50">
                {filters.package === '3_THANG' && t("layout.transactions.filter.package3m")}
                {filters.package === '6_THANG' && t("layout.transactions.filter.package6m")}
                {filters.package === '12_THANG' && t("layout.transactions.filter.package12m")}
                <button 
                  onClick={() => onFilterChange('package', 'ALL')} 
                  className="hover:text-purple-900 dark:hover:text-purple-100 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.timeRange !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs rounded-md border border-orange-200/50 dark:border-orange-800/50">
                {filters.timeRange === '7_DAYS' && t("layout.transactions.filter.time7days")}
                {filters.timeRange === '30_DAYS' && t("layout.transactions.filter.time30days")}
                {filters.timeRange === '90_DAYS' && t("layout.transactions.filter.time90days")}
                {filters.timeRange === '1_YEAR' && t("layout.transactions.filter.time1year")}
                <button 
                  onClick={() => onFilterChange('timeRange', 'ALL')} 
                  className="hover:text-orange-900 dark:hover:text-orange-100 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          {/* Reset button */}
          <Button
            onClick={onReset}
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 hover:bg-slate-100 dark:hover:bg-slate-700/50"
          >
            <X className="h-3.5 w-3.5" />
            {t("layout.transactions.filter.clearAll")}
          </Button>
        </div>
      )}
    </div>
  );
}