import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/ticketConfig';

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${config.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
};

export const PriorityBadge = ({ priority }) => {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal;
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${config.className}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;
