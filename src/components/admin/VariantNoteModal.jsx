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

    const toolbarButton = 'p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-slate-200/60 transition-colors';

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-5 sm:p-6">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                            <StickyNote size={19} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-slate-900">Catatan Varian</h2>
                            <p className="mt-0.5 truncate text-xs text-slate-500 font-medium">
                                {productName} <span className="text-slate-300">·</span> {variantName}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4 overflow-y-auto p-5 sm:p-6">
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Isi Catatan
                        </label>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-purple-500 transition-colors">
                            <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-100/60 px-2 py-1.5">
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
                                <span className="ml-auto pr-1 text-[10px] text-slate-400 font-medium">Enter = baris baru</span>
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                maxLength={MAX_NOTE_LENGTH}
                                rows={8}
                                className="min-h-[160px] w-full resize-y bg-transparent p-3.5 text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none"
                                placeholder={'Contoh:\n- Max login 1 device\n- Garansi 30 hari\n\n**Penting:** jangan ganti password.'}
                            />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between gap-3">
                            <p className="text-[10px] text-slate-400 font-medium">
                                Format: **bold**, *italic*, `code`, dan daftar diawali &quot;- &quot;. Catatan ini tampil ke publik.
                            </p>
                            <span className={`shrink-0 text-[10px] font-mono ${note.length >= MAX_NOTE_LENGTH ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                                {note.length}/{MAX_NOTE_LENGTH}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Preview</p>
                        <div className="min-h-[64px] rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                            {note.trim() ? (
                                <ProductNote text={note} tone="light" className="text-sm text-slate-700" />
                            ) : (
                                <p className="text-xs text-slate-400">Preview catatan akan muncul di sini.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 shadow-xs"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-purple-700 shadow-xs disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        Simpan
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default VariantNoteModal;
