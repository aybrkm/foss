"use client";

import { useRef, useState } from "react";

type Props = {
  action: (formData: FormData) => void;
  id: string;
  label?: string;
  description?: string;
};

export function ConfirmDoneButton({
  action,
  id,
  label = "Tamamlandı",
  description = "Bu işlemin geri dönüşü yoktur.",
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  const submit = () => {
    formRef.current?.requestSubmit();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-emerald-400/40 px-3 py-1 text-xs text-emerald-200 transition hover:border-emerald-300 hover:text-white"
      >
        {label}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-slate-900/90 p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-sm font-semibold text-white text-left">Emin misin?</p>
            <p className="text-xs text-slate-300 text-left">{description}</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
                onClick={submit}
              >
                Onayla
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60"
                onClick={() => setOpen(false)}
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
      <form ref={formRef} action={action} className="hidden">
        <input type="hidden" name="id" value={id} />
      </form>
    </>
  );
}
