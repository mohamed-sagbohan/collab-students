-- ============================================================
-- Migration 012 — Fiches PDF + vidéos YouTube par cours
-- Exécutez dans Supabase > SQL Editor
-- ============================================================

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS fiche_content   jsonb,
  ADD COLUMN IF NOT EXISTS youtube_videos  jsonb;

-- ── Cours pilote : "Maîtriser son ordinateur" ───────────────────
-- fiche_content : contenu structuré utilisé par src/lib/fichePdf.js
-- pour générer la fiche mémo PDF côté client (jsPDF).
-- youtube_videos : vidéos vérifiées (existence + accessibilité)
-- traitant des mêmes sujets que les leçons du cours.

UPDATE public.courses
SET
  fiche_content = '{
    "subtitle": "Fiche mémo à télécharger et conserver — les bases essentielles pour bien débuter",
    "sections": [
      {
        "heading": "Allumer et éteindre correctement",
        "items": [
          "Pour allumer : appuyez une seule fois sur le bouton d''alimentation (façade de la tour, ou près du clavier sur un portable) et patientez jusqu''à l''affichage du bureau.",
          "Pour éteindre : fermez vos programmes, cliquez sur le bouton Démarrer (logo Windows), puis sur l''icône Marche/Arrêt, puis « Arrêter ».",
          "Ne coupez jamais le courant et n''appuyez jamais sur le bouton physique pour éteindre : vous risquez d''endommager vos fichiers ou le système.",
          "Si l''ordinateur ne répond plus du tout, un appui long de 5 à 10 secondes sur le bouton d''alimentation force l''extinction — à réserver en tout dernier recours.",
          "La « Veille » éteint l''écran sans fermer vos programmes ; « Redémarrer » éteint puis rallume l''ordinateur, utile après une mise à jour."
        ]
      },
      {
        "heading": "Le bureau, les fenêtres et la barre des tâches",
        "items": [
          "Le Bureau est l''écran d''accueil : il affiche des icônes (raccourcis vers programmes et dossiers) sur un fond d''écran.",
          "La barre des tâches, en bas de l''écran, contient le bouton Démarrer à gauche, les icônes des programmes ouverts ou épinglés au centre, et l''heure/le réseau/le volume à droite.",
          "Une fenêtre se réduit, s''agrandit ou se ferme grâce aux trois boutons en haut à droite (réduire, agrandir, fermer).",
          "Pour passer d''une fenêtre ouverte à une autre : cliquez sur son icône dans la barre des tâches, ou utilisez le raccourci Alt + Tab.",
          "Le bouton Démarrer ouvre la liste de toutes vos applications installées et l''accès aux Paramètres."
        ]
      },
      {
        "heading": "La souris et ses fonctions",
        "items": [
          "Clic gauche (simple) : sélectionner un élément ou activer un bouton.",
          "Double-clic gauche : ouvrir un fichier, un dossier ou une application.",
          "Clic droit : afficher un menu avec des actions supplémentaires (copier, renommer, propriétés…).",
          "Clic maintenu + glisser (glisser-déposer) : déplacer un fichier, une icône ou une fenêtre.",
          "Molette : faire défiler une page ou un document vers le haut ou le bas.",
          "La vitesse du curseur se règle dans Paramètres > Bluetooth et appareils > Souris."
        ]
      },
      {
        "heading": "Le clavier et les raccourcis essentiels",
        "items": [
          "Ctrl + C : copier — Ctrl + X : couper — Ctrl + V : coller.",
          "Ctrl + Z : annuler la dernière action — Ctrl + Y : la rétablir.",
          "Ctrl + S : enregistrer le document en cours.",
          "Ctrl + A : tout sélectionner.",
          "Alt + Tab : basculer rapidement entre les fenêtres ouvertes.",
          "Touche Windows : ouvrir/fermer le menu Démarrer — Windows + L : verrouiller l''ordinateur.",
          "Échap : annuler ou fermer une fenêtre ou un menu ouvert."
        ]
      },
      {
        "heading": "Organiser ses fichiers et dossiers",
        "items": [
          "Un dossier regroupe plusieurs fichiers d''un même thème (ex. « Factures », « Photos vacances »).",
          "Pour créer un dossier : clic droit sur le Bureau ou dans l''Explorateur de fichiers > Nouveau > Dossier, puis donnez-lui un nom clair.",
          "L''Explorateur de fichiers (icône dossier jaune dans la barre des tâches) permet de naviguer entre Documents, Images, Téléchargements, etc.",
          "Pour déplacer ou copier un fichier : sélectionnez-le, clic droit > Couper (ou Copier), ouvrez le dossier de destination, clic droit > Coller.",
          "Donnez des noms clairs et datés à vos fichiers (ex. « Facture-electricite-2026-07 ») pour les retrouver facilement."
        ]
      }
    ]
  }'::jsonb,
  youtube_videos = '[
    { "title": "Comment démarrer un ordinateur ? (Cours informatique débutant)", "url": "https://www.youtube.com/watch?v=V3FC9CeDLSg" },
    { "title": "Cours informatique débutant : Les bases de Windows 10 (tuto français)", "url": "https://www.youtube.com/watch?v=jvL8jUglStA" },
    { "title": "Apprendre à utiliser la souris (Cours informatique débutant)", "url": "https://www.youtube.com/watch?v=zxyui84Asx8" },
    { "title": "Cours informatique débutant senior : apprendre le clavier de l''ordinateur (partie 1)", "url": "https://www.youtube.com/watch?v=RkU47wG-f64" },
    { "title": "Comment gérer vos fichiers et dossiers sous Windows 10 (pour débutant)", "url": "https://www.youtube.com/watch?v=TJOtf3nL5EY" }
  ]'::jsonb
WHERE title = 'Maîtriser son ordinateur';
