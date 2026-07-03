-- ============================================================
-- Migration 015 — Quiz de leçons (partie 1/2)
-- Exécutez dans Supabase > SQL Editor (après la migration 014)
-- ============================================================

-- ============================================================
-- Maîtriser son ordinateur
-- ============================================================

-- ── Allumer et éteindre correctement ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Maîtriser son ordinateur' AND l.title = 'Allumer et éteindre correctement'),
  'Quiz — Allumer et éteindre correctement'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Allumer et éteindre correctement'), 'Quelle est la bonne façon d''éteindre correctement son ordinateur ?', 'qcm', '["Débrancher la prise directement","Cliquer sur Démarrer puis Arrêter","Appuyer longuement sur le bouton d''alimentation","Fermer l''écran de l''ordinateur portable"]', 'Cliquer sur Démarrer puis Arrêter', 'Passer par le menu Démarrer permet à Windows de fermer proprement tous les programmes avant de couper l''alimentation, évitant ainsi d''endommager vos fichiers.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Allumer et éteindre correctement'), 'Vrai ou Faux : La Veille éteint complètement l''ordinateur et ferme tous les programmes.', 'vrai_faux', '["Vrai","Faux"]', 'Faux', 'La Veille éteint seulement l''écran et met l''ordinateur en pause à basse consommation ; vos programmes restent ouverts et vous retrouvez tout en rallumant l''écran.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Allumer et éteindre correctement'), 'Que faire si l''ordinateur ne répond plus du tout ?', 'qcm', '["Rien, attendre indéfiniment","Débrancher immédiatement le câble d''alimentation","Faire un appui long de 5 à 10 secondes sur le bouton d''alimentation","Retirer la batterie à chaud"]', 'Faire un appui long de 5 à 10 secondes sur le bouton d''alimentation', 'C''est la méthode de dernier recours pour forcer l''extinction quand l''ordinateur est complètement figé. À réserver aux cas où rien d''autre ne fonctionne.', 3);

-- ── Le bureau, les fenêtres et la barre des tâches ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Maîtriser son ordinateur' AND l.title = 'Le bureau, les fenêtres et la barre des tâches'),
  'Quiz — Le bureau et la barre des tâches'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Le bureau et la barre des tâches'), 'Que trouve-t-on à l''extrémité gauche de la barre des tâches ?', 'qcm', '["L''horloge","Le bouton Démarrer","La zone de notification","La corbeille"]', 'Le bouton Démarrer', 'Le bouton Démarrer, à gauche de la barre des tâches, ouvre la liste des applications installées et l''accès aux Paramètres.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Le bureau et la barre des tâches'), 'Vrai ou Faux : Alt + Tab permet de basculer rapidement entre les fenêtres ouvertes.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Maintenez Alt et appuyez sur Tab pour faire défiler les fenêtres ouvertes et choisir celle que vous voulez afficher au premier plan.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Le bureau et la barre des tâches'), 'Où se trouvent l''heure, le réseau et le volume sur la barre des tâches ?', 'qcm', '["À gauche","Au centre","À droite, dans la zone de notification","Ils n''apparaissent pas sur la barre des tâches"]', 'À droite, dans la zone de notification', 'La zone de notification, à droite de la barre des tâches, regroupe l''heure, la date, le réseau, le volume et d''autres icônes système.', 3);

-- ── La souris et ses fonctions ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Maîtriser son ordinateur' AND l.title = 'La souris et ses fonctions'),
  'Quiz — La souris et ses fonctions'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — La souris et ses fonctions'), 'Quelle action permet d''ouvrir un fichier ou un dossier ?', 'qcm', '["Un simple clic gauche","Un double-clic gauche","Un clic droit","Un mouvement de la molette"]', 'Un double-clic gauche', 'Le double-clic gauche (deux clics rapprochés) ouvre un fichier, un dossier ou une application. Un simple clic se contente de le sélectionner.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — La souris et ses fonctions'), 'Vrai ou Faux : Le clic droit affiche un menu avec des actions supplémentaires.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Le clic droit ouvre un menu contextuel proposant des actions comme copier, renommer ou afficher les propriétés de l''élément.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — La souris et ses fonctions'), 'Comment déplacer un fichier avec la souris sans utiliser de menu ?', 'qcm', '["Molette maintenue enfoncée","Clic maintenu puis glisser (glisser-déposer)","Double clic droit","Ce n''est pas possible avec la souris"]', 'Clic maintenu puis glisser (glisser-déposer)', 'Le glisser-déposer consiste à cliquer sur l''élément, maintenir le clic, déplacer la souris jusqu''à la destination, puis relâcher.', 3);

-- ── Organiser ses fichiers et dossiers ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Maîtriser son ordinateur' AND l.title = 'Organiser ses fichiers et dossiers'),
  'Quiz — Organiser ses fichiers et dossiers'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Organiser ses fichiers et dossiers'), 'À quoi sert un dossier sur un ordinateur ?', 'qcm', '["À supprimer des fichiers automatiquement","À regrouper plusieurs fichiers d''un même thème","À ouvrir Internet","À protéger l''ordinateur des virus"]', 'À regrouper plusieurs fichiers d''un même thème', 'Un dossier permet de ranger ensemble des fichiers qui se ressemblent (ex. Factures, Photos vacances) pour mieux s''y retrouver.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Organiser ses fichiers et dossiers'), 'Vrai ou Faux : Il faut faire un clic droit puis Couper, puis se rendre dans le dossier de destination et faire Coller pour déplacer un fichier.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'C''est exactement la méthode : Couper retire le fichier de son emplacement actuel, puis Coller le dépose dans le nouveau dossier choisi.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Organiser ses fichiers et dossiers'), 'Quel est un bon exemple de nom de fichier clair et daté ?', 'qcm', '["Document1","azerty123","Facture-electricite-2026-07","fichier_final_v2_dernier"]', 'Facture-electricite-2026-07', 'Un nom de fichier clair précise son contenu et sa date, ce qui permet de le retrouver facilement des mois plus tard sans avoir à l''ouvrir.', 3);

-- ============================================================
-- Internet et navigation web
-- ============================================================

-- ── Comprendre Internet et les navigateurs ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Internet et navigation web' AND l.title = 'Comprendre Internet et les navigateurs'),
  'Quiz — Comprendre Internet et les navigateurs'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Comprendre Internet et les navigateurs'), 'Qu''est-ce qu''un navigateur web ?', 'qcm', '["Un antivirus","Un logiciel qui permet d''afficher les sites internet","Un moteur de recherche uniquement","Un type de clavier"]', 'Un logiciel qui permet d''afficher les sites internet', 'Chrome, Edge, Firefox ou Safari sont des navigateurs : des logiciels qui permettent d''afficher et de naviguer sur les sites du Web.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Comprendre Internet et les navigateurs'), 'Vrai ou Faux : L''adresse d''un site se tape dans la barre de recherche du moteur de recherche.', 'vrai_faux', '["Vrai","Faux"]', 'Faux', 'L''adresse (URL) d''un site se tape directement dans la barre d''adresse en haut du navigateur, pas dans un moteur de recherche.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Comprendre Internet et les navigateurs'), 'À quoi servent les onglets d''un navigateur ?', 'qcm', '["À fermer le navigateur","À ouvrir plusieurs pages en même temps dans une seule fenêtre","À supprimer l''historique","À changer la langue du site"]', 'À ouvrir plusieurs pages en même temps dans une seule fenêtre', 'Chaque onglet affiche une page différente sans avoir besoin d''ouvrir une nouvelle fenêtre du navigateur.', 3);

-- ── Faire une recherche efficace sur Google ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Internet et navigation web' AND l.title = 'Faire une recherche efficace sur Google'),
  'Quiz — Faire une recherche efficace sur Google'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Faire une recherche efficace sur Google'), 'Comment rechercher une expression exacte, dans le bon ordre, sur Google ?', 'qcm', '["En majuscules","Entre guillemets","Avec un point d''exclamation","En la répétant deux fois"]', 'Entre guillemets', 'Mettre une expression entre guillemets force Google à chercher ces mots exactement dans cet ordre.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Faire une recherche efficace sur Google'), 'Vrai ou Faux : Les résultats marqués Annonce en haut de la page sont toujours les plus pertinents.', 'vrai_faux', '["Vrai","Faux"]', 'Faux', 'Les résultats marqués Annonce sont des publicités payantes, pas nécessairement les réponses les plus fiables ou pertinentes à votre recherche.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Faire une recherche efficace sur Google'), 'Quelle est la meilleure stratégie pour affiner une recherche trop large ?', 'qcm', '["Ajouter un mot précis (ville, marque, année)","Retirer tous les mots-clés","Taper la recherche en une seule lettre","Fermer le navigateur et recommencer"]', 'Ajouter un mot précis (ville, marque, année)', 'Ajouter un détail précis réduit le nombre de résultats et les rend plus pertinents par rapport à ce que vous cherchez réellement.', 3);

-- ── Télécharger un fichier en sécurité ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Internet et navigation web' AND l.title = 'Télécharger un fichier en sécurité'),
  'Quiz — Télécharger un fichier en sécurité'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Télécharger un fichier en sécurité'), 'Où faut-il télécharger un logiciel en priorité ?', 'qcm', '["Sur n''importe quel site proposant le fichier gratuitement","Sur le site officiel de l''éditeur du logiciel","Sur un forum quelconque","Peu importe la source"]', 'Sur le site officiel de l''éditeur du logiciel', 'Le site officiel garantit un fichier non modifié. Les sites tiers peuvent ajouter des logiciels indésirables ou des virus au téléchargement.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Télécharger un fichier en sécurité'), 'Vrai ou Faux : Un fichier .exe inattendu reçu par email doit être ouvert sans hésiter s''il vient d''un contact connu.', 'vrai_faux', '["Vrai","Faux"]', 'Faux', 'Même venant d''un contact connu, un .exe inattendu peut provenir d''un piratage de son compte. Mieux vaut vérifier avant d''ouvrir tout fichier exécutable surprise.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Télécharger un fichier en sécurité'), 'Que fait l''antivirus lors d''un téléchargement ?', 'qcm', '["Il ralentit volontairement l''ordinateur","Il analyse automatiquement le fichier téléchargé","Il supprime tous les fichiers","Il n''intervient jamais sur les téléchargements"]', 'Il analyse automatiquement le fichier téléchargé', 'L''antivirus scanne les fichiers téléchargés pour détecter d''éventuelles menaces ; il ne faut jamais désactiver cette protection.', 3);

-- ============================================================
-- La messagerie électronique
-- ============================================================

-- ── Créer et comprendre une adresse Gmail ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'La messagerie électronique' AND l.title = 'Créer et comprendre une adresse Gmail'),
  'Quiz — Créer et comprendre une adresse Gmail'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Créer et comprendre une adresse Gmail'), 'Que représente le symbole @ dans une adresse email ?', 'qcm', '["Le nom de domaine","L''arobase, qui sépare l''identifiant du domaine","Un raccourci clavier","Le mot de passe"]', 'L''arobase, qui sépare l''identifiant du domaine', 'Une adresse email s''écrit identifiant@domaine ; l''arobase sépare la partie personnelle de la partie qui indique le service de messagerie.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Créer et comprendre une adresse Gmail'), 'Vrai ou Faux : Un compte Gmail donne aussi accès à Google Drive, Docs et Sheets.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Un seul compte Google (créé avec Gmail) donne accès à tous les services Google : Drive, Docs, Sheets, Photos, etc.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Créer et comprendre une adresse Gmail'), 'Quelle est une bonne pratique lors de la création d''un mot de passe Gmail ?', 'qcm', '["Utiliser le même mot de passe que ses autres comptes","Choisir un mot de passe unique et solide","Choisir sa date de naissance","Ne mettre aucun mot de passe"]', 'Choisir un mot de passe unique et solide', 'Un mot de passe unique protège votre messagerie même si un autre de vos comptes venait à être piraté.', 3);

-- ── Envoyer et recevoir des emails ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'La messagerie électronique' AND l.title = 'Envoyer et recevoir des emails'),
  'Quiz — Envoyer et recevoir des emails'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Envoyer et recevoir des emails'), 'Que doit contenir l''objet d''un email ?', 'qcm', '["Rien, il est facultatif","Un résumé clair du sujet du message","Le nom complet du destinataire","La date d''envoi uniquement"]', 'Un résumé clair du sujet du message', 'Un objet clair permet au destinataire de comprendre immédiatement le sujet du message, avant même de l''ouvrir.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Envoyer et recevoir des emails'), 'Vrai ou Faux : Un message non lu apparaît généralement en gras ou avec un fond différent dans la boîte de réception.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Les messageries affichent les emails non lus en gras (ou avec un indicateur visuel) pour les distinguer de ceux déjà consultés.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Envoyer et recevoir des emails'), 'Que fait le bouton Transférer ?', 'qcm', '["Il supprime définitivement l''email","Il envoie une copie de l''email reçu à une autre personne","Il répond automatiquement à l''expéditeur","Il archive l''email"]', 'Il envoie une copie de l''email reçu à une autre personne', 'Transférer permet de renvoyer un email reçu à un nouveau destinataire, contrairement à Répondre qui s''adresse à l''expéditeur d''origine.', 3);

-- ── Envoyer une pièce jointe ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'La messagerie électronique' AND l.title = 'Envoyer une pièce jointe'),
  'Quiz — Envoyer une pièce jointe'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Envoyer une pièce jointe'), 'Quelle icône permet généralement de joindre un fichier à un email ?', 'qcm', '["Une étoile","Un trombone","Une enveloppe","Un cadenas"]', 'Un trombone', 'L''icône en forme de trombone, en bas de la fenêtre de rédaction, permet de sélectionner un fichier à joindre à l''email.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Envoyer une pièce jointe'), 'Vrai ou Faux : Il est prudent d''ouvrir une pièce jointe envoyée par un expéditeur totalement inconnu.', 'vrai_faux', '["Vrai","Faux"]', 'Faux', 'Une pièce jointe d''un expéditeur inconnu ou inattendu est une méthode fréquente de piratage : mieux vaut ne pas l''ouvrir.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Envoyer une pièce jointe'), 'Que propose Gmail si une pièce jointe dépasse la taille maximale autorisée ?', 'qcm', '["Il refuse d''envoyer l''email sans explication","Il propose automatiquement un lien Google Drive","Il compresse le fichier automatiquement en zip","Il envoie le fichier en plusieurs emails"]', 'Il propose automatiquement un lien Google Drive', 'Au-delà de 25 Mo, Gmail bascule automatiquement vers un partage par lien Google Drive plutôt qu''une pièce jointe classique.', 3);

-- ── Organiser sa boîte de réception ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'La messagerie électronique' AND l.title = 'Organiser sa boîte de réception'),
  'Quiz — Organiser sa boîte de réception'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Organiser sa boîte de réception'), 'À quoi servent les libellés dans Gmail ?', 'qcm', '["À supprimer des emails automatiquement","À classer les emails par thème","À bloquer un expéditeur","À changer la langue de l''interface"]', 'À classer les emails par thème', 'Les libellés sont l''équivalent de dossiers : ils permettent de regrouper les emails par thème pour mieux s''organiser.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Organiser sa boîte de réception'), 'Vrai ou Faux : Archiver un email le supprime définitivement.', 'vrai_faux', '["Vrai","Faux"]', 'Faux', 'Archiver range simplement l''email hors de la boîte de réception principale, sans le supprimer : il reste accessible via la recherche ou le libellé Tous les messages.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Organiser sa boîte de réception'), 'Quelle action permet de garder une boîte de réception plus claire ?', 'qcm', '["Ne jamais lire ses emails","Se désabonner des newsletters inutiles","Supprimer son compte","Désactiver la réception de tout email"]', 'Se désabonner des newsletters inutiles', 'Le lien Se désabonner, présent en bas des newsletters, permet de ne plus recevoir des emails qui encombrent inutilement la boîte de réception.', 3);

-- ============================================================
-- Word – Traitement de texte
-- ============================================================

-- ── Découvrir l'interface Word ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Word – Traitement de texte' AND l.title = 'Découvrir l''interface Word'),
  'Quiz — Découvrir l''interface Word'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Découvrir l''interface Word'), 'Où se trouvent les outils de mise en forme dans Word (police, gras, alignement) ?', 'qcm', '["Dans la barre d''état en bas","Dans le ruban, onglet Accueil","Uniquement dans un menu clic droit","Il n''y a pas d''outils, tout se tape au clavier"]', 'Dans le ruban, onglet Accueil', 'Le ruban, en haut de la fenêtre, regroupe les outils par onglets ; l''onglet Accueil contient les outils de mise en forme les plus utilisés.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Découvrir l''interface Word'), 'Vrai ou Faux : Ctrl + S enregistre le document en cours.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Ctrl + S est le raccourci universel pour enregistrer un document en cours de modification, à utiliser régulièrement.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Découvrir l''interface Word'), 'Que montre la barre d''état en bas de la fenêtre Word ?', 'qcm', '["Les couleurs disponibles","Le nombre de mots et de pages du document","La liste des polices","Le menu Fichier"]', 'Le nombre de mots et de pages du document', 'La barre d''état, en bas de la fenêtre, affiche des informations utiles comme le nombre de mots et de pages du document en cours.', 3);

-- ── Mettre en forme son texte ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Word – Traitement de texte' AND l.title = 'Mettre en forme son texte'),
  'Quiz — Mettre en forme son texte'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Mettre en forme son texte'), 'Que faut-il faire avant d''appliquer une mise en forme à un texte ?', 'qcm', '["Rien, la mise en forme s''applique partout","Sélectionner le texte concerné","Fermer le document","Changer de police par défaut"]', 'Sélectionner le texte concerné', 'Une mise en forme (gras, couleur, alignement) s''applique uniquement au texte sélectionné au préalable.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Mettre en forme son texte'), 'Vrai ou Faux : Ctrl + G applique la mise en forme gras au texte sélectionné.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Ctrl + G (comme Gras) est le raccourci pour mettre en gras. Ctrl + I fait de l''italique et Ctrl + U souligne.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Mettre en forme son texte'), 'À quoi sert l''outil Reproduire la mise en forme (pinceau) ?', 'qcm', '["À supprimer toute mise en forme","À copier le style d''un texte vers un autre en un clic","À changer la langue du document","À insérer une image"]', 'À copier le style d''un texte vers un autre en un clic', 'L''outil pinceau capture la mise en forme d''un texte déjà stylé pour l''appliquer instantanément à un autre passage du document.', 3);

-- ── Créer des listes et des tableaux ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Word – Traitement de texte' AND l.title = 'Créer des listes et des tableaux'),
  'Quiz — Créer des listes et des tableaux'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Créer des listes et des tableaux'), 'Comment insérer un tableau dans Word ?', 'qcm', '["Onglet Insertion > Tableau","Onglet Accueil > Imprimer","Ctrl + T uniquement","Ce n''est pas possible dans Word"]', 'Onglet Insertion > Tableau', 'L''onglet Insertion propose l''outil Tableau, qui permet de choisir le nombre de lignes et de colonnes avant de l''insérer.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Créer des listes et des tableaux'), 'Vrai ou Faux : La touche Tabulation permet de passer d''une cellule à la suivante dans un tableau.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Dans un tableau Word, la touche Tabulation déplace le curseur vers la cellule suivante, et en crée une nouvelle ligne si on est dans la dernière cellule.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Créer des listes et des tableaux'), 'Quel type de liste utilise des numéros au lieu de puces ?', 'qcm', '["La liste à puces","La liste numérotée","Le tableau","Le style Titre 1"]', 'La liste numérotée', 'La liste numérotée affiche 1, 2, 3... devant chaque élément, utile pour des étapes ou un ordre précis, contrairement à la liste à puces.', 3);

-- ── Imprimer et enregistrer en PDF ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Word – Traitement de texte' AND l.title = 'Imprimer et enregistrer en PDF'),
  'Quiz — Imprimer et enregistrer en PDF'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Imprimer et enregistrer en PDF'), 'Quel raccourci ouvre les options d''impression dans Word ?', 'qcm', '["Ctrl + P","Ctrl + I","Ctrl + O","Ctrl + Maj + P"]', 'Ctrl + P', 'Ctrl + P ouvre le menu d''impression, avec l''aperçu du document, le choix de l''imprimante et du nombre de copies.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Imprimer et enregistrer en PDF'), 'Vrai ou Faux : Le format PDF permet de figer la mise en page d''un document pour qu''elle ne bouge plus.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Contrairement à un fichier Word modifiable, un PDF conserve exactement la même présentation quel que soit l''appareil utilisé pour l''ouvrir.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Imprimer et enregistrer en PDF'), 'Comment enregistrer un document Word au format PDF ?', 'qcm', '["Fichier > Enregistrer sous > choisir le type PDF","Ctrl + P puis fermer la fenêtre","Ce n''est pas possible sans logiciel externe","En renommant le fichier avec l''extension .pdf"]', 'Fichier > Enregistrer sous > choisir le type PDF', 'Word propose nativement l''export en PDF depuis Enregistrer sous, en choisissant PDF dans la liste déroulante des types de fichiers.', 3);

-- ============================================================
-- Excel – Tableaux et calculs
-- ============================================================

-- ── Découvrir l'interface Excel ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Excel – Tableaux et calculs' AND l.title = 'Découvrir l''interface Excel'),
  'Quiz — Découvrir l''interface Excel'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Découvrir l''interface Excel'), 'Comment appelle-t-on l''adresse d''une cellule Excel comme B3 ?', 'qcm', '["Une formule","Une référence de cellule","Un onglet","Un classeur"]', 'Une référence de cellule', 'B3 combine une lettre de colonne (B) et un numéro de ligne (3) : c''est la référence unique qui identifie cette cellule dans la feuille.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Découvrir l''interface Excel'), 'Vrai ou Faux : Un classeur Excel peut contenir plusieurs feuilles.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Un classeur regroupe plusieurs feuilles, visibles sous forme d''onglets en bas de la fenêtre, chacune étant une grille de cellules indépendante.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Découvrir l''interface Excel'), 'Où voit-on le contenu réel (et non affiché) d''une cellule sélectionnée ?', 'qcm', '["Dans la barre de formule","Dans la barre des tâches","Nulle part, il faut deviner","Dans l''onglet Insertion"]', 'Dans la barre de formule', 'La barre de formule, sous le ruban, affiche le contenu exact de la cellule sélectionnée, même si l''affichage dans la cellule diffère.', 3);

-- ── Saisir et formater des données ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Excel – Tableaux et calculs' AND l.title = 'Saisir et formater des données'),
  'Quiz — Saisir et formater des données'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Saisir et formater des données'), 'Comment Excel aligne-t-il un nombre par défaut dans une cellule ?', 'qcm', '["À gauche","Au centre","À droite","Il ne l''aligne jamais automatiquement"]', 'À droite', 'Excel aligne automatiquement les nombres à droite et le texte à gauche, ce qui permet de repérer rapidement le type de donnée saisie.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Saisir et formater des données'), 'Vrai ou Faux : La mise en forme conditionnelle peut colorer automatiquement une cellule selon une règle définie.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'La mise en forme conditionnelle applique une couleur ou un style automatiquement quand une condition est remplie, par exemple les valeurs négatives en rouge.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Saisir et formater des données'), 'Comment ajuster automatiquement la largeur d''une colonne à son contenu ?', 'qcm', '["Appuyer sur Ctrl + L","Double-cliquer sur la bordure droite de l''en-tête de colonne","Supprimer la colonne puis la recréer","Ce n''est pas possible"]', 'Double-cliquer sur la bordure droite de l''en-tête de colonne', 'Un double-clic sur la bordure droite de l''en-tête de colonne ajuste automatiquement sa largeur au contenu le plus long qu''elle contient.', 3);

-- ── Les formules essentielles ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Excel – Tableaux et calculs' AND l.title = 'Les formules essentielles'),
  'Quiz — Les formules essentielles'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Les formules essentielles'), 'Par quel signe doit commencer toute formule Excel ?', 'qcm', '["Le signe #","Le signe =","Le signe @","Le signe %"]', 'Le signe =', 'Une formule commence toujours par le signe égal ; sans lui, Excel considère le contenu comme du simple texte ou un nombre.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Les formules essentielles'), 'Vrai ou Faux : La formule SOMME(A1:A10) additionne toutes les cellules de A1 à A10.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'La fonction SOMME additionne automatiquement toutes les valeurs numériques comprises dans la plage indiquée entre parenthèses.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Les formules essentielles'), 'Que signifie un message d''erreur commençant par # dans Excel (ex. #DIV/0!) ?', 'qcm', '["Que la cellule est verrouillée","Qu''il y a une erreur dans la formule","Que le fichier est corrompu","Que la cellule est vide"]', 'Qu''il y a une erreur dans la formule', 'Les messages commençant par # signalent un problème dans le calcul (ex. #DIV/0! signifie une division par zéro), à corriger dans la formule.', 3);

-- ── Créer un graphique simple ──────────────────────────────────
INSERT INTO public.exercises (lesson_id, title)
VALUES (
  (SELECT l.id FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = 'Excel – Tableaux et calculs' AND l.title = 'Créer un graphique simple'),
  'Quiz — Créer un graphique simple'
);

INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, explanation, order_index) VALUES
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Créer un graphique simple'), 'Quel type de graphique convient le mieux pour montrer une répartition en pourcentage d''un total ?', 'qcm', '["Le graphique en secteurs (camembert)","Le graphique en courbes","Le graphique en nuage de points","Aucun graphique ne peut montrer cela"]', 'Le graphique en secteurs (camembert)', 'Le graphique en secteurs découpe visuellement un total en parts proportionnelles, idéal pour montrer une répartition en pourcentage.', 1),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Créer un graphique simple'), 'Vrai ou Faux : Il faut sélectionner ses données avant de créer un graphique.', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'Il faut sélectionner les données (idéalement avec les titres de colonnes) avant d''aller dans l''onglet Insertion pour créer le graphique correspondant.', 2),
  ((SELECT id FROM public.exercises WHERE title = 'Quiz — Créer un graphique simple'), 'Quel type de graphique convient le mieux pour montrer une évolution dans le temps ?', 'qcm', '["Le graphique en secteurs","Le graphique en courbes ou en barres","Aucun graphique adapté n''existe","Un tableau croisé dynamique uniquement"]', 'Le graphique en courbes ou en barres', 'Les graphiques en courbes ou en barres permettent de visualiser clairement une progression ou une évolution au fil du temps.', 3);

