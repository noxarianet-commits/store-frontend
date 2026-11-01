import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bold, Code, Italic, List, Loader2, Save, StickyNote, X } from 'lucide-react';
import ProductNote from '../ui/ProductNote';

const MAX_NOTE_LENGTH = 2000;

const VariantNoteModal = ({ productName, variantName, initialNote, onClose, onSave }) => {
    const [note, setNote] = useState(initialNote || '');
    const [saving, setSaving] = useState(false);
    const textareaRef = useRef(null);

    const applyWrap = (before, after = before) => {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = note.slice(start, end);
        const next = `${note.slice(0, start)}${before}${selected}${after}${note.slice(end)}`;

        setNote(next);
        requestAnimationFrame(() => {
            el.focus();
            const cursorStart = start + before.length;
            const cursorEnd = end + before.length;
            el.setSelectionRange(cursorStart, start === end ? cursorStart : cursorEnd);
        });
    };

    const applyList = () => {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = note.slice(start, end);
        const block = selected
            ? selected.split('\n').map(line => `- ${line}`).join('\n')
            : '- ';
        const next = `${note.slice(0, start)}${block}${note.slice(end)}`;

        setNote(next);
        requestAnimationFrame(() => {
            el.focus();
            const cursor = start + block.length;
            el.setSelectionRange(cursor, cursor);
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(note);
        } catch {
            // Parent handles the error notification; keep the modal open.
        } finally {
            setSaving(false);
        }
    };

    const toolbarButton = 'p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors';

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0E0E0E]"
            >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/5 bg-white/2 p-6">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                            <StickyNote size={19} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-white">Catatan Varian</h2>
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                                {productName} <span className="text-gray-600">·</span> {variantName}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4 overflow-y-auto p-6">
                    <div>
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Isi Catatan
                        </label>
                        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-purple-500/50">
                            <div className="flex items-center gap-1 border-b border-white/10 bg-white/[0.02] px-2 py-1.5">
                                <button type="button" onClick={() => applyWrap('**')} className={toolbarButton} title="Bold">
                                    <Bold size={14} />
                                </button>
                                <button type="button" onClick={() => applyWrap('*')} className={toolbarButton} title="Italic">
                                    <Italic size={14} />
                                </button>
                                <button type="button" onClick={() => applyWrap('`')} className={toolbarButton} title="Inline code">
                                    <Code size={14} />
                                </button>
                                <button type="button" onClick={applyList} className={toolbarButton} title="Daftar">
                                    <List size={14} />
                                </button>
                                <span className="ml-auto pr-1 text-[10px] text-gray-600">Enter = baris baru</span>
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                maxLength={MAX_NOTE_LENGTH}
                                rows={8}
                                className="min-h-[180px] w-full resize-y bg-transparent p-3 text-sm leading-relaxed text-white placeholder-gray-600 focus:outline-none"
                                placeholder={'Contoh:\n- Max login 1 device\n- Garansi 30 hari\n\n**Penting:** jangan ganti password.'}
                            />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between gap-3">
                            <p className="text-[10px] leading-relaxed text-gray-600">
                                Format: **bold**, *italic*, `code`, dan daftar diawali &quot;- &quot;. Catatan ini tampil ke publik.
                            </p>
                            <span className={`shrink-0 text-[10px] ${note.length >= MAX_NOTE_LENGTH ? 'text-red-400' : 'text-gray-600'}`}>
                                {note.length}/{MAX_NOTE_LENGTH}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Preview</p>
                        <div className="min-h-[72px] rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            {note.trim() ? (
                                <ProductNote text={note} tone="dark" className="text-sm text-gray-200" />
                            ) : (
                                <p className="text-xs text-gray-600">Preview catatan akan muncul di sini.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 justify-end gap-3 border-t border-white/5 bg-white/2 p-6">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-white/10 px-6 py-3 text-sm text-gray-400 transition-all hover:border-white/20 hover:text-white"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-purple-700 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Simpan
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default VariantNoteModal;
