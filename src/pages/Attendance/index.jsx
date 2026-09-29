import { useTranslation } from 'react-i18next';
import { useGetTodayAttendanceQuery } from '../../Service/Apis/attendanceApi';

const Attendance = () => {
    const { t } = useTranslation();
    const { data: _attendance } = useGetTodayAttendanceQuery();

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {t('attendance.title', 'Member Attendance & Check-in')}
            </h2>
            <div className="p-8 rounded-2xl bg-white dark:bg-[#0e1517] border border-slate-200 dark:border-slate-800/80 shadow-smoothCard text-center">
                <p className="text-sm text-textColor dark:text-slate-400">
                    Ready for Feature 2 (Mariam): Connected to <code className="font-mono text-[#85F40F]">attendanceApi</code> with Offline Sync.
                </p>
            </div>
        </div>
    );
};

export default Attendance;
