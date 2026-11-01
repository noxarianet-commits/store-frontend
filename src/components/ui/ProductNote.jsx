import { Fragment } from 'react';

const INLINE_FORMAT_RE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g;

function renderInline(text, tone) {
    const codeClass = tone === 'dark'
        ? 'rounded bg-white/10 px-1 py-0.5 font-mono text-[0.9em] text-purple-200'
        : 'rounded bg-purple-100/80 px-1 py-0.5 font-mono text-[0.9em] text-purple-700';

    return text
        .split(INLINE_FORMAT_RE)
        .filter(Boolean)
        .map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
                return <code key={index} className={codeClass}>{part.slice(1, -1)}</code>;
            }
            if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                return <em key={index} className="italic">{part.slice(1, -1)}</em>;
            }
            return <Fragment key={index}>{part}</Fragment>;
        });
}

/**
 * Safe renderer for public product variant notes.
 *
 * Supports:
 * - line breaks
 * - `- item` / `* item` bullet lists
 * - **bold**, *italic*, and `inline code`
 *
 * Rendered with React nodes only — never dangerouslySetInnerHTML.
 */
const ProductNote = ({ text, tone = 'light', className = '' }) => {
    if (!text || !String(text).trim()) return null;

    const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
    const blocks = [];
    let listItems = [];

    const flushList = () => {
        if (listItems.length === 0) return;
        blocks.push(
            <ul key={`list-${blocks.length}`} className="list-disc space-y-0.5 pl-4">
                {listItems.map((item, index) => (
                    <li key={index}>{renderInline(item, tone)}</li>
                ))}
            </ul>
        );
        listItems = [];
    };

    lines.forEach((rawLine, index) => {
        const line = rawLine.replace(/\s+$/, '');
        const bullet = line.match(/^\s*[-*]\s+(.*)$/);

        if (bullet) {
            listItems.push(bullet[1]);
            return;
        }

        flushList();

        if (!line.trim()) {
            blocks.push(<div key={`blank-${index}`} className="h-2" aria-hidden="true" />);
            return;
        }

        blocks.push(
            <p key={`line-${index}`} className="whitespace-pre-wrap break-words">
                {renderInline(line, tone)}
            </p>
        );
    });

    flushList();

    return (
        <div className={`space-y-0.5 leading-relaxed ${className}`}>
            {blocks}
        </div>
    );
};

export default ProductNote;
