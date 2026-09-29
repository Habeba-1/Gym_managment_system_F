import { useTranslation } from 'react-i18next';
import { useGetFinancialSummaryQuery } from '../../Service/Apis/reportsApi';

const Reports = () => {
    const { t } = useTranslation();
    const { data: _reports } = useGetFinancialSummaryQuery();

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {t('finance.financialSummary', 'Comprehensive Financial Report')}
            </h2>
            <div className="p-8 rounded-2xl bg-white dark:bg-[#0e1517] border border-slate-200 dark:border-slate-800/80 shadow-smoothCard text-center">
                <p className="text-sm text-textColor dark:text-slate-400">
                    Ready for Feature 7 (Moamen - Owner Only): Connected to <code className="font-mono text-[#85F40F]">reportsApi</code>.
                </p>
            </div>
        </div>
    );
};

export default Reports;
