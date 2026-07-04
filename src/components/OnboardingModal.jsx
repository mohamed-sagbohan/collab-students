import { useState, useEffect, useId } from 'react'
import { useNavigate } from 'react-router'
import { GraduationCap, BookOpen, Zap, Award, ArrowRight, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Dialog } from './ui/Dialog'
import { Button } from './ui/Button'

const LS_KEY = 'learnit_onboarded'

const STEPS = [
  {
    icon: GraduationCap,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    title: 'Bienvenue sur LearnIT !',
    desc: 'Votre plateforme d\'initiation à l\'informatique. Apprenez à votre rythme, à partir de zéro.',
    cta: 'Continuer',
  },
  {
    icon: BookOpen,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    title: 'Des cours progressifs',
    desc: 'Chaque cours est découpé en leçons courtes et des exercices pratiques pour valider vos acquis en temps réel.',
    features: ['Leçons illustrées étape par étape', 'Exercices QCM et dactylographie', 'Progression enregistrée automatiquement'],
    cta: 'Continuer',
  },
  {
    icon: Award,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    title: 'Gagnez des badges',
    desc: 'Chaque accomplissement vous rapporte un badge et à la fin d\'un cours, un certificat téléchargeable.',
    features: ['8 badges à débloquer', 'Certificat PDF à la fin de chaque cours', 'Suivez votre progression sur le tableau de bord'],
    cta: 'Commencer l\'aventure !',
  },
]

export default function OnboardingModal() {
  const { profile } = useAuth()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()
  const titleId = useId()

  useEffect(() => {
    if (profile?.role === 'apprenante' && !localStorage.getItem(LS_KEY)) {
      setVisible(true)
    }
  }, [profile])

  function finish() {
    localStorage.setItem(LS_KEY, '1')
    setVisible(false)
    navigate('/cours')
  }

  function dismiss() {
    localStorage.setItem(LS_KEY, '1')
    setVisible(false)
  }

  const s = STEPS[step]
  const isLast = step === STEPS.length - 1
  const Icon = s.icon

  return (
    <Dialog open={visible} onClose={dismiss} labelledBy={titleId} className="max-w-md">
      <div key={step} className="animate-in fade-in duration-200">
        {/* Fermer */}
        <button
          onClick={dismiss}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icône */}
        <div className={`w-16 h-16 ${s.bg} border ${s.border} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
          <Icon className={`w-7 h-7 ${s.color}`} aria-hidden="true" />
        </div>

        {/* Contenu */}
        <h2 id={titleId} className="text-xl font-extrabold text-foreground text-center mb-3">{s.title}</h2>
        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-5">{s.desc}</p>

        {s.features && (
          <ul className="space-y-2 mb-6">
            {s.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                <div className={`w-5 h-5 rounded-full ${s.bg} border ${s.border} flex items-center justify-center shrink-0`}>
                  <Zap className={`w-2.5 h-2.5 ${s.color}`} aria-hidden="true" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* Indicateurs d'étapes */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Étape ${i + 1} sur ${STEPS.length}`}
              aria-current={i === step ? 'step' : undefined}
              className={`rounded-full transition-all ${
                i === step ? 'w-5 h-2 bg-primary' : 'w-2 h-2 bg-muted hover:bg-muted-foreground/40'
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <Button size="lg" onClick={isLast ? finish : () => setStep((s) => s + 1)} className="w-full font-bold">
          {s.cta}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
    </Dialog>
  )
}
