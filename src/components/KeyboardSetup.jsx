import { useState, useId } from 'react'
import { Keyboard, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { Dialog } from './ui/Dialog'

/* ══════════════════════════════════════════════════════════════
   Données par type de clavier
══════════════════════════════════════════════════════════════ */
export const KEYBOARDS = {
  azerty_fr: {
    label: 'AZERTY — France',
    flag: '🇫🇷',
    desc: 'Clavier standard utilisé en France',
    shortcuts: [
      { chars: 'é',             keys: ['É'],            note: 'Touche directe (à droite du chiffre 2)' },
      { chars: 'è',             keys: ['È'],            note: 'Touche directe (rangée du milieu, à droite)' },
      { chars: 'à',             keys: ['À'],            note: 'Touche directe (à droite du chiffre 0)' },
      { chars: 'ù',             keys: ['Ù'],            note: 'Touche directe' },
      { chars: 'ç',             keys: ['Ç'],            note: 'Touche directe' },
      { chars: 'ê â î ô û',    keys: ['^', '+ voyelle'],  note: 'Touche accent circonflexe [^] puis la voyelle souhaitée' },
      { chars: 'ë ï',          keys: ['¨', '+ voyelle'],  note: 'Touche tréma [¨] puis la voyelle souhaitée' },
      { chars: '@',             keys: ['AltGr', '0'],   note: 'Maintenez AltGr et appuyez sur la touche 0' },
      { chars: '€',             keys: ['AltGr', 'E'],   note: 'Maintenez AltGr et appuyez sur E' },
    ],
  },
  azerty_be: {
    label: 'AZERTY — Belgique',
    flag: '🇧🇪',
    desc: 'Clavier belge AZERTY',
    shortcuts: [
      { chars: 'é',             keys: ['É'],            note: 'Touche directe' },
      { chars: 'è',             keys: ['È'],            note: 'Touche directe' },
      { chars: 'à',             keys: ['À'],            note: 'Touche directe' },
      { chars: 'ç',             keys: ['Ç'],            note: 'Touche directe' },
      { chars: 'ê â î ô û',    keys: ['^', '+ voyelle'],  note: 'Touche [^] puis la voyelle' },
      { chars: 'ë ï',          keys: ['¨', '+ voyelle'],  note: 'Touche tréma [¨] puis la voyelle' },
      { chars: '@',             keys: ['AltGr', 'É'],   note: 'AltGr + touche É' },
      { chars: '€',             keys: ['AltGr', 'E'],   note: 'AltGr + touche E' },
    ],
  },
  qwerty_win: {
    label: 'QWERTY — Windows / Linux',
    flag: '🪟',
    desc: 'Clavier QWERTY International (Windows ou Linux)',
    shortcuts: [
      { chars: 'é',             keys: ["'", 'E'],       note: "Apostrophe ['] (touche morte) puis E" },
      { chars: 'è',             keys: ['`', 'E'],       note: 'Accent grave [`] (touche morte) puis E' },
      { chars: 'à',             keys: ['`', 'A'],       note: 'Accent grave [`] puis A' },
      { chars: 'ç',             keys: ['AltGr', ','],   note: 'AltGr maintenu + virgule' },
      { chars: 'ê â î ô û',    keys: ['Maj+6', '+ voyelle'], note: 'Maj+6 produit [^], relâchez, puis la voyelle' },
      { chars: 'ë ï',          keys: ['Maj+\'', '+ voyelle'], note: 'Maj+\' produit ["], relâchez, puis la voyelle' },
      { chars: '@',             keys: ['Maj', '2'],     note: 'Maj + touche 2' },
      { chars: '€',             keys: ['AltGr', '5'],   note: 'AltGr + touche 5 (varie selon le clavier)' },
    ],
  },
  mac: {
    label: 'Mac — tous claviers',
    flag: '🍎',
    desc: 'Apple Mac (AZERTY, QWERTY ou clavier international)',
    shortcuts: [
      { chars: 'é',             keys: ['⌥E', 'E'],      note: 'Option+E (accent aigu mort), relâchez, puis E' },
      { chars: 'è',             keys: ['⌥`', 'E'],      note: 'Option+` (accent grave mort), relâchez, puis E' },
      { chars: 'à',             keys: ['⌥`', 'A'],      note: 'Option+` puis A' },
      { chars: 'ç',             keys: ['⌥C'],           note: 'Option + C directement' },
      { chars: 'ê â î ô û',    keys: ['⌥I', '+ voyelle'], note: 'Option+I (circonflexe mort), relâchez, puis la voyelle' },
      { chars: 'ë ï',          keys: ['⌥U', '+ voyelle'], note: 'Option+U (tréma mort), relâchez, puis la voyelle' },
      { chars: '@',             keys: ['⌥('],           note: 'Option + ( — sur AZERTY Mac. Maj+2 sur QWERTY Mac.' },
      { chars: '€',             keys: ['⌥2'],           note: 'Option + 2 (AZERTY Mac) ou Maj+4 (QWERTY Mac)' },
    ],
  },
}

const LS_KEY = 'learnit_kb'

/* ── Hook ─────────────────────────────────────────────────── */
export function useKeyboardType() {
  const [type, setType] = useState(() => localStorage.getItem(LS_KEY) ?? null)
  const select = (t) => { localStorage.setItem(LS_KEY, t); setType(t) }
  const reset  = ()  => { localStorage.removeItem(LS_KEY); setType(null) }
  return [type, select, reset]
}

/* ── Sélecteur (modal plein écran) ───────────────────────── */
export function KeyboardSelector({ onSelect }) {
  const [hovered, setHovered] = useState(null)
  const titleId = useId()

  return (
    <Dialog open onClose={() => {}} labelledBy={titleId} className="max-w-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Keyboard className="w-7 h-7 text-primary" aria-hidden="true" />
        </div>
        <h2 id={titleId} className="text-2xl font-extrabold text-foreground mb-2">Quel est votre type de clavier ?</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Cette information nous permet d'afficher les <strong className="text-foreground">bons raccourcis</strong> pour
          taper les accents et caractères spéciaux pendant vos exercices de dactylographie.
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(KEYBOARDS).map(([key, kb]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
              hovered === key
                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/15 -translate-y-0.5'
                : 'bg-card border-border hover:border-primary/40'
            }`}
          >
            <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{kb.flag}</span>
            <div className="min-w-0">
              <p className="font-bold text-foreground text-sm leading-tight">{kb.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{kb.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Vous pourrez changer ce choix à tout moment depuis la leçon.
      </p>
    </Dialog>
  )
}

/* ── Fiche de raccourcis (au-dessus des exercices) ───────── */
function KeyBadge({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-mono font-bold bg-muted border border-border rounded-md text-foreground shadow-sm min-w-[32px]">
      {children}
    </kbd>
  )
}

export function KeyboardCheatSheet({ type, onReset }) {
  const [open, setOpen] = useState(true)
  const kb = KEYBOARDS[type]
  if (!kb) return null

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden mb-6">

      {/* Header cliquable */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{kb.flag}</span>
          <div>
            <p className="text-sm font-bold text-foreground leading-none">Guide de frappe — {kb.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Raccourcis pour les caractères spéciaux</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {open
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
          }
        </div>
      </button>

      {/* Tableau des raccourcis */}
      {open && (
        <div className="border-t border-primary/10 px-4 sm:px-5 py-4">
          <div className="space-y-3">
            {kb.shortcuts.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                {/* Caractères */}
                <div className="shrink-0 flex gap-1 flex-wrap min-w-[60px]">
                  {s.chars.split(' ').map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-card border border-border text-base font-bold text-foreground shadow-sm"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* Flèche + touches */}
                <div className="flex items-center gap-1.5 shrink-0 mt-1">
                  <span className="text-xs text-muted-foreground">→</span>
                  {s.keys.map((k, j) => (
                    <span key={j} className="flex items-center gap-1">
                      <KeyBadge>{k}</KeyBadge>
                      {j < s.keys.length - 1 && <span className="text-muted-foreground text-xs">+</span>}
                    </span>
                  ))}
                </div>

                {/* Note explicative */}
                <p className="text-xs text-muted-foreground leading-relaxed mt-1 hidden sm:block">{s.note}</p>
              </div>
            ))}
          </div>

          {/* Notes explicatives sur mobile (en dessous) */}
          <div className="sm:hidden mt-3 space-y-1">
            {kb.shortcuts.map((s, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground font-semibold">{s.chars} :</strong> {s.note}
              </p>
            ))}
          </div>

          {/* Changer de clavier */}
          <div className="mt-4 pt-4 border-t border-primary/10">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Changer de type de clavier
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
