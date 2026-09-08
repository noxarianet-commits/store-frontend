/**
 * Utility functions for account target identification and account name sanitization.
 */

export const getTargetIdentifier = (dynamicFields, fieldData, selectedVariant) => {
    if (!fieldData) return `__${selectedVariant?.id || ''}`;
    const fields = Array.isArray(dynamicFields) ? dynamicFields : [];
    const targetField = fields.find(f =>
        f.key !== 'zone_id' && f.key !== 'server_id' && f.key !== 'provider_qty'
    );
    const primaryKey = targetField?.key || 'customer_id';
    const rawTarget = fieldData[primaryKey] ?? fieldData['customer_id'] ?? fieldData['user_id'] ?? fieldData['target'] ?? fieldData['note'] ?? (fields.length === 1 ? fieldData[fields[0].key] : '');
    const rawZone = fieldData['zone_id'] ?? fieldData['server_id'] ?? '';
    return `${String(rawTarget || '').trim()}_${String(rawZone || '').trim()}_${selectedVariant?.id || ''}`;
};

export const getSafeAccountName = (account) => {
    if (!account) return 'Valid';
    const raw = account.account_name ?? account.display_name ?? account.customer_name ?? account.username ?? account.nickname ?? account.name;
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    if (typeof raw === 'number') return String(raw);
    if (raw && typeof raw === 'object') {
        const nested = raw.name || raw.username || raw.nickname || raw.display_name || raw.account_name;
        if (typeof nested === 'string' && nested.trim()) return nested.trim();
        if (typeof nested === 'number') return String(nested);
        return 'Akun Terverifikasi';
    }
    return 'Valid';
};
