import { Package } from 'lucide-react';
import { iconMap } from './iconMap';

const IconRenderer = ({ name, size = 20 }) => {
    const Icon = iconMap[name];
    return Icon ? <Icon size={size} /> : <Package size={size} />;
};

export default IconRenderer;
