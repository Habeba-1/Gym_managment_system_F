import { Paper, Table } from "@mantine/core";

const TableContainer = ({
    children,
    className = "",
    minWidth = "850px",
    verticalSpacing = "sm",
    highlightOnHover = true,
}) => {
    return (
        <Paper
            radius="2xl"
            className={`w-full bg-white dark:bg-[#0e1517] border border-slate-200 dark:border-slate-800 shadow-smoothCard overflow-hidden relative ${className}`}
        >
            <div className="w-full overflow-x-auto scrollbar-thin">
                <Table
                    verticalSpacing={verticalSpacing}
                    highlightOnHover={highlightOnHover}
                    className="w-full"
                    style={{ minWidth }}
                >
                    {children}
                </Table>
            </div>
        </Paper>
    );
};

export default TableContainer;
