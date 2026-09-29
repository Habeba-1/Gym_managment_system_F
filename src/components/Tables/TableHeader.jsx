import { Table } from "@mantine/core";

const TableHeader = ({ headers = [], className = "" }) => {
    return (
        <Table.Thead className="bg-slate-50/80 dark:bg-white/3">
            <Table.Tr className="border-b border-slate-200 dark:border-white/10">
                {headers?.map((head, index) => {
                    const isObj = typeof head === "object" && head !== null;
                    const label = isObj ? head.label : head;
                    const alignClass =
                        isObj && head.align === "center"
                            ? "text-center"
                            : isObj && head.align === "end"
                            ? "text-end"
                            : "text-start";

                    return (
                        <Table.Th
                            key={index}
                            className={`p-3.5 min-w-20 ${alignClass} text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider ${className} ${
                                isObj && head.className ? head.className : ""
                            }`}
                            style={isObj && head.width ? { width: head.width } : undefined}
                        >
                            {label}
                        </Table.Th>
                    );
                })}
            </Table.Tr>
        </Table.Thead>
    );
};

export default TableHeader;
