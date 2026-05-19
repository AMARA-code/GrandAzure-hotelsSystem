from pathlib import Path
import re

p = Path(__file__).resolve().parents[1] / "src/components/guest-portal/BookExperience.tsx"
t = p.read_text(encoding="utf-8")

t = re.sub(
    r"\n  const handleFormBookWithoutPayment = async \(event: MouseEvent<HTMLButtonElement>\) => \{.*?\n  \}\n",
    "\n",
    t,
    count=1,
    flags=re.DOTALL,
)

old_buttons = """                      <div className="grid w-full gap-3 sm:w-auto sm:grid-flow-col">
                        <button type="button" onClick={handleFormBookWithoutPayment}
                          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-stone-900 bg-[#f5f0eb] border border-[#e7d6c3] transition-all hover:bg-[#efe4d7]">
                          <Check className="h-4 w-4" /> Continue without payment
                        </button>
                        <button type="button" onClick={handleFormContinueToPayment}
                          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                          style={{ background:'#D4722A', boxShadow:'0 4px 14px rgba(212,114,42,0.4)' }}>
                          <CalendarDays className="h-4 w-4" /> Continue to Payment
                        </button>
                      </motion.div>"""
old_buttons = old_buttons.replace("motion.div", "div")

new_buttons = """                      <button type="button" onClick={handleFormContinueToPayment}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 sm:w-auto"
                        style={{ background:'#D4722A', boxShadow:'0 4px 14px rgba(212,114,42,0.4)' }}>
                        <CalendarDays className="h-4 w-4" /> Book
                      </button>"""

if old_buttons not in t:
    raise SystemExit("OLD BUTTONS NOT FOUND")
t = t.replace(old_buttons, new_buttons)

old_modal = """          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4">
            <motion.div initial={{ opacity:0, y:24, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:16, scale:0.97 }} transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#efdecb] shadow-2xl"
              style={{ background:'linear-gradient(to bottom,#ffffff,#fdf8f2)' }}>"""
old_modal = old_modal.replace("motion.div", "div")

new_modal = """          <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-0 sm:items-center sm:p-4">
            <motion.div initial={{ opacity:0, y:24, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:16, scale:0.97 }} transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
              className="relative flex w-full max-w-2xl max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl border border-[#efdecb] shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
              style={{ background:'linear-gradient(to bottom,#ffffff,#fdf8f2)' }}>"""

if old_modal not in t:
    raise SystemExit("OLD MODAL NOT FOUND")
t = t.replace(old_modal, new_modal)

marker = '<AnimatePresence mode="wait">'
idx = t.find(marker)
if idx == -1:
    raise SystemExit("AnimatePresence not found")
# Only patch modal AnimatePresence (second occurrence after BOOKING MODAL)
modal_marker = "BOOKING MODAL"
modal_idx = t.find(modal_marker)
idx = t.find(marker, modal_idx)

old_close = """                <button onClick={resetModal} className="absolute right-4 top-4 z-10 rounded-xl border border-[#ead8c4] bg-white/80 p-2 text-stone-500 hover:bg-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}

              <AnimatePresence mode="wait">"""

new_close = """                <button onClick={resetModal} className="absolute right-3 top-3 z-20 rounded-xl border border-[#ead8c4] bg-white/90 p-2 text-stone-500 shadow-sm hover:bg-white transition-colors sm:right-4 sm:top-4">
                  <X className="h-4 w-4" />
                </button>
              )}

              <div className="booking-modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth">
              <AnimatePresence mode="wait">"""

if old_close not in t:
    raise SystemExit("CLOSE BLOCK NOT FOUND")
t = t.replace(old_close, new_close, 1)

end = """              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}"""
end = end.replace("motion.div", "motion.div")
end = """              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}"""
# actual file ending
end = """              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}"""
end = """              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}"""

end_new = """              </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}"""

if end not in t:
    # try without motion.div on outer
    end = """              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}"""
    end_new = """              </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}"""

if end not in t:
    raise SystemExit(f"END BLOCK NOT FOUND: {repr(end[:80])}")

t = t.replace(end, end_new, 1)

t = t.replace('className="grid grid-cols-1 gap-4 sm:grid-cols-2"', 'className="grid grid-cols-1 gap-4 md:grid-cols-2"', 1)

# trust row - only in payment_choice section
t = t.replace(
    '                    <div className="mt-5 flex items-center justify-center gap-5">',
    '                    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-5">',
    1,
)

# jazzcash amount responsive (first occurrence after jazzcash_instructions)
jazz_idx = t.find("jazzcash_instructions")
if jazz_idx != -1:
    sub = t[jazz_idx : jazz_idx + 2500]
    sub2 = sub.replace(
        '<div className="flex justify-between items-start">',
        '<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">',
        1,
    )
    sub2 = sub2.replace(
        '<div className="text-right">',
        '<div className="text-left sm:text-right">',
        1,
    )
    sub2 = sub2.replace(
        '<p className="text-3xl font-bold"',
        '<p className="text-2xl font-bold sm:text-3xl"',
        1,
    )
    t = t[:jazz_idx] + sub2 + t[jazz_idx + 2500 :]

scroll_css = """
      <style>{`
        .booking-modal-scroll { scrollbar-width: thin; scrollbar-color: #e2a77d #fdf8f2; }
        .booking-modal-scroll::-webkit-scrollbar { width: 8px; }
        .booking-modal-scroll::-webkit-scrollbar-thumb { background: #e2a77d; border-radius: 999px; }
        .booking-modal-scroll::-webkit-scrollbar-track { background: #fdf8f2; }
      `}</style>"""

if "booking-modal-scroll" in t and ".booking-modal-scroll {" not in t:
    t = t.replace("\n    </motion.div>\n  )\n}", scroll_css + "\n    </motion.div>\n  )\n}", 1)

p.write_text(t, encoding="utf-8")
print("OK")
