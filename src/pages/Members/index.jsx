// import { useTranslation } from 'react-i18next';
// import { useGetMembersQuery } from '../../Service/Apis/membersApi';

// const Members = () => {
//     const { t } = useTranslation();
//     const { data: _members } = useGetMembersQuery();

//     return (
//         <div className="space-y-4">
//             <h2 className="text-xl font-bold text-slate-800 dark:text-white">
//                 {t('members.title', 'Members & Subscriptions Management')}
//             </h2>
//             <div className="p-8 rounded-2xl bg-white dark:bg-[#0e1517] border border-slate-200 dark:border-slate-800/80 shadow-smoothCard text-center">
//                 <p className="text-sm text-textColor dark:text-slate-400">
//                     Ready for Feature 1 (Youssef): Connected to <code className="font-mono text-[#85F40F]">membersApi</code>.
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default Members;

import { useState, useMemo, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TextInput,
  Select,
  Badge,
  Skeleton,
  Text,
  Group,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";

import { AuthContext } from "../../AuthContext/AuthProvider";
// =====================================================================
// TEMPORARY: استخدام Mock Data بدل الـ API
// لما الباك إند يشتغل، شيل السطرين دول وفعّل السطر المعلّق
// =====================================================================
import { MOCK_MEMBERS } from "./mockData";
// import { useGetMembersQuery } from "../../Service/Apis/membersApi";

const STATUS_COLORS = {
  active: "green",
  expired: "red",
  suspended: "yellow",
};

const Members = () => {
  const { t } = useTranslation();
  const { isOwner } = useContext(AuthContext);

  // =====================================================================
  // TEMPORARY: بيانات Mock. لما الـ API يشتغل، شيل البلوك ده وفعّل اللي تحته
  // =====================================================================
  const members = MOCK_MEMBERS;
  const isLoading = false;
  const isError = false;

  // const {
  //   data,
  //   isLoading,
  //   isError,
  // } = useGetMembersQuery();
  // const members = data?.data || [];
  // =====================================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // فلترة محلية مؤقتاً. لما الـ API يشتغل، الفلترة تروح للسيرفر
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        !searchQuery ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, statusFilter]);

  const handleDelete = (memberId) => {
    // TODO: استدعاء useDeleteMemberMutation
    console.log("Delete member:", memberId);
  };

  const handleEdit = (memberId) => {
    // TODO: فتح modal لتعديل العضو
    console.log("Edit member:", memberId);
  };

  // =====================================================================
  // RENDER: Loading State
  // =====================================================================
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {t("members.title", "Members & Subscriptions Management")}
        </h2>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1517] border border-slate-200 dark:border-slate-800/80">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={40} mt="sm" radius="md" />
          ))}
        </div>
      </div>
    );
  }

  // =====================================================================
  // RENDER: Error State
  // =====================================================================
  if (isError) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {t("members.title", "Members & Subscriptions Management")}
        </h2>
        <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-center">
          <p className="text-sm text-rose-600 dark:text-rose-400 font-semibold">
            {t(
              "members.loadError",
              "Failed to load members. Please try again.",
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {t("members.title", "Members & Subscriptions Management")}
        </h2>
        <Text size="sm" c="dimmed">
          {filteredMembers.length} {t("members.count", "members")}
        </Text>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1517] border border-slate-200 dark:border-slate-800/80 shadow-smoothCard">
        <div className="flex flex-col md:flex-row gap-3">
          <TextInput
            placeholder={t(
              "members.searchPlaceholder",
              "Search by name, phone or email...",
            )}
            leftSection={<FiSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            className="flex-1"
            classNames={{
              input:
                "rounded-xl! dark:bg-[#0c101d]! dark:text-white! dark:border-slate-800! focus:border-[#85F40F]!",
            }}
          />
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || "all")}
            data={[
              { value: "all", label: t("members.status.all", "All Statuses") },
              { value: "active", label: t("members.status.active", "Active") },
              {
                value: "expired",
                label: t("members.status.expired", "Expired"),
              },
              {
                value: "suspended",
                label: t("members.status.suspended", "Suspended"),
              },
            ]}
            className="w-full md:w-56"
            classNames={{
              input:
                "rounded-xl! dark:bg-[#0c101d]! dark:text-white! dark:border-slate-800! focus:border-[#85F40F]!",
            }}
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0e1517] border border-slate-200 dark:border-slate-800/80 shadow-smoothCard overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-textColor dark:text-slate-400">
              {t("members.empty", "No members found matching your criteria.")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              highlightOnHover
              verticalSpacing="md"
              horizontalSpacing="md"
              className="min-w-full"
            >
              <Table.Thead className="bg-slate-50 dark:bg-[#0c101d]">
                <Table.Tr>
                  <Table.Th className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    {t("members.columns.name", "Name")}
                  </Table.Th>
                  <Table.Th className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    {t("members.columns.phone", "Phone")}
                  </Table.Th>
                  <Table.Th className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 hidden md:table-cell">
                    {t("members.columns.email", "Email")}
                  </Table.Th>
                  <Table.Th className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                    {t("members.columns.plan", "Plan")}
                  </Table.Th>
                  <Table.Th className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                    {t("members.columns.status", "Status")}
                  </Table.Th>
                  <Table.Th className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                    {t("members.columns.endDate", "End Date")}
                  </Table.Th>
                  {isOwner && (
                    <Table.Th className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 text-end">
                      {t("members.columns.actions", "Actions")}
                    </Table.Th>
                  )}
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {filteredMembers.map((member) => (
                  <Table.Tr
                    key={member.id}
                    className="border-t border-slate-100 dark:border-slate-800/60"
                  >
                    <Table.Td>
                      <span className="font-semibold text-sm text-slate-800 dark:text-white">
                        {member.name}
                      </span>
                    </Table.Td>
                    <Table.Td>
                      <code className="font-mono text-xs text-[#85F40F] bg-[#85F40F]/10 px-2 py-0.5 rounded-md">
                        {member.phone}
                      </code>
                    </Table.Td>
                    <Table.Td className="hidden md:table-cell">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {member.email || "—"}
                      </span>
                    </Table.Td>
                    <Table.Td className="hidden lg:table-cell">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {member.plan || "—"}
                      </span>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={STATUS_COLORS[member.status] || "gray"}
                        variant="light"
                        radius="md"
                        size="sm"
                      >
                        {t(`members.status.${member.status}`, member.status)}
                      </Badge>
                    </Table.Td>
                    <Table.Td className="hidden lg:table-cell">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {member.end_date || "—"}
                      </span>
                    </Table.Td>
                    {isOwner && (
                      <Table.Td>
                        <Group gap="xs" justify="flex-end">
                          <Tooltip label={t("common.edit", "Edit")} withArrow>
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleEdit(member.id)}
                            >
                              <FiEdit2 size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip
                            label={t("common.delete", "Delete")}
                            withArrow
                          >
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleDelete(member.id)}
                            >
                              <FiTrash2 size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
