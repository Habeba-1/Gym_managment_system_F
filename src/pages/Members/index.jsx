import { useTranslation } from 'react-i18next';
import { useGetMembersQuery } from '../../Service/Apis/membersApi';

const Members = () => {
    const { t } = useTranslation();
    const { data: _members } = useGetMembersQuery();

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {t('members.title', 'Members & Subscriptions Management')}
            </h2>
            <div className="p-8 rounded-2xl bg-white dark:bg-[#0e1517] border border-slate-200 dark:border-slate-800/80 shadow-smoothCard text-center">
                <p className="text-sm text-textColor dark:text-slate-400">
                    Ready for Feature 1 (Youssef): Connected to <code className="font-mono text-[#85F40F]">membersApi</code>.
                </p>
            </div>
        </div>
    );
};

export default Members;
