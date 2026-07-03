import { GraduationCap } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
          <div className="relative w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  )
}
