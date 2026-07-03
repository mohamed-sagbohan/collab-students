-- ============================================================
-- Migration 003 — Exercices de dactylographie sur toutes les leçons
-- Exécutez dans Supabase > SQL Editor
-- ============================================================

DO $$
DECLARE
  v_lesson   UUID;
  v_ex       UUID;

  -- Tableau : (titre partiel de la leçon, texte à taper, durée en secondes)
  r RECORD;
BEGIN

  FOR r IN
    SELECT * FROM (VALUES

      -- ── Cours : Maîtriser son ordinateur ─────────────────────
      (
        'Allumer et éteindre',
        'Appuyez sur le bouton d''alimentation pour allumer votre ordinateur. Attendez que Windows se charge. Pour éteindre, cliquez sur Démarrer puis sur Arrêter.',
        75
      ),
      (
        'souris et ses fonctions',
        'La souris possède deux boutons principaux. Le clic gauche sélectionne un élément. Le clic droit ouvre un menu contextuel. La molette centrale fait défiler la page.',
        75
      ),
      (
        'clavier et les raccourcis',
        'Le clavier est votre meilleur allié pour travailler plus vite. Ctrl C copie, Ctrl V colle et Ctrl Z annule la dernière action. Entraînez-vous chaque jour.',
        60
      ),
      (
        'fichiers et dossiers',
        'Un dossier permet de ranger vos fichiers par catégorie. Faites un clic droit sur le bureau, choisissez Nouveau puis Dossier. Donnez-lui un nom court et clair.',
        75
      ),

      -- ── Cours : Internet ──────────────────────────────────────
      (
        'navigateurs',
        'Un navigateur web permet d''accéder à Internet. Chrome, Firefox et Edge sont les plus utilisés. Tapez une adresse dans la barre de navigation et appuyez sur Entrée.',
        80
      ),
      (
        'recherche efficace sur Google',
        'Internet est un réseau mondial. Pour faire une recherche, ouvrez votre navigateur et tapez vos mots-clés dans la barre de recherche Google.',
        70
      ),
      (
        'sites fiables',
        'Un site fiable affiche un cadenas dans la barre d''adresse. L''adresse commence par https. Méfiez-vous des sites qui demandent trop d''informations personnelles.',
        80
      ),

      -- ── Cours : Email et Gmail ────────────────────────────────
      (
        'compte Gmail',
        'Pour créer un compte Gmail, ouvrez Chrome et rendez-vous sur gmail.com. Cliquez sur Créer un compte et suivez les étapes. Choisissez un identifiant facile à retenir.',
        80
      ),
      (
        'pièce jointe',
        'Pour envoyer un fichier par email, cliquez sur Rédiger puis sur l''icône du trombone. Sélectionnez votre fichier et attendez qu''il soit téléchargé avant d''envoyer.',
        80
      ),

      -- ── Cours : Word ──────────────────────────────────────────
      (
        'interface Word',
        'Microsoft Word est un logiciel de traitement de texte. Cliquez sur Fichier puis Nouveau pour créer un document vierge. Enregistrez souvent avec le raccourci Ctrl S.',
        80
      ),
      (
        'Mettre en forme',
        'Pour mettre du texte en gras, sélectionnez-le et appuyez sur Ctrl B. Pour l''italique utilisez Ctrl I. Pour souligner, appuyez sur Ctrl U. Ce sont des raccourcis essentiels.',
        80
      ),
      (
        'listes et des tableaux',
        'Dans Word, cliquez sur Insertion puis Tableau pour créer un tableau. Choisissez le nombre de lignes et de colonnes. Cliquez dans chaque cellule pour saisir votre texte.',
        80
      ),
      (
        'Imprimer et enregistrer',
        'Pour enregistrer votre document en PDF, cliquez sur Fichier puis Enregistrer sous. Dans le menu format, choisissez PDF. Votre document sera lisible sur tous les appareils.',
        75
      ),

      -- ── Cours : Excel ─────────────────────────────────────────
      (
        'interface Excel',
        'Excel est organisé en lignes et colonnes. Chaque case s''appelle une cellule. Cliquez sur une cellule et tapez votre donnée. Appuyez sur Entrée pour valider et passer à la suivante.',
        85
      ),
      (
        'Saisir et formater',
        'Dans Excel, sélectionnez une plage de cellules et cliquez sur le bouton Gras pour mettre en forme. Utilisez la couleur de fond pour distinguer les titres de vos données.',
        85
      ),
      (
        'formules essentielles',
        'Une formule Excel commence toujours par le signe égal. Tapez =SOMME(A1:A10) pour additionner dix cellules. La formule =MOYENNE calcule la moyenne d''une plage de valeurs.',
        85
      ),
      (
        'graphique simple',
        'Pour créer un graphique, sélectionnez vos données et cliquez sur Insertion puis Graphique. Choisissez le type de graphique qui correspond le mieux à vos informations.',
        80
      ),

      -- ── Cours : PowerPoint ────────────────────────────────────
      (
        'interface PowerPoint',
        'PowerPoint permet de créer des diapositives. Cliquez sur Nouvelle diapositive pour en ajouter une. Choisissez une mise en page et cliquez pour saisir votre titre.',
        80
      ),
      (
        'ajouter des images',
        'Pour insérer une image dans PowerPoint, cliquez sur Insertion puis Images. Choisissez un fichier sur votre ordinateur. Redimensionnez-la en faisant glisser ses coins.',
        80
      ),
      (
        'animer',
        'Les animations rendent votre présentation plus vivante. Sélectionnez un élément, cliquez sur Animations et choisissez un effet. Préférez des animations simples et rapides.',
        80
      ),
      (
        'diaporama',
        'Pour lancer votre diaporama, appuyez sur la touche F5. Cliquez ou appuyez sur Espace pour passer à la diapositive suivante. Appuyez sur Échap pour quitter à tout moment.',
        80
      ),

      -- ── Cours : Sécurité ──────────────────────────────────────
      (
        'phishing',
        'Le phishing est une arnaque par email. Un faux message vous demande de cliquer sur un lien pour entrer votre mot de passe. Vérifiez toujours l''adresse de l''expéditeur.',
        85
      ),
      (
        'mot de passe solide',
        'Un mot de passe solide contient au moins 12 caractères, des majuscules, des minuscules, des chiffres et des symboles. Évitez les mots du dictionnaire et les dates de naissance.',
        85
      ),
      (
        'mises à jour',
        'Les mises à jour corrigent les failles de sécurité de votre système. Activez les mises à jour automatiques dans les paramètres Windows pour rester protégé en permanence.',
        80
      ),
      (
        'Wi-Fi public',
        'Évitez de vous connecter à votre banque sur un Wi-Fi public. Ces réseaux sont peu sécurisés. Utilisez votre connexion mobile ou un VPN pour protéger vos données personnelles.',
        85
      ),

      -- ── Cours : Numérique au quotidien ───────────────────────
      (
        'fichiers PDF',
        'Le format PDF permet de partager des documents sans qu''ils puissent être modifiés. Votre ordinateur peut ouvrir les PDF avec le navigateur. Adobe Reader offre plus de fonctions.',
        85
      ),
      (
        'smartphone',
        'Votre smartphone est un petit ordinateur. Vous pouvez y lire vos emails, consulter Internet et prendre des photos. Connectez-le au Wi-Fi pour économiser votre forfait mobile.',
        80
      ),
      (
        'réseaux sociaux',
        'Les réseaux sociaux permettent de partager des photos et des messages. Réglez votre compte en mode privé pour contrôler qui voit vos publications. Ne partagez pas d''informations sensibles.',
        90
      ),
      (
        'visioconférence',
        'La visioconférence permet de voir et d''entendre vos interlocuteurs à distance. Zoom et Google Meet sont les outils les plus populaires. Testez votre caméra avant chaque appel.',
        85
      ),

      -- ── Cours : Google Workspace ─────────────────────────────
      (
        'Drive',
        'Google Drive est un espace de stockage en ligne gratuit. Vous disposez de 15 Go d''espace. Glissez vos fichiers dans Drive pour les sauvegarder et y accéder depuis partout.',
        80
      ),
      (
        'Google Docs',
        'Google Docs enregistre automatiquement vos modifications dans le cloud. Cliquez sur le bouton Partager pour inviter un collaborateur. Vous pouvez travailler ensemble en temps réel.',
        85
      ),
      (
        'Google Sheets',
        'Google Sheets fonctionne comme Excel mais dans votre navigateur. Tapez vos données dans les cellules et utilisez les formules pour effectuer des calculs automatiquement.',
        80
      ),
      (
        'téléphone',
        'Installez l''application Google Drive sur votre smartphone. Connectez-vous avec votre compte Google pour accéder à tous vos fichiers depuis votre téléphone à tout moment.',
        80
      )

    ) AS t(lesson_keyword, typing_text, duration_sec)
  LOOP

    -- Trouver la leçon correspondante
    SELECT id INTO v_lesson
    FROM public.lessons
    WHERE title ILIKE ('%' || r.lesson_keyword || '%')
    LIMIT 1;

    IF v_lesson IS NULL THEN
      RAISE NOTICE 'Leçon non trouvée pour le mot-clé : %', r.lesson_keyword;
      CONTINUE;
    END IF;

    -- Vérifier qu'il n'y a pas déjà un exercice de dactylographie sur cette leçon
    IF EXISTS (
      SELECT 1
      FROM public.exercises ex
      JOIN public.questions q ON q.exercise_id = ex.id
      WHERE ex.lesson_id = v_lesson
        AND q.type = 'dactylographie'
    ) THEN
      RAISE NOTICE 'Exercice de dactylographie déjà présent pour : %', r.lesson_keyword;
      CONTINUE;
    END IF;

    -- Créer l'exercice
    INSERT INTO public.exercises (lesson_id, title, duration_seconds)
    VALUES (v_lesson, 'Exercice de dactylographie', r.duration_sec)
    RETURNING id INTO v_ex;

    -- Créer la question de type dactylographie
    INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, order_index)
    VALUES (
      v_ex,
      'Tapez le texte suivant aussi vite et précisément que possible :',
      'dactylographie',
      NULL,
      r.typing_text,
      1
    );

    RAISE NOTICE '✅ Dactylographie ajoutée → %', r.lesson_keyword;
  END LOOP;

  RAISE NOTICE '🎉 Migration 003 terminée.';
END $$;
