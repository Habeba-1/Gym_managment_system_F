import { baseApi } from '../baseApi';

export const attendanceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // POST /api/attendance/check-in - Manual member check-in
        checkIn: builder.mutation({
            query: (checkInData) => ({
                url: '/attendance/check-in',
                method: 'POST',
                body: checkInData,
            }),
            invalidatesTags: ['Attendance', 'Dashboard'],
        }),
        // GET /api/attendance/today - Get list of members currently inside the gym today
        getTodayAttendance: builder.query({
            query: () => ({
                url: '/attendance/today',
                method: 'GET',
            }),
            providesTags: ['Attendance'],
        }),
        // POST /api/attendance/sync - Sync offline check-in records using idempotent local_id
        syncOfflineAttendance: builder.mutation({
            query: (records) => ({
                url: '/attendance/sync',
                method: 'POST',
                body: { records },
            }),
            invalidatesTags: ['Attendance', 'Dashboard'],
        }),
    }),
});

export const {
    useCheckInMutation,
    useGetTodayAttendanceQuery,
    useSyncOfflineAttendanceMutation,
} = attendanceApi;
