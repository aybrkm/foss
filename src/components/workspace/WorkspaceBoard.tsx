/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ColumnData = {
  id: string;
  title: string;
  width: number;
  cards: CardData[];
};

type CardData = {
  id: string;
  title: string;
  notes: string;
};

const MAX_COLUMNS = 8;
const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const isInteractiveElement = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return Boolean(target.closest("input, textarea, button, select, [data-drag-stop]"));
};

export function WorkspaceBoard({ initialColumns }: { initialColumns: ColumnData[] }) {
  const [columns, setColumns] = useState<ColumnData[]>(
    initialColumns.length > 0
      ? initialColumns
      : [
          { id: createId(), title: "Alan 1", width: 1, cards: [] },
          { id: createId(), title: "Alan 2", width: 1, cards: [] },
        ],
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState<Record<string, string>>({});
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [resizingColumnId, setResizingColumnId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<{ columnId: string; cardId: string } | null>(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const resizeInfo = useRef<{ columnId: string; startX: number; startWidth: number } | null>(null);
  const dragBlockRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canAddColumn = isEditMode && columns.length < MAX_COLUMNS;

  const persistColumns = useCallback(
    async (nextColumns: ColumnData[]) => {
      setSaving(true);
      try {
        await fetch("/api/workspace/layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            columns: nextColumns.map((column, position) => ({
              id: column.id,
              title: column.title,
              width: column.width,
              position,
              cards: column.cards.map((card, cardPosition) => ({
                id: card.id,
                title: card.title,
                notes: card.notes,
                position: cardPosition,
              })),
            })),
          }),
        });
      } catch (error) {
        console.warn("Workspace layout save failed", error);
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const schedulePersist = useCallback(
    (nextColumns: ColumnData[]) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        persistColumns(nextColumns);
      }, 800);
    },
    [persistColumns],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const updateColumns = useCallback(
    (updater: (prev: ColumnData[]) => ColumnData[]) => {
      setColumns((prev) => {
        const next = updater(prev);
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist],
  );

  const handleAddCard = useCallback(
    (columnId: string) => {
      if (!isEditMode) {
        return;
      }
      const title = newCardTitle[columnId]?.trim();
      if (!title) {
        return;
      }
      updateColumns((prev) =>
        prev.map((column) =>
          column.id === columnId
            ? { ...column, cards: [...column.cards, { id: createId(), title, notes: "" }] }
            : column,
        ),
      );
      setNewCardTitle((prev) => ({ ...prev, [columnId]: "" }));
    },
    [isEditMode, newCardTitle, updateColumns],
  );

  const handlePointerDownCapture = (event: React.PointerEvent<HTMLElement>) => {
    dragBlockRef.current = isInteractiveElement(event.target);
  };

  const handlePointerUpCapture = () => {
    dragBlockRef.current = false;
  };

  const handleCardDragStart = (event: React.DragEvent<HTMLDivElement>, cardId: string, sourceId: string) => {
    if (dragBlockRef.current) {
      event.preventDefault();
      dragBlockRef.current = false;
      return;
    }
    event.dataTransfer.setData("text/plain", JSON.stringify({ type: "card", cardId, sourceId }));
    event.dataTransfer.effectAllowed = "move";
    setDraggingCardId(cardId);
  };

  const moveCard = (columnId: string, cardId: string, direction: "up" | "down") => {
    updateColumns((prev) =>
      prev.map((column) => {
        if (column.id !== columnId) return column;
        const idx = column.cards.findIndex((c) => c.id === cardId);
        if (idx === -1) return column;
        const swapTo = direction === "up" ? idx - 1 : idx + 1;
        if (swapTo < 0 || swapTo >= column.cards.length) return column;
        const nextCards = [...column.cards];
        [nextCards[idx], nextCards[swapTo]] = [nextCards[swapTo], nextCards[idx]];
        return { ...column, cards: nextCards };
      }),
    );
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, targetColumnId: string | null) => {
    event.preventDefault();
    const payload = event.dataTransfer.getData("text/plain");
    if (!payload) {
      setDraggingCardId(null);
      setDraggingColumnId(null);
      setDragOverColumnId(null);
      return;
    }
    setDragOverColumnId(null);
    const parsed = JSON.parse(payload) as { type: "card" | "column"; cardId?: string; sourceId?: string; columnId?: string };

    if (parsed.type === "card" && parsed.cardId && parsed.sourceId) {
      updateColumns((prev) => {
        let movingCard: CardData | null = null;
        const stripped = prev.map((column) => {
          if (column.id === parsed.sourceId) {
            const remaining = column.cards.filter((card) => {
              if (card.id === parsed.cardId) {
                movingCard = card;
                return false;
              }
              return true;
            });
            return { ...column, cards: remaining };
          }
          return column;
        });
        if (!movingCard) {
          return stripped;
        }
        if (!targetColumnId) {
          return stripped;
        }
        return stripped.map((column) =>
          column.id === targetColumnId ? { ...column, cards: [...column.cards, movingCard as CardData] } : column,
        );
      });
    } else if (parsed.type === "column" && parsed.columnId) {
      if (!isEditMode) {
        setDraggingCardId(null);
        setDraggingColumnId(null);
        setDragOverColumnId(null);
        return;
      }
      updateColumns((prev) => {
        const currentIndex = prev.findIndex((column) => column.id === parsed.columnId);
        if (currentIndex === -1) {
          return prev;
        }
        const targetOriginalIndex = targetColumnId
          ? prev.findIndex((column) => column.id === targetColumnId)
          : prev.length - 1;

        const next = [...prev];
        const [movingColumn] = next.splice(currentIndex, 1);
        if (!targetColumnId) {
          next.push(movingColumn);
          return next;
        }
        const targetIndex = next.findIndex((column) => column.id === targetColumnId);
        if (targetIndex === -1) {
          next.push(movingColumn);
          return next;
        }
        const insertIndex = currentIndex < targetOriginalIndex ? targetIndex + 1 : targetIndex;
        next.splice(insertIndex, 0, movingColumn);
        return next;
      });
    }

    setDraggingCardId(null);
    setDraggingColumnId(null);
  };

  const handleAddColumn = () => {
    if (!isEditMode || columns.length >= MAX_COLUMNS) {
      return;
    }
    updateColumns((prev) => [
      ...prev,
      {
        id: createId(),
        title: `Alan ${prev.length + 1}`,
        width: 1,
        cards: [],
      },
    ]);
  };

  const handleRemoveColumn = (columnId: string) => {
    if (!isEditMode) {
      return;
    }
    updateColumns((prev) => prev.filter((column) => column.id !== columnId));
  };

  const handleColumnDragStart = (event: React.DragEvent<HTMLDivElement>, columnId: string) => {
    if (!isEditMode || dragBlockRef.current) {
      event.preventDefault();
      dragBlockRef.current = false;
      return;
    }
    event.dataTransfer.setData("text/plain", JSON.stringify({ type: "column", columnId }));
    event.dataTransfer.effectAllowed = "move";
    setDraggingColumnId(columnId);
  };

  const handleDragEnter = (columnId: string) => {
    setDragOverColumnId(columnId);
  };

  const allowDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>, columnId: string) => {
    if (!isEditMode) {
      return;
    }
    const column = columns.find((col) => col.id === columnId);
    if (!column) {
      return;
    }
    event.preventDefault();
    resizeInfo.current = {
      columnId,
      startX: event.clientX,
      startWidth: column.width,
    };
    setResizingColumnId(columnId);
  };

  useEffect(() => {
    if (!resizingColumnId) {
      return;
    }
    const handlePointerMove = (event: PointerEvent) => {
      const info = resizeInfo.current;
      if (!info) {
        return;
      }
      const delta = event.clientX - info.startX;
      const stepSize = 140;
      const steps = Math.round(delta / stepSize);
      const nextWidth = Math.min(4, Math.max(1, info.startWidth + steps));
      updateColumns((prev) =>
        prev.map((column) => {
          if (column.id !== info.columnId || column.width === nextWidth) {
            return column;
          }
          return { ...column, width: nextWidth };
        }),
      );
    };
    const handlePointerUp = () => {
      resizeInfo.current = null;
      setResizingColumnId(null);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [resizingColumnId, updateColumns]);

  const handleEditCard = (columnId: string, cardId: string, notes: string) => {
    setActiveCard({ columnId, cardId });
    setDraftNotes(notes);
  };

  const handleSaveNotes = () => {
    if (!activeCard) {
      return;
    }
    updateColumns((prev) =>
      prev.map((column) =>
        column.id === activeCard.columnId
          ? {
              ...column,
              cards: column.cards.map((card) =>
                card.id === activeCard.cardId ? { ...card, notes: draftNotes } : card,
              ),
            }
          : column,
      ),
    );
    setActiveCard(null);
  };

  const handleDeleteCard = (columnId: string, cardId: string) => {
    if (!isEditMode) {
      return;
    }
    updateColumns((prev) =>
      prev.map((column) =>
        column.id === columnId ? { ...column, cards: column.cards.filter((card) => card.id !== cardId) } : column,
      ),
    );
    if (activeCard && activeCard.cardId === cardId && activeCard.columnId === columnId) {
      setActiveCard(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-linear-to-br from-indigo-600/15 via-slate-950 to-slate-950 p-6 text-white shadow-[0_10px_40px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-fuchsia-200">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold">Alanlarini kendin kur</h1>
            <p className="mt-1 text-sm text-fuchsia-100/80">
              Istedigin kadar sutun ekle, kartlarini surukle, sutunlari kosesinden tutarak buyutup kucult. Grid ekran
              genisligine gore otomatik dagilir.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddColumn}
                disabled={!canAddColumn}
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold text-white transition ${
                  isEditMode
                    ? "border-white/20 bg-white/10 opacity-100 hover:border-fuchsia-300 hover:bg-fuchsia-500/20"
                    : "border-white/10 bg-white/5 opacity-0 pointer-events-none"
                }`}
              >
                Sutun ekle
              </button>
              <button
                type="button"
                data-drag-stop
                onClick={() => setIsEditMode((prev) => !prev)}
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold text-white transition ${
                  isEditMode
                    ? "border-emerald-300 bg-emerald-500/20 hover:border-emerald-200 hover:bg-emerald-500/25"
                    : "border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20"
                }`}
              >
                Edit
              </button>
            </div>
            <p className="text-xs tracking-[0.3em] text-slate-400">{saving ? "Kaydediliyor..." : "Kaydedildi"}</p>
          </div>
        </div>
      </section>

      <section className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((column) => (
          <div
            key={column.id}
            draggable={isEditMode}
            onDragStart={(event) => handleColumnDragStart(event, column.id)}
            onDragOver={allowDrop}
            onDragEnter={() => handleDragEnter(column.id)}
            onDrop={(event) => handleDrop(event, column.id)}
            onPointerDownCapture={handlePointerDownCapture}
            onPointerUpCapture={handlePointerUpCapture}
            style={{
              gridColumn: `span ${Math.min(column.width, 4)} / span ${Math.min(column.width, 4)}`,
              opacity: draggingColumnId === column.id ? 0.5 : 1,
            }}
            className={`relative flex min-h-80 flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-5 transition ${
              dragOverColumnId === column.id && draggingColumnId ? "ring-2 ring-fuchsia-300" : ""
            }`}
          >
            <div className="space-y-2">
              <div className="-mx-5 mb-3 rounded-t-2xl px-4 py-3">
                <div className="flex items-center justify-between gap-2 rounded-t-2xl px-3 py-2 shadow-sm"
                  style={{ background: 'linear-gradient(90deg,#0ea5e9aa 0%,#6366f1aa 100%)' }}>
                  {isEditMode ? (
                    <input
                      value={column.title}
                      onChange={(event) =>
                        updateColumns((prev) =>
                          prev.map((col) => (col.id === column.id ? { ...col, title: event.target.value } : col)),
                        )
                      }
                      className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-lg font-semibold uppercase tracking-wide text-white focus:outline-none"
                    />
                  ) : (
                    <p className="w-full text-lg font-semibold uppercase tracking-wide text-white">{column.title}</p>
                  )}
                  {isEditMode && (
                    <button
                      type="button"
                      aria-label="Sutunu sil"
                      onClick={() => handleRemoveColumn(column.id)}
                      className="ml-2 rounded-full border border-white/20 bg-white/10 px-2 text-xs font-bold text-white transition"
                    >
                      x
                    </button>
                  )}
                </div>
              </div>
              {isEditMode && (
                <div className="flex gap-2">
                  <input
                    value={newCardTitle[column.id] ?? ""}
                    placeholder="Kart basligi"
                    onChange={(event) => setNewCardTitle((prev) => ({ ...prev, [column.id]: event.target.value }))}
                    className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 focus:border-fuchsia-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCard(column.id)}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition"
                  >
                    Ekle
                  </button>
                </div>
              )}
            </div>

            <div
              className="flex flex-1 flex-col gap-3"
              onDragOver={allowDrop}
              onDrop={(event) => handleDrop(event, column.id)}
            >
              {column.cards.map((card) => (
                <div
                  key={card.id}
                  draggable={false}
                  onPointerDownCapture={handlePointerDownCapture}
                  onPointerUpCapture={handlePointerUpCapture}
                  className={`${
                    isEditMode ? "cursor-default" : "cursor-pointer"
                  } rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-100 shadow-[0_5px_25px_rgba(15,23,42,0.45)] hover:border-white/30 hover:bg-slate-900/80 ${
                    draggingCardId === card.id ? "opacity-60" : ""
                  }`}
                  onClick={() => handleEditCard(column.id, card.id, card.notes)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{card.title}</span>
                    <div className="flex items-center gap-2">
                      {isEditMode && (
                        <>
                          <button
                            type="button"
                            aria-label="Yukar Move up"
                            onClick={(event) => {
                              event.stopPropagation();
                              moveCard(column.id, card.id, "up");
                            }}
                            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/10"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            aria-label="Aşağı Move down"
                            onClick={(event) => {
                              event.stopPropagation();
                              moveCard(column.id, card.id, "down");
                            }}
                            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/10"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            aria-label="Karti sil"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteCard(column.id, card.id);
                            }}
                            className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-400 hover:border-rose-300 hover:text-rose-200"
                          >
                            Sil
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {column.cards.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/5 p-6 text-center text-xs text-slate-500">
                  Kart ekleyip surukleyebilirsin.
                </div>
              )}
            </div>

            {isEditMode && (
              <div
                role="presentation"
                onPointerDown={(event) => handleResizeStart(event, column.id)}
                className={`absolute bottom-2 right-2 flex h-6 w-6 cursor-ew-resize items-center justify-center rounded-full border border-white/20 bg-white/10 text-[10px] text-white transition ${
                  resizingColumnId === column.id ? "border-fuchsia-300 text-fuchsia-200" : ""
                }`}
              >
                ⇔
              </div>
            )}
          </div>
        ))}
        {isEditMode && draggingColumnId && (
          <div
            className="rounded-3xl border border-dashed border-fuchsia-300/60 bg-fuchsia-500/10 p-5 text-center text-sm text-fuchsia-100"
            onDragOver={allowDrop}
            onDrop={(event) => handleDrop(event, null)}
          >
            Sutunu buraya birak
          </div>
        )}
      </section>

      {activeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/90 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Kart detayi</h2>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              {columns.find((column) => column.id === activeCard.columnId)?.cards.find((card) => card.id === activeCard.cardId)
                ?.title ?? ""}
            </p>
            <textarea
              value={draftNotes}
              onChange={(event) => setDraftNotes(event.target.value)}
              className="mt-4 h-48 w-full rounded-2xl border border-white/20 bg-black/40 p-4 text-sm text-white focus:border-fuchsia-300 focus:outline-none"
              placeholder="Notlarini yaz..."
            />
            <div className="mt-4 flex gap-3 text-sm">
              <button
                type="button"
                onClick={handleSaveNotes}
                className="rounded-2xl border border-fuchsia-300 bg-fuchsia-500/20 px-4 py-2 font-semibold text-white hover:bg-fuchsia-500/30"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => setActiveCard(null)}
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-white hover:border-white/40"
              >
                Vazgec
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
