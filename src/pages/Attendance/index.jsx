import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@mantine/hooks';
import { Alert, Avatar, Badge, Button, Card, SegmentedControl, Stack, Table, Text } from '@mantine/core';
import { FiCheckCircle, FiUsers } from 'react-icons/fi';
import { HiExclamationTriangle } from 'react-icons/hi2';
import SearchInput from '../../components/SearchInput';
import TableSkeleton from '../../components/Tables/TableSkeleton';
import { mockAttendanceRecords, mockMembers } from '../../data/mockAttendance';
import {
    generateIdLocal,
    getPendingAttendance,
    getSyncedHistory,
    queueAttendanceRecord,
    syncPendingQueue,
} from '../../Service/attendanceSyncMock';
import { formatTime } from '../../utils/formatters';

const USE_MOCK_ATTENDANCE = true;
const attendanceStatusMeta = {
    present: { color: 'green', key: 'attendance.present' },
    late: { color: 'orange', key: 'attendance.late' },
    not_coming: { color: 'gray', key: 'attendance.notComing' },
};

const normalizeList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];

    const candidates = [
        payload.data,
        payload.records,
        payload.members,
        payload.attendance,
        payload.result,
    ];

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate;
        if (candidate && typeof candidate === 'object') {
            const nested = normalizeList(candidate);
            if (nested.length) return nested;
        }
    }

    return [];
};

const getMemberMeta = (record, t) => {
    const member = record?.member || record?.member_details || record?.memberData || record || {};
    const rawMember = record?.member_id ? { id: record.member_id, ...member } : member;

    return {
        id: rawMember.id ?? rawMember.member_id ?? record?.member_id ?? null,
        name: rawMember.name || record?.member_name || record?.name || t('attendance.unknownMember'),
        nameAr: rawMember.nameAr || record?.member_name_ar || record?.nameAr || '',
        phone: rawMember.phone || rawMember.phone_number || record?.phone || '',
        photo: rawMember.photo_url || rawMember.photoUrl || rawMember.photo || '',
        attendanceStatus: rawMember.attendanceStatus ?? record?.attendanceStatus ?? null,
        checkInTime: rawMember.checkInTime || rawMember.check_in_time || record?.checkInTime || record?.check_in_time || null,
    };
};

const getLocalizedMemberMeta = (record, t, language) => {
    const memberMeta = getMemberMeta(record, t);
    return {
        ...memberMeta,
        name: language.toLowerCase().startsWith('ar') && memberMeta.nameAr
            ? memberMeta.nameAr
            : memberMeta.name,
    };
};

const getCheckInTime = (record) => {
    return record?.check_in_time || record?.checkInTime || record?.created_at || record?.createdAt || null;
};

const isNetworkFailure = (error) => {
    if (!error) return false;

    const status = error?.status;
    const message = String(error?.error || error?.message || '').toLowerCase();

    return (
        status === 'FETCH_ERROR' ||
        status === 'ERR_NETWORK' ||
        status === 0 ||
        error?.code === 'ERR_NETWORK' ||
        error?.name === 'TypeError' ||
        message.includes('failed to fetch') ||
        message.includes('network') ||
        message.includes('connection') ||
        (!navigator.onLine && ![401, 403, 422].includes(Number(status)))
    );
};

const extractErrorMessage = (error, t) => {
    if (!error) return t('common.errorOccurred');

    if (typeof error === 'string') return error;

    if (error?.status === 401) {
        return t('attendance.sessionExpired');
    }
    if (error?.status === 403) {
        return t('attendance.forbidden');
    }
    if (error?.status === 404) {
        return t('attendance.apiError');
    }
    if (error?.status >= 500) {
        return t('attendance.serverError');
    }
    if (error?.status === 400 || error?.status === 422) {
        const payload = error?.data || error;
        if (payload?.errors && typeof payload.errors === 'object') {
            const firstValue = Object.values(payload.errors)?.[0];
            if (Array.isArray(firstValue)) return firstValue[0];
            if (typeof firstValue === 'string') return firstValue;
        }
        if (payload?.message) return payload.message;
        return t('attendance.requestError');
    }
    if (error?.error === 'Failed to fetch' || !navigator.onLine) {
        return t('attendance.networkError');
    }

    const payload = error?.data || error;
    if (payload?.message) return payload.message;
    if (payload?.errors && typeof payload.errors === 'object') {
        const firstValue = Object.values(payload.errors)?.[0];
        if (Array.isArray(firstValue)) return firstValue[0];
        if (typeof firstValue === 'string') return firstValue;
    }
    if (payload?.error) return payload.error;

    return t('common.errorOccurred');
};

const Attendance = () => {
    const { t, i18n } = useTranslation();
    const language = i18n.resolvedLanguage || i18n.language;
    const locale = language?.toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US';
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [mockMemberState, setMockMemberState] = useState(mockMembers);
    const [notice, setNotice] = useState(null);
    const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
    const [pendingRecords, setPendingRecords] = useState(() => getPendingAttendance());
    const [syncedHistory, setSyncedHistory] = useState(() => getSyncedHistory());
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [syncState, setSyncState] = useState({
        status: 'idle',
        pendingCount: 0,
        lastSyncAt: null,
        error: null,
        syncedCount: 0,
        totalCount: 0,
    });

    const [debouncedSearch] = useDebouncedValue(search, 350);

    const refreshPendingQueue = useCallback(() => {
        const queue = getPendingAttendance();
        setPendingRecords(queue);
        setSyncState((current) => ({
            ...current,
            pendingCount: queue.length,
            totalCount: Math.max(current.totalCount || queue.length, queue.length),
        }));
        return queue;
    }, []);

    const syncPendingMockRecords = useCallback(async (failIds = []) => {
        const queue = getPendingAttendance();
        if (!queue.length) {
            setSyncState((current) => ({ ...current, status: 'idle', pendingCount: 0, error: null }));
            return;
        }

        setSyncState((current) => ({
            ...current,
            status: 'syncing',
            error: null,
            pendingCount: queue.length,
        }));

        const result = await syncPendingQueue({ failIds });
        const nextPending = result.remaining || [];
        const nextSyncState = {
            status: result.success ? 'synced' : 'failed',
            pendingCount: nextPending.length,
            lastSyncAt: new Date().toISOString(),
            error: result.failedRecords?.length ? 'Some attendance records could not be synchronized.' : null,
            syncedCount: result.syncedRecords?.length || 0,
            totalCount: result.total || queue.length,
        };

        setPendingRecords(nextPending);
        setSyncedHistory(getSyncedHistory());
        setSyncState(nextSyncState);

        if (result.success && result.syncedRecords?.length) {
            setNotice({ type: 'success', message: 'Attendance synced successfully' });
        } else if (result.failedRecords?.length) {
            setNotice({ type: 'error', message: 'Some attendance records could not be synchronized. They will be retried.' });
        }
    }, []);

    useEffect(() => {
        const syncWhenOnline = () => {
            const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
            setIsOnline(online);

            if (online) {
                syncPendingMockRecords();
            }
        };

        syncWhenOnline();
        window.addEventListener('online', syncWhenOnline);
        window.addEventListener('offline', () => setIsOnline(false));

        return () => {
            window.removeEventListener('online', syncWhenOnline);
            window.removeEventListener('offline', () => setIsOnline(false));
        };
    }, [syncPendingMockRecords]);

    useEffect(() => {
        refreshPendingQueue();
    }, [refreshPendingQueue]);

    const members = useMemo(() => {
        const searchTerm = debouncedSearch.trim().toLowerCase();
        return mockMemberState
            .filter((member) => `${member.name} ${member.nameAr} ${member.phone}`.toLowerCase().includes(searchTerm))
            .map((member) => ({ member }));
    }, [debouncedSearch, mockMemberState]);

    const attendanceList = useMemo(() => {
        const pendingRows = pendingRecords.map((record) => ({
            id: record.id_local,
            memberId: record.memberId,
            memberName: record.memberName,
            checkInTime: record.checkInTime,
            status: record.status === 'failed' ? 'Sync Failed' : record.status === 'pending' ? 'Pending Sync' : 'Synced',
            member: {
                id: record.memberId,
                name: record.memberName,
                nameAr: record.memberName,
                phone: '',
                photo: null,
            },
        }));

        const historyRows = syncedHistory.map((record) => ({
            id: record.id_local,
            memberId: record.memberId,
            memberName: record.memberName,
            checkInTime: record.checkInTime,
            status: 'Synced',
            member: {
                id: record.memberId,
                name: record.memberName,
                nameAr: record.memberName,
                phone: '',
                photo: null,
            },
        }));

        return [...mockAttendanceRecords, ...pendingRows, ...historyRows].map((record) => ({
            ...record,
            member: {
                ...(record.member || {}),
                phone: mockMemberState.find((member) => String(member.id) === String(record.memberId))?.phone || '',
                photo: mockMemberState.find((member) => String(member.id) === String(record.memberId))?.photo || null,
            },
            attendanceStatus: record.status === 'Pending Sync' ? 'present' : record.status === 'Sync Failed' ? 'late' : 'present',
        }));
    }, [mockMemberState, pendingRecords, syncedHistory]);

    const presentCount = attendanceList.length;
    const selectedMemberId = selectedMember ? getMemberMeta(selectedMember, t).id : null;
    const currentSelectedMember = selectedMember;
    const selectedMemberInfo = currentSelectedMember
        ? getLocalizedMemberMeta(currentSelectedMember, t, language)
        : null;

    const handleAttendanceStatusChange = (status) => {
        if (!selectedMemberInfo?.id) return;

        setMockMemberState((current) => current.map((member) => (
            String(member.id) === String(selectedMemberInfo.id)
                ? { ...member, attendanceStatus: status }
                : member
        )));
    };

    const handleCheckIn = async () => {
        if (!selectedMember) {
            setNotice({
                type: 'error',
                message: 'Please select a member first.',
            });
            return;
        }

        const memberId = selectedMemberInfo?.id ?? selectedMember.id ?? selectedMember.member_id ?? selectedMember.memberId ?? selectedMember.value;
        if (!memberId) {
            setNotice({
                type: 'error',
                message: 'Please select a member first.',
            });
            return;
        }

        const alreadyCheckedIn = [...mockAttendanceRecords, ...pendingRecords, ...syncedHistory].some((record) => {
            const sameMember = String(record.memberId ?? record.member_id) === String(memberId);
            const recordTime = record.checkInTime || record.createdAt;
            if (!sameMember || !recordTime) return false;
            const recordDate = new Date(recordTime);
            const now = new Date();
            return recordDate.getFullYear() === now.getFullYear()
                && recordDate.getMonth() === now.getMonth()
                && recordDate.getDate() === now.getDate();
        });

        if (alreadyCheckedIn) {
            setNotice({
                type: 'error',
                message: 'This member is already checked in today.',
            });
            return;
        }

        setIsSubmittingCheckIn(true);

        await new Promise((resolve) => setTimeout(resolve, 600));

        const checkInTime = new Date().toISOString();
        const queuedRecord = queueAttendanceRecord({
            id_local: generateIdLocal(),
            memberId,
            memberName: selectedMemberInfo?.name || selectedMember?.name || 'Member',
            checkInTime,
            status: 'pending',
            syncAttempts: 0,
            createdAt: checkInTime,
        });

        setPendingRecords(getPendingAttendance());
        setSyncState((current) => ({
            ...current,
            status: 'idle',
            pendingCount: getPendingAttendance().length,
            totalCount: Math.max(current.totalCount || 0, getPendingAttendance().length),
        }));
        setNotice({
            type: 'success',
            message: 'Check-in saved and waiting for synchronization.',
        });
        setSelectedMember(null);
        setSearch('');
        setIsSubmittingCheckIn(false);

        if (navigator.onLine) {
            setNotice({
                type: 'success',
                message: `Check-in saved and waiting for synchronization. Id: ${queuedRecord.id_local}`,
            });
        }
    };

    const syncBadge = !isOnline
        ? { color: 'gray', label: 'Offline — attendance will be saved locally' }
        : syncState.status === 'syncing'
            ? { color: 'blue', label: 'Syncing attendance...' }
            : syncState.pendingCount > 0
                ? { color: 'yellow', label: `Attendance records waiting to sync (${syncState.pendingCount})` }
                : syncState.status === 'synced'
                    ? { color: 'green', label: 'Attendance synced successfully' }
                    : syncState.status === 'failed'
                        ? { color: 'orange', label: 'Some attendance records could not be synchronized. They will be retried.' }
                        : { color: 'green', label: 'Online' };

    const attendanceErrorMessage = null;
    const memberSearchErrorMessage = null;
    const noticeMessage = notice?.message || '';

    const renderApiErrorAlert = (message) => (
        <Alert color="red" variant="light" icon={<HiExclamationTriangle size={18} />}>
            {message}
        </Alert>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {t('attendance.title')}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {t('attendance.description')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Badge color={syncBadge.color} variant="light" radius="sm">
                        {syncBadge.label}
                    </Badge>

                    <Button
                        leftSection={<FiUsers size={18} />}
                        className="bg-btn-gradient hover:bg-btn-gradient rounded-xl px-4 h-11 text-sm font-semibold shadow-sm border-0"
                        onClick={() => setSelectedMember(members[0])}
                        disabled={!debouncedSearch.trim() || members.length === 0}
                        aria-label={t('attendance.addAction')}
                    >
                        {t('attendance.addAction')}
                    </Button>
                </div>
            </div>

            {notice && (
                <Alert
                    icon={notice.type === 'error' ? <HiExclamationTriangle size={18} /> : <FiCheckCircle size={18} />}
                    color={notice.type === 'error' ? 'red' : notice.type === 'info' ? 'yellow' : 'green'}
                    variant="light"
                    title={notice.type === 'error' ? t('attendance.errorTitle') : notice.type === 'info' ? t('attendance.offlineSavedTitle') : t('common.success')}
                    radius="md"
                >
                    {noticeMessage}
                </Alert>
            )}

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_0.9fr]">
                <Card className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0e1517] shadow-sm">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                            <Text fw={700} size="sm" className="text-slate-700 dark:text-slate-200">
                                {t('attendance.searchTitle')}
                            </Text>
                            <Text size="xs" c="dimmed">{t('attendance.searchSubtitle')}</Text>
                        </div>
                        </div>

                    <SearchInput
                        placeholder={t('attendance.searchPrompt')}
                        clearLabel={t('common.clearSearch')}
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        onClear={() => {
                            setSearch('');
                            setSelectedMember(null);
                        }}
                    />

                    {!debouncedSearch.trim() && !selectedMember && (
                        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                            {t('attendance.searchHint')}
                        </div>
                    )}

                    {debouncedSearch.trim() && members.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {members.slice(0, 6).map((member) => {
                                const memberMeta = getLocalizedMemberMeta(member, t, language);
                                const isSelected = selectedMemberInfo?.id === memberMeta.id;
                                const memberStatus = attendanceStatusMeta[memberMeta.attendanceStatus] || attendanceStatusMeta.not_coming;

                                return (
                                    <button
                                        key={memberMeta.id ?? member.id ?? memberMeta.phone ?? memberMeta.name}
                                        type="button"
                                        onClick={() => setSelectedMember(member)}
                                        aria-pressed={isSelected}
                                        className={`w-full rounded-xl border px-3 py-3 text-start transition hover:border-[#85F40F] hover:bg-[#f4feea] dark:hover:bg-slate-900 ${isSelected ? 'border-[#85F40F] bg-[#f4feea] dark:bg-slate-900' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-[#0c101d]'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar size={36} src={memberMeta.photo || undefined} radius="xl" color="green">
                                                {memberMeta.name?.charAt(0)?.toUpperCase() || 'M'}
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{memberMeta.name}</div>
                                                <div className="truncate text-xs text-slate-500 dark:text-slate-400">{memberMeta.phone || '—'}</div>
                                            </div>
                                            {USE_MOCK_ATTENDANCE && (
                                                <Badge color={memberStatus.color} variant="light" radius="sm" style={{ textTransform: 'none' }}>
                                                    {t(memberStatus.key)}
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {debouncedSearch.trim() && members.length === 0 && (
                        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                            {t('attendance.noMemberFound')}
                        </div>
                    )}
                </Card>

                <Card className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0e1517] shadow-sm">
                    <Text fw={700} size="sm" className="text-slate-700 dark:text-slate-200">
                        {t('attendance.memberInfo')}
                    </Text>

                    {selectedMemberInfo ? (
                        <Stack gap="sm" className="mt-4">
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                <Avatar size={46} src={selectedMemberInfo.photo || undefined} radius="xl" color="green">
                                    {selectedMemberInfo.name?.charAt(0)?.toUpperCase() || 'M'}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <Text fw={700} className="truncate text-slate-800 dark:text-slate-100">{selectedMemberInfo.name}</Text>
                                    <Text size="xs" c="dimmed" className="truncate">{selectedMemberInfo.phone || '—'}</Text>
                                </div>
                            </div>

                            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex items-center gap-2">
                                    <span>{t('attendance.status')}:</span>
                                    <Badge
                                        color={attendanceStatusMeta[selectedMemberInfo.attendanceStatus]?.color || 'gray'}
                                        variant="light"
                                        radius="sm"
                                        style={{ textTransform: 'none' }}
                                    >
                                        {t(attendanceStatusMeta[selectedMemberInfo.attendanceStatus]?.key || 'attendance.notComing')}
                                    </Badge>
                                </div>
                                {selectedMemberInfo.checkInTime && (
                                    <div>
                                        {t('attendance.checkInTime')}: {formatTime(selectedMemberInfo.checkInTime, locale)}
                                    </div>
                                )}
                            </div>

                            {USE_MOCK_ATTENDANCE && (
                                <div className="space-y-2">
                                    <Text size="sm" fw={600} className="text-slate-700 dark:text-slate-200">
                                        {t('attendance.attendanceStatus')}
                                    </Text>
                                    <SegmentedControl
                                        fullWidth
                                        value={selectedMemberInfo.attendanceStatus}
                                        onChange={handleAttendanceStatusChange}
                                        data={[
                                            { label: t('attendance.present'), value: 'present' },
                                            { label: t('attendance.late'), value: 'late' },
                                            { label: t('attendance.notComing'), value: 'not_coming' },
                                        ]}
                                    />
                                </div>
                            )}

                            {(!USE_MOCK_ATTENDANCE || selectedMemberInfo.attendanceStatus !== 'not_coming') && (
                                <Button
                                    fullWidth
                                    type="button"
                                    loading={isSubmittingCheckIn}
                                    loaderProps={{ type: 'dots' }}
                                    onClick={handleCheckIn}
                                    className="h-11 rounded-xl bg-btn-gradient text-sm font-semibold"
                                    aria-label={t('attendance.checkIn')}
                                >
                                    {isSubmittingCheckIn ? 'Checking in...' : t('attendance.checkIn')}
                                </Button>
                            )}
                        </Stack>
                    ) : (
                        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                            {t('attendance.selectMember')}
                        </div>
                    )}
                </Card>
            </div>

            <Card className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0e1517] shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <Text fw={700} size="lg" className="text-slate-800 dark:text-white">
                            {t('attendance.presentNowTitle')}
                        </Text>
                    </div>
                    <div className="rounded-xl bg-[#f4feea] px-3 py-2 text-xl font-bold text-[#275001] dark:bg-[#12220a] dark:text-[#85F40F]">
                        {presentCount}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span>Pending: {syncState.pendingCount}</span>
                    <span>•</span>
                    <span>Synced: {syncState.syncedCount}</span>
                    <span>•</span>
                    <span>Last Sync: {syncState.lastSyncAt ? new Date(syncState.lastSyncAt).toLocaleTimeString() : '—'}</span>
                </div>

                <Button
                    fullWidth
                    type="button"
                    className="mt-4 h-11 rounded-xl bg-btn-gradient text-sm font-semibold"
                    onClick={() => syncPendingMockRecords()}
                    disabled={syncState.status === 'syncing' || syncState.pendingCount === 0}
                >
                    {syncState.status === 'syncing' ? 'Syncing...' : syncState.pendingCount > 0 ? `Sync Attendance (${syncState.pendingCount})` : 'Sync Attendance'}
                </Button>
            </Card>

            <Card className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0e1517] shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <Text fw={700} size="lg" className="text-slate-800 dark:text-white">
                        {t('attendance.todayTableTitle')}
                    </Text>
                </div>

                {attendanceErrorMessage ? (
                    renderApiErrorAlert(attendanceErrorMessage)
                ) : attendanceList.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
                        <Text fw={600} className="text-slate-700 dark:text-slate-200">
                            {t('attendance.emptyTitle')}
                        </Text>
                        <Text size="sm" c="dimmed" className="mt-2">
                            {t('attendance.emptySubtitle')}
                        </Text>
                    </div>
                ) : (
                    <Table.ScrollContainer minWidth={600}>
                        <Table verticalSpacing="sm" highlightOnHover withTableBorder={false}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t('attendance.memberName')}</Table.Th>
                                    <Table.Th>{t('attendance.phone')}</Table.Th>
                                    <Table.Th>{t('attendance.checkInTime')}</Table.Th>
                                    <Table.Th className="text-center">{t('attendance.status')}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {attendanceList.map((record) => {
                                    const memberMeta = getLocalizedMemberMeta(record, t, language);
                                    const checkInTime = record.checkInTime || getCheckInTime(record);
                                    const memberStatus = attendanceStatusMeta[record.attendanceStatus] || attendanceStatusMeta.present;

                                    return (
                                        <Table.Tr key={record.id ?? `${memberMeta.id ?? memberMeta.name}-${checkInTime}`}>
                                            <Table.Td>
                                                <div className="flex items-center gap-3">
                                                    <Avatar size={34} src={memberMeta.photo || undefined} radius="xl" color="green">
                                                        {memberMeta.name?.charAt(0)?.toUpperCase() || 'M'}
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <div className="truncate font-semibold text-slate-800 dark:text-slate-100">{memberMeta.name}</div>
                                                    </div>
                                                </div>
                                            </Table.Td>
                                            <Table.Td className="text-slate-600 dark:text-slate-300">{memberMeta.phone || '—'}</Table.Td>
                                            <Table.Td className="text-slate-600 dark:text-slate-300">
                                                {checkInTime ? formatTime(checkInTime, locale) : '—'}
                                            </Table.Td>
                                            <Table.Td className="text-center">
                                                <Badge color={memberStatus.color} variant="light" radius="sm" style={{ textTransform: 'none' }}>
                                                    {t(memberStatus.key)}
                                                </Badge>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                )}
            </Card>
        </div>
    );
};

export default Attendance;
