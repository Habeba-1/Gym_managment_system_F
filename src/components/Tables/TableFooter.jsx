import { useEffect } from "react";
import { Pagination, Table } from "@mantine/core";

const TableFooter = ({
    activePage = 1,
    setPage,
    total = 1,
    colSpan = 1,
    size = "sm",
    totalItems,
    itemName = "records",
}) => {
    if (!total || total <= 0) return null;

    useEffect(() => {
        if (total < activePage && setPage) {
            setPage(total);
        }
    }, [total, activePage, setPage]);

    const handlePageChange = (page) => {
        setPage?.(page);

        // Smooth scroll to top of main scrollable area
        const scrollContainer = document.querySelector('main[data-panel="true"]') || document.querySelector('.overflow-y-auto');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <Table.Tfoot>
            <Table.Tr className="border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/1">
                <Table.Td colSpan={colSpan} className="p-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
                        {totalItems !== undefined && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                Showing page <span className="font-bold text-slate-800 dark:text-white">{activePage}</span> of{" "}
                                <span className="font-bold text-slate-800 dark:text-white">{total}</span> ({totalItems} {itemName})
                            </div>
                        )}

                        <div className="flex justify-center items-center w-full sm:w-auto ml-auto">
                            <Pagination
                                value={activePage || 1}
                                onChange={handlePageChange}
                                total={total}
                                color="lime"
                                radius="md"
                                size={size}
                                className="flex justify-center items-center"
                                classNames={{
                                    control:
                                        'data-[active]:!bg-[#85F40F] data-[active]:!text-[#061400] data-[active]:!font-black data-[active]:!border-[#85F40F] dark:border-slate-800 dark:bg-transparent',
                                }}
                            />
                        </div>
                    </div>
                </Table.Td>
            </Table.Tr>
        </Table.Tfoot>
    );
};

export default TableFooter;
