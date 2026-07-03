-- ============================================================
-- Migration 016 — Quiz de leçons (partie 2/2)
-- Exécutez dans Supabase > SQL Editor (après la migration 015)
-- ============================================================

-- ============================================================
-- PowerPoint – Présentations
-- ============================================================

-- ── Créer sa première présentation ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'PowerPoint – Présentations' AND l.title = 'Créer sa première présentation'),
  'Quiz — Créer sa première présentation'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Créer sa première présentation'), 'Que représente la première diapositive d''une présentation ?', 'qcm', '["Une diapositive vide obligatoire","Généralement la page de titre","La conclusion","Une image de fond uniquement"]', 'Généralement la page de titre', 'La première diapositive sert habituellement de page de titre, présentant le sujet de la présentation avant de développer le contenu.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Créer sa première présentation'), 'Vrai ou Faux : Les thèmes appliquent d''un coup des couleurs et polices cohérentes à toute la présentation.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Choisir un thème applique automatiquement un ensemble cohérent de couleurs, polices et styles à toutes les diapositives.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Créer sa première présentation'), 'Comment réorganiser l''ordre des diapositives ?', 'qcm', '["Ce n''est pas possible une fois créées","Par glisser-déposer dans le volet de gauche","En renommant chaque diapositive","En les supprimant puis recréant dans l''ordre"]', 'Par glisser-déposer dans le volet de gauche', 'Le volet de gauche affiche les miniatures des diapositives ; un simple glisser-déposer permet de changer leur ordre facilement.', 3);

-- ── Ajouter du texte et des images ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'PowerPoint – Présentations' AND l.title = 'Ajouter du texte et des images'),
  'Quiz — Ajouter du texte et des images'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Ajouter du texte et des images'), 'Comment insérer une image dans une diapositive ?', 'qcm', '["Onglet Insertion > Images","Onglet Accueil > Enregistrer","Ctrl + I uniquement","Ce n''est pas possible dans PowerPoint"]', 'Onglet Insertion > Images', 'L''onglet Insertion propose l''outil Images pour choisir un fichier depuis votre ordinateur et l''ajouter à la diapositive.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Ajouter du texte et des images'), 'Vrai ou Faux : Il faut tirer sur un coin de l''image pour la redimensionner sans déformer ses proportions.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Tirer sur un coin (plutôt que sur un bord) conserve les proportions d''origine de l''image, évitant qu''elle paraisse étirée ou écrasée.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Ajouter du texte et des images'), 'Quelle est une bonne pratique pour le texte d''une diapositive ?', 'qcm', '["Écrire un maximum de texte détaillé","Limiter le texte à l''essentiel","Ne jamais mettre de texte","Utiliser uniquement des majuscules"]', 'Limiter le texte à l''essentiel', 'Une présentation se lit rapidement par l''audience : trop de texte détaillé la rend illisible et détourne l''attention du présentateur.', 3);

-- ── Animer et présenter ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'PowerPoint – Présentations' AND l.title = 'Animer et présenter'),
  'Quiz — Animer et présenter'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Animer et présenter'), 'Quelle touche lance le diaporama en plein écran ?', 'qcm', '["F5","Ctrl + P","Alt + F4","Échap"]', 'F5', 'La touche F5 lance immédiatement le mode Diaporama en plein écran, à partir de la première diapositive.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Animer et présenter'), 'Vrai ou Faux : Il vaut mieux utiliser un maximum d''animations différentes pour rendre la présentation plus vivante.', 'vrai_faux', '["Vrai","Faux"]', 'Faux', 'Trop d''animations différentes distraient l''audience du contenu ; il vaut mieux les utiliser avec modération et de façon cohérente.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Animer et présenter'), 'À quoi sert le mode Présentateur ?', 'qcm', '["À masquer les diapositives au public","À afficher vos notes sur votre écran, invisibles pour le public projeté","À imprimer automatiquement la présentation","À supprimer les animations"]', 'À afficher vos notes sur votre écran, invisibles pour le public projeté', 'Le mode Présentateur affiche vos notes personnelles et la diapositive suivante sur votre écran, pendant que le public ne voit que la diapositive projetée.', 3);

-- ============================================================
-- Sécurité et bonnes pratiques
-- ============================================================

-- ── Reconnaître les arnaques en ligne ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Sécurité et bonnes pratiques' AND l.title = 'Reconnaître les arnaques en ligne'),
  'Quiz — Reconnaître les arnaques en ligne'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Reconnaître les arnaques en ligne'), 'Qu''est-ce que le phishing (hameçonnage) ?', 'qcm', '["Un virus qui détruit les fichiers","Une technique qui imite un site ou email connu pour voler des identifiants","Un type de mot de passe","Une mise à jour Windows"]', 'Une technique qui imite un site ou email connu pour voler des identifiants', 'Le phishing consiste à se faire passer pour une entreprise de confiance afin de tromper la victime et lui voler ses identifiants.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Reconnaître les arnaques en ligne'), 'Vrai ou Faux : Un message qui crée un sentiment d''urgence (compte bloqué sous 24h) est souvent suspect.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Les arnaqueurs jouent souvent sur l''urgence pour empêcher la victime de réfléchir et de vérifier l''authenticité du message avant d''agir.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Reconnaître les arnaques en ligne'), 'Que faire face à un lien reçu par SMS ou email suspect ?', 'qcm', '["Cliquer dessus pour vérifier","Taper soi-même l''adresse officielle dans le navigateur plutôt que de cliquer","Répondre en donnant ses informations","Transférer le lien à tous ses contacts"]', 'Taper soi-même l''adresse officielle dans le navigateur plutôt que de cliquer', 'Il vaut mieux ne jamais cliquer sur un lien suspect et se rendre directement sur le site officiel en tapant l''adresse soi-même dans le navigateur.', 3);

-- ── Protéger ses données et faire des sauvegardes ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Sécurité et bonnes pratiques' AND l.title = 'Protéger ses données et faire des sauvegardes'),
  'Quiz — Protéger ses données et faire des sauvegardes'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Protéger ses données et faire des sauvegardes'), 'Qu''est-ce qu''une sauvegarde ?', 'qcm', '["Un antivirus","Une copie de vos fichiers importants stockée à un autre endroit","Un mot de passe renforcé","Une mise à jour automatique"]', 'Une copie de vos fichiers importants stockée à un autre endroit', 'Sauvegarder consiste à conserver une copie de ses fichiers sur un support différent pour ne rien perdre en cas de panne ou de vol.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Protéger ses données et faire des sauvegardes'), 'Vrai ou Faux : La règle 3-2-1 recommande 3 copies de vos données sur 2 supports différents, dont 1 hors de votre domicile.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'La règle 3-2-1 est une bonne pratique reconnue : 3 copies, 2 supports différents, 1 copie hors site pour se protéger de tout scénario.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Protéger ses données et faire des sauvegardes'), 'Quel est l''avantage d''un service cloud comme Google Drive pour la sauvegarde ?', 'qcm', '["Il sauvegarde automatiquement vos fichiers synchronisés","Il ralentit l''ordinateur","Il remplace l''antivirus","Il empêche tout partage de fichiers"]', 'Il sauvegarde automatiquement vos fichiers synchronisés', 'Les services cloud synchronisent vos fichiers en continu, ce qui constitue une sauvegarde automatique dès qu''une connexion internet est disponible.', 3);

-- ── Mettre à jour ses logiciels ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Sécurité et bonnes pratiques' AND l.title = 'Mettre à jour ses logiciels'),
  'Quiz — Mettre à jour ses logiciels'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Mettre à jour ses logiciels'), 'Pourquoi est-il important de mettre à jour ses logiciels ?', 'qcm', '["Uniquement pour changer l''apparence du logiciel","Pour corriger des failles de sécurité découvertes après la sortie du logiciel","Cela n''a aucune importance","Pour ralentir volontairement l''ordinateur"]', 'Pour corriger des failles de sécurité découvertes après la sortie du logiciel', 'Les mises à jour corrigent des failles de sécurité identifiées après la sortie du logiciel ; les ignorer expose l''ordinateur à des risques évitables.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Mettre à jour ses logiciels'), 'Vrai ou Faux : Il est prudent de télécharger une mise à jour proposée par une fenêtre pop-up surgissant sur un site web.', 'vrai_faux', '["Vrai","Faux"]', 'Faux', 'Une mise à jour légitime passe toujours par le logiciel officiel lui-même (ou Windows Update), jamais par une fenêtre pop-up surgissant sur un site web.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Mettre à jour ses logiciels'), 'Où activer les mises à jour automatiques de Windows ?', 'qcm', '["Dans la Corbeille","Dans Paramètres > Windows Update","Dans le navigateur uniquement","Ce n''est pas possible sur Windows"]', 'Dans Paramètres > Windows Update', 'Paramètres > Windows Update permet d''activer les mises à jour automatiques, garantissant que le système reste protégé sans y penser.', 3);

-- ============================================================
-- Outils du quotidien numérique
-- ============================================================

-- ── Lire et créer des fichiers PDF ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Outils du quotidien numérique' AND l.title = 'Lire et créer des fichiers PDF'),
  'Quiz — Lire et créer des fichiers PDF'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Lire et créer des fichiers PDF'), 'Quel est l''avantage principal du format PDF ?', 'qcm', '["Il permet de modifier facilement le texte","Il conserve la mise en page quel que soit l''appareil qui l''ouvre","Il ralentit l''ordinateur","Il ne peut pas être imprimé"]', 'Il conserve la mise en page quel que soit l''appareil qui l''ouvre', 'Le PDF fige la présentation d''un document : elle reste identique quel que soit l''appareil ou le logiciel utilisé pour l''ouvrir.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Lire et créer des fichiers PDF'), 'Vrai ou Faux : Windows peut ouvrir un fichier PDF sans avoir besoin d''installer de logiciel supplémentaire.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Windows ouvre nativement les PDF dans le navigateur ou l''application Lecteur intégrée, sans nécessiter d''installation supplémentaire.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Lire et créer des fichiers PDF'), 'Comment transformer un document Word en PDF ?', 'qcm', '["Ce n''est pas possible","Fichier > Enregistrer sous > type PDF","En renommant l''extension du fichier","En l''imprimant sur papier puis le scannant"]', 'Fichier > Enregistrer sous > type PDF', 'Word propose nativement l''export au format PDF via Enregistrer sous, en choisissant PDF dans la liste des types de fichiers.', 3);

-- ── Faire une capture d'écran ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Outils du quotidien numérique' AND l.title = 'Faire une capture d''écran'),
  'Quiz — Faire une capture d''écran'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Faire une capture d''écran'), 'Quel raccourci clavier ouvre l''outil de capture d''écran sur Windows ?', 'qcm', '["Ctrl + Alt + Suppr","Windows + Maj (Shift) + S","Alt + F4","Ctrl + Maj + Échap"]', 'Windows + Maj (Shift) + S', 'Ce raccourci ouvre l''outil de capture qui permet de sélectionner précisément une zone, une fenêtre ou l''écran entier à capturer.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Faire une capture d''écran'), 'Vrai ou Faux : Une capture d''écran est automatiquement copiée dans le presse-papiers et peut être collée avec Ctrl + V.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Après une capture, l''image est placée dans le presse-papiers : il suffit de faire Ctrl + V pour la coller dans un document, un email ou un logiciel de dessin.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Faire une capture d''écran'), 'Que permet en plus l''outil Capture d''écran et croquis ?', 'qcm', '["D''annoter l''image (surligner, entourer) avant de l''enregistrer","De supprimer des fichiers","De formater le disque dur","De changer la résolution de l''écran"]', 'D''annoter l''image (surligner, entourer) avant de l''enregistrer', 'Cet outil permet non seulement de capturer l''écran mais aussi d''ajouter des annotations avant de sauvegarder l''image.', 3);

-- ── Utiliser une clé USB ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Outils du quotidien numérique' AND l.title = 'Utiliser une clé USB'),
  'Quiz — Utiliser une clé USB'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Utiliser une clé USB'), 'Comment retirer une clé USB en toute sécurité ?', 'qcm', '["La débrancher directement sans précaution","Cliquer sur Éjecter le périphérique en toute sécurité avant de la retirer","Éteindre l''ordinateur avant de la brancher","La faire tomber par terre"]', 'Cliquer sur Éjecter le périphérique en toute sécurité avant de la retirer', 'Cette étape s''assure qu''aucun transfert de fichier n''est en cours avant le retrait, ce qui évite de perdre ou corrompre des données.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Utiliser une clé USB'), 'Vrai ou Faux : Une clé USB peut transporter un virus d''un ordinateur à un autre.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Une clé USB infectée sur un ordinateur peut propager un virus vers un autre ordinateur : il est prudent de la laisser analyser par un antivirus à l''insertion.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Utiliser une clé USB'), 'Que se passe-t-il si l''on formate une clé USB ?', 'qcm', '["Rien, c''est purement esthétique","Tout son contenu est effacé","Elle devient plus rapide sans rien perdre","Elle se connecte automatiquement à Internet"]', 'Tout son contenu est effacé', 'Formater une clé USB efface entièrement son contenu : cette opération ne doit être faite qu''en toute connaissance de cause.', 3);

-- ── Remplir des formulaires en ligne ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Outils du quotidien numérique' AND l.title = 'Remplir des formulaires en ligne'),
  'Quiz — Remplir des formulaires en ligne'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Remplir des formulaires en ligne'), 'Que signifie un champ marqué d''un astérisque (*) dans un formulaire ?', 'qcm', '["Qu''il est facultatif","Qu''il est obligatoire","Qu''il contient une erreur","Qu''il faut le remplir en dernier"]', 'Qu''il est obligatoire', 'Un astérisque signale un champ obligatoire : le formulaire refusera généralement l''envoi tant que ce champ reste vide.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Remplir des formulaires en ligne'), 'Vrai ou Faux : Il est conseillé de relire l''ensemble du formulaire avant de cliquer sur Envoyer.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Une fois envoyé, un formulaire ne peut souvent plus être corrigé : il est donc important de tout relire avant de valider.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Remplir des formulaires en ligne'), 'Que faut-il conserver après avoir envoyé un formulaire important ?', 'qcm', '["Rien, ce n''est pas nécessaire","Une preuve de l''envoi (capture d''écran, email de confirmation)","Le mot de passe du site","L''adresse IP de l''ordinateur"]', 'Une preuve de l''envoi (capture d''écran, email de confirmation)', 'Conserver une preuve d''envoi est utile en cas de litige ou de besoin de suivi ultérieur.', 3);

-- ============================================================
-- Google Workspace – Outils gratuits
-- ============================================================

-- ── Google Drive : stocker et partager ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Google Workspace – Outils gratuits' AND l.title = 'Google Drive : stocker et partager'),
  'Quiz — Google Drive : stocker et partager'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Google Drive : stocker et partager'), 'Qu''est-ce que Google Drive ?', 'qcm', '["Un antivirus","Un espace de stockage en ligne accessible depuis n''importe quel appareil connecté","Un traitement de texte uniquement","Un navigateur internet"]', 'Un espace de stockage en ligne accessible depuis n''importe quel appareil connecté', 'Google Drive stocke vos fichiers dans le cloud, accessibles depuis n''importe quel ordinateur ou téléphone connecté à votre compte Google.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Google Drive : stocker et partager'), 'Vrai ou Faux : Pour partager un fichier volumineux, il vaut mieux envoyer un lien Drive plutôt qu''une pièce jointe email classique.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Un lien Drive évite les limites de taille des pièces jointes email et permet en plus de contrôler qui peut voir ou modifier le fichier.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Google Drive : stocker et partager'), 'Combien de temps un fichier supprimé reste-t-il dans la corbeille de Drive avant suppression définitive ?', 'qcm', '["24 heures","7 jours","30 jours","Il n''y a pas de corbeille sur Drive"]', '30 jours', 'La corbeille de Google Drive conserve les fichiers supprimés pendant 30 jours, ce qui laisse le temps de les restaurer en cas d''erreur.', 3);

-- ── Google Docs : traitement de texte en ligne ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Google Workspace – Outils gratuits' AND l.title = 'Google Docs : traitement de texte en ligne'),
  'Quiz — Google Docs : traitement de texte en ligne'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Google Docs : traitement de texte en ligne'), 'Faut-il enregistrer manuellement un document Google Docs avec Ctrl + S ?', 'qcm', '["Oui, sinon tout est perdu","Non, chaque modification est enregistrée automatiquement","Seulement une fois par jour","Uniquement en fermant le document"]', 'Non, chaque modification est enregistrée automatiquement', 'Google Docs enregistre automatiquement chaque modification en continu : il n''est pas nécessaire d''appuyer sur Ctrl + S.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Google Docs : traitement de texte en ligne'), 'Vrai ou Faux : Plusieurs personnes peuvent modifier le même document Google Docs en même temps.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Google Docs permet la collaboration en temps réel : chaque personne connectée voit les modifications des autres, avec un curseur de couleur différente.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Google Docs : traitement de texte en ligne'), 'À quoi sert l''historique des versions dans Google Docs ?', 'qcm', '["À supprimer le document","À revenir à une version antérieure du document","À changer la langue du document","À imprimer le document"]', 'À revenir à une version antérieure du document', 'Fichier > Historique des versions permet de consulter et restaurer une version précédente du document.', 3);

-- ── Google Sheets : tableur en ligne ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Google Workspace – Outils gratuits' AND l.title = 'Google Sheets : tableur en ligne'),
  'Quiz — Google Sheets : tableur en ligne'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Google Sheets : tableur en ligne'), 'Qu''est-ce que Google Sheets ?', 'qcm', '["Un logiciel de présentation","L''équivalent gratuit d''Excel, utilisable en ligne","Un antivirus","Un service de messagerie"]', 'L''équivalent gratuit d''Excel, utilisable en ligne', 'Google Sheets reprend les mêmes bases qu''Excel (cellules, formules) mais fonctionne gratuitement dans le navigateur, sans installation.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Google Sheets : tableur en ligne'), 'Vrai ou Faux : Les formules dans Google Sheets commencent aussi par le signe égal, comme dans Excel.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Google Sheets utilise la même logique de formules qu''Excel : elles commencent par = et fonctionnent de façon très similaire.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Google Sheets : tableur en ligne'), 'Comment importer un fichier Excel existant dans Google Sheets ?', 'qcm', '["Ce n''est pas possible","Fichier > Importer","En le renommant en .sheets","En le glissant sur le bureau"]', 'Fichier > Importer', 'Le menu Fichier > Importer permet de charger un fichier Excel existant dans Google Sheets pour continuer à y travailler en ligne.', 3);

-- ── Accéder à vos fichiers depuis votre téléphone ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Google Workspace – Outils gratuits' AND l.title = 'Accéder à vos fichiers depuis votre téléphone'),
  'Quiz — Accéder à vos fichiers depuis votre téléphone'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Accéder à vos fichiers depuis votre téléphone'), 'Comment retrouver ses fichiers Google Drive sur son téléphone ?', 'qcm', '["Ce n''est pas possible sur mobile","En installant l''application et en se connectant avec le même compte Google","En rachetant un nouveau compte","En envoyant les fichiers par SMS"]', 'En installant l''application et en se connectant avec le même compte Google', 'Installer l''application Google Drive et se connecter avec le même compte que sur l''ordinateur permet de retrouver automatiquement tous ses fichiers.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Accéder à vos fichiers depuis votre téléphone'), 'Vrai ou Faux : L''option Disponible hors connexion permet de consulter un fichier même sans internet.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Activer cette option sur un fichier permet de le consulter même sans connexion internet, la synchronisation reprenant ensuite automatiquement.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Accéder à vos fichiers depuis votre téléphone'), 'Que se passe-t-il quand on modifie un fichier sur son téléphone ?', 'qcm', '["La modification est perdue","Elle se synchronise automatiquement dès qu''une connexion internet est disponible","Il faut l''envoyer manuellement par email à soi-même","Elle ne s''applique que sur le téléphone"]', 'Elle se synchronise automatiquement dès qu''une connexion internet est disponible', 'Les modifications faites sur mobile se synchronisent automatiquement avec le cloud dès que l''appareil retrouve une connexion internet.', 3);

-- ============================================================
-- Dactylographie — Maîtriser le clavier
-- ============================================================

-- ── Position des mains et touches de base ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Dactylographie — Maîtriser le clavier' AND l.title = 'Position des mains et touches de base'),
  'Quiz — Position des mains et touches de base'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Position des mains et touches de base'), 'Sur quelles touches se placent les index en position de base ?', 'qcm', '["Q et P","F et J","A et L","Z et M"]', 'F et J', 'F et J possèdent un petit relief tactile permettant de repositionner les index sans regarder le clavier : c''est la position de base.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Position des mains et touches de base'), 'Vrai ou Faux : Il est recommandé de taper uniquement avec les deux index pour aller plus vite.', 'vrai_faux', '["Vrai","Faux"]', 'Faux', 'Chaque doigt est responsable d''une zone précise du clavier ; utiliser tous les doigts permet d''aller bien plus vite et sans fatigue.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Position des mains et touches de base'), 'Pourquoi ne faut-il pas regarder le clavier en tapant ?', 'qcm', '["Ce n''est pas important","Pour développer la mémoire musculaire et progresser en vitesse","Parce que les touches n''ont pas de lettres","Pour éviter d''abîmer les yeux"]', 'Pour développer la mémoire musculaire et progresser en vitesse', 'Ne pas regarder le clavier force à mémoriser la position des touches par les doigts, indispensable pour taper vite et sans erreur.', 3);

-- ── Mots courts et rythme régulier ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Dactylographie — Maîtriser le clavier' AND l.title = 'Mots courts et rythme régulier'),
  'Quiz — Mots courts et rythme régulier'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Mots courts et rythme régulier'), 'Qu''est-ce qui est le plus important pour progresser en dactylographie ?', 'qcm', '["Taper le plus vite possible dès le départ","Un rythme régulier, comme un métronome","Taper par à-coups rapides","Éviter de s''entraîner tous les jours"]', 'Un rythme régulier, comme un métronome', 'La régularité du rythme compte davantage que la vitesse brute : un dactylographe rapide tape à intervalle constant plutôt que par à-coups.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Mots courts et rythme régulier'), 'Vrai ou Faux : Il faut s''arrêter immédiatement pour corriger chaque erreur pendant l''exercice.', 'vrai_faux', '["Vrai","Faux"]', 'Faux', 'Il vaut mieux continuer sans s''arrêter : casser son rythme pour corriger chaque erreur nuit davantage à la progression que l''erreur elle-même.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Mots courts et rythme régulier'), 'Comment se calcule le nombre de mots par minute (MPM) ?', 'qcm', '["En comptant les phrases tapées","En comptant les groupes de 5 caractères tapés correctement","En comptant les fautes uniquement","Ce n''est pas mesurable"]', 'En comptant les groupes de 5 caractères tapés correctement', 'La convention en dactylographie considère qu''un mot équivaut à 5 caractères ; le MPM se calcule à partir du nombre de caractères corrects tapés par minute.', 3);

-- ── Phrases simples et ponctuation de base ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Dactylographie — Maîtriser le clavier' AND l.title = 'Phrases simples et ponctuation de base'),
  'Quiz — Phrases simples et ponctuation de base'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Phrases simples et ponctuation de base'), 'Où se place l''espace par rapport à un point ou une virgule ?', 'qcm', '["Avant le point ou la virgule","Après le point ou la virgule","Il n''y a jamais d''espace","Des deux côtés systématiquement"]', 'Après le point ou la virgule', 'En français, l''espace suit toujours un point ou une virgule, jamais avant.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Phrases simples et ponctuation de base'), 'Vrai ou Faux : La touche Maj (Shift) maintenue permet de taper une majuscule ponctuelle.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Maintenir Maj en tapant une lettre produit une majuscule ponctuelle, sans avoir besoin d''activer le verrouillage majuscule.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Phrases simples et ponctuation de base'), 'Pourquoi la ponctuation ralentit-elle souvent la frappe au début ?', 'qcm', '["Parce que les touches de ponctuation n''existent pas sur AZERTY","Parce qu''elle demande de gérer majuscules, espaces et touches moins habituelles","Parce qu''il faut changer de clavier","Ce n''est jamais le cas"]', 'Parce qu''elle demande de gérer majuscules, espaces et touches moins habituelles', 'Taper des phrases complètes exige de gérer en plus la ponctuation, les majuscules et les espaces, ce qui ralentit naturellement au début.', 3);

-- ── Accents et caractères spéciaux ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Dactylographie — Maîtriser le clavier' AND l.title = 'Accents et caractères spéciaux'),
  'Quiz — Accents et caractères spéciaux'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Accents et caractères spéciaux'), 'Comment obtient-on l''arobase (@) sur un clavier français AZERTY ?', 'qcm', '["En appuyant simplement sur la touche 0","Avec la combinaison Alt Gr + à","Ce n''est pas possible au clavier","Avec Ctrl + Maj + A"]', 'Avec la combinaison Alt Gr + à', 'Sur un clavier AZERTY français, l''arobase s''obtient avec Alt Gr maintenu, plus la touche à.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Accents et caractères spéciaux'), 'Vrai ou Faux : Les lettres accentuées (é, è, à, ç) ont chacune leur propre touche sur un clavier AZERTY français.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Contrairement à un clavier QWERTY américain, l''AZERTY français dédie une touche à chaque accent courant.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Accents et caractères spéciaux'), 'Pourquoi est-il important de maîtriser les accents en dactylographie française ?', 'qcm', '["Ce n''est pas vraiment utile","Le français est une langue riche en accents, indispensables pour un texte correct et professionnel","Les accents ralentissent uniquement les débutants","Ils n''apparaissent jamais dans les textes professionnels"]', 'Le français est une langue riche en accents, indispensables pour un texte correct et professionnel', 'Un texte français sans accents corrects paraît peu soigné ou peut changer le sens d''un mot ; les maîtriser est indispensable pour un rendu professionnel.', 3);

-- ── Texte continu et montée en vitesse ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Dactylographie — Maîtriser le clavier' AND l.title = 'Texte continu et montée en vitesse'),
  'Quiz — Texte continu et montée en vitesse'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Texte continu et montée en vitesse'), 'Quand doit-on chercher à augmenter sa vitesse de frappe ?', 'qcm', '["Dès le premier jour, avant tout le reste","Une fois la précision déjà acquise","Jamais, la vitesse n''a pas d''importance","Uniquement en copiant des chiffres"]', 'Une fois la précision déjà acquise', 'La vitesse doit suivre la précision, pas l''inverse : chercher à taper vite avant d''être précis multiplie les erreurs.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Texte continu et montée en vitesse'), 'Vrai ou Faux : Il est conseillé d''alterner des sessions courtes et intenses avec des pauses.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Des sessions courtes mais régulières, entrecoupées de pauses, évitent la fatigue musculaire des mains et favorisent une progression durable.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Texte continu et montée en vitesse'), 'Quel est un objectif réaliste pour un débutant après plusieurs semaines de pratique régulière ?', 'qcm', '["100 mots par minute immédiatement","30 à 40 mots par minute","1 mot par minute","Il n''existe aucun repère de progression"]', '30 à 40 mots par minute', 'Pour un débutant s''entraînant régulièrement, atteindre 30 à 40 mots par minute après quelques semaines est un objectif réaliste et motivant.', 3);

-- ── Niveau expert — Chiffres, symboles et textes complexes ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Dactylographie — Maîtriser le clavier' AND l.title = 'Niveau expert — Chiffres, symboles et textes complexes'),
  'Quiz — Niveau expert : chiffres et symboles'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Niveau expert : chiffres et symboles'), 'Où se trouvent généralement les chiffres pour une saisie rapide sur un clavier complet ?', 'qcm', '["Uniquement sur la rangée du haut","Sur la rangée du haut ou sur le pavé numérique à droite","Il n''y a pas de touches dédiées aux chiffres","Seulement accessibles via un raccourci Alt"]', 'Sur la rangée du haut ou sur le pavé numérique à droite', 'Les chiffres sont accessibles sur la rangée du haut du clavier principal, et aussi sur le pavé numérique à droite pour une saisie encore plus rapide.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Niveau expert : chiffres et symboles'), 'Vrai ou Faux : Au niveau expert, mieux vaut taper juste à vitesse modérée que vite avec des erreurs à corriger.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'À ce niveau, la fiabilité prime : une frappe rapide mais pleine d''erreurs à corriger fait perdre plus de temps qu''une frappe légèrement plus lente mais juste.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Niveau expert : chiffres et symboles'), 'Que faut-il faire pour bien maîtriser les textes professionnels complexes (adresses, numéros, codes) ?', 'qcm', '["Les éviter autant que possible","S''entraîner spécifiquement sur des textes variés contenant ce type de contenu","Les taper toujours avec le pavé numérique uniquement","Ce n''est pas utile de s''y entraîner"]', 'S''entraîner spécifiquement sur des textes variés contenant ce type de contenu', 'S''entraîner sur des textes variés prépare à ne pas être surpris face à ce type de contenu fréquent dans les textes professionnels réels.', 3);

