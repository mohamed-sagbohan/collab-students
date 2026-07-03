-- ============================================================
-- Migration 013 — Fiches PDF + vidéos YouTube pour les 9 autres cours
-- Exécutez dans Supabase > SQL Editor (après la migration 012)
-- ============================================================

-- ── Internet et navigation web ───────────────────────────────
UPDATE public.courses
SET
  fiche_content = '{
    "subtitle": "Fiche mémo à télécharger et conserver — les bases essentielles pour naviguer en confiance",
    "sections": [
      {
        "heading": "Comprendre Internet et les navigateurs",
        "items": [
          "Internet est un immense réseau mondial qui relie des millions d''ordinateurs ; le Web (les sites que vous consultez) n''en est qu''une partie.",
          "Un navigateur est le logiciel qui permet d''afficher les sites web (Chrome, Edge, Firefox, Safari...). Il est generalement deja installe sur votre ordinateur.",
          "Une adresse de site (URL) se tape dans la barre du haut, pas dans la barre de recherche : ex. www.laposte.fr.",
          "Les onglets permettent d''ouvrir plusieurs pages en meme temps dans une seule fenetre : cliquez sur le signe + pour en ouvrir un nouveau.",
          "Mettez regulierement votre navigateur a jour : les mises a jour corrigent des failles de securite importantes."
        ]
      },
      {
        "heading": "Faire une recherche efficace sur Google",
        "items": [
          "Tapez directement votre question en langage naturel dans la barre de recherche (ex. horaires poste Lyon centre).",
          "Mettez une expression entre guillemets pour rechercher les mots exactement dans cet ordre (ex. carte d''identite renouvellement).",
          "Ajoutez un mot precis pour affiner (ville, marque, annee) plutot que de rester trop general.",
          "Les premiers resultats marques Annonce sont des publicites, pas forcement les plus pertinents.",
          "Utilisez l''onglet Images ou Actualites en haut de la page pour un type de resultat particulier."
        ]
      },
      {
        "heading": "Reconnaître un site fiable",
        "items": [
          "Verifiez la presence du cadenas et de https:// devant l''adresse : cela signifie que la connexion est securisee.",
          "Mefiez-vous des noms de domaine bizarres, avec fautes d''orthographe ou tirets suspects imitant une marque connue.",
          "Un site fiable affiche des mentions legales, une adresse postale et des coordonnees de contact verifiables.",
          "Recherchez le nom du site suivi du mot avis ou arnaque pour voir l''experience d''autres internautes avant d''acheter.",
          "Ne communiquez jamais votre mot de passe ou vos coordonnees bancaires suite a un lien recu par email non sollicite (c''est souvent du phishing)."
        ]
      },
      {
        "heading": "Télécharger un fichier en sécurité",
        "items": [
          "Telechargez uniquement depuis le site officiel de l''editeur du logiciel, jamais depuis un site tiers inconnu.",
          "Avant d''ouvrir un fichier telecharge, verifiez son extension (.pdf, .docx, .jpg) : mefiez-vous des fichiers .exe non attendus.",
          "Votre antivirus analyse automatiquement les fichiers telecharges ; ne desactivez jamais cette protection.",
          "En cas de doute sur un fichier, ne l''ouvrez pas et supprimez-le plutot que de prendre un risque.",
          "Videz regulierement votre dossier Telechargements pour garder votre ordinateur organise et reperer plus facilement les fichiers douteux."
        ]
      }
    ]
  }'::jsonb,
  youtube_videos = '[
    { "title": "C''est quoi un navigateur web ? (Cours informatique débutant)", "url": "https://www.youtube.com/watch?v=36WosixicPw" },
    { "title": "Comment faire une recherche efficace sur Google", "url": "https://www.youtube.com/watch?v=h6oELDcc1cU" },
    { "title": "Comment savoir si un site est SÛR ? (10 méthodes simples + 5 outils)", "url": "https://www.youtube.com/watch?v=mcSIXdlPr1E" },
    { "title": "Protège-toi des virus : comment vérifier un fichier téléchargé", "url": "https://www.youtube.com/watch?v=qVTiI56OAtM" }
  ]'::jsonb
WHERE title = 'Internet et navigation web';

-- ── La messagerie électronique ───────────────────────────────
UPDATE public.courses
SET
  fiche_content = '{
    "subtitle": "Fiche mémo à télécharger et conserver — bien démarrer avec votre boîte email",
    "sections": [
      {
        "heading": "Créer et comprendre une adresse Gmail",
        "items": [
          "Une adresse email se compose d''un identifiant, du symbole @ (arobase), et d''un domaine (ex. prenom.nom@gmail.com).",
          "Pour creer un compte Gmail : rendez-vous sur gmail.com, cliquez sur Creer un compte, puis suivez les etapes (nom, date de naissance, mot de passe).",
          "Choisissez un mot de passe unique et solide, different de vos autres comptes en ligne.",
          "Votre adresse Gmail donne aussi acces a Google Drive, Docs, Sheets et Photos avec le meme identifiant.",
          "Notez votre identifiant et votre mot de passe dans un endroit sur (jamais sur un post-it colle a l''ecran)."
        ]
      },
      {
        "heading": "Envoyer et recevoir des emails",
        "items": [
          "Pour ecrire un email, cliquez sur Nouveau message, renseignez le destinataire, l''objet, puis le corps du message.",
          "L''objet doit resumer clairement le sujet du message pour que le destinataire comprenne l''email avant de l''ouvrir.",
          "Les nouveaux messages recus arrivent dans la boite de reception ; un fond gris ou gras indique un message non lu.",
          "Pour repondre, cliquez sur Repondre ; pour transmettre a quelqu''un d''autre, utilisez Transferer.",
          "Les dossiers Spam et Corbeille se vident automatiquement au bout de 30 jours."
        ]
      },
      {
        "heading": "Envoyer une pièce jointe",
        "items": [
          "Cliquez sur l''icone trombone (Joindre un fichier) en bas de la fenetre de redaction.",
          "Selectionnez le fichier sur votre ordinateur, puis patientez la fin du televersement avant d''envoyer.",
          "La taille maximale d''une piece jointe sur Gmail est de 25 Mo ; au-dela, Gmail propose automatiquement un lien Google Drive.",
          "Pour ouvrir une piece jointe recue, cliquez dessus dans l''email : Gmail l''affiche souvent sans avoir besoin de la telecharger.",
          "N''ouvrez jamais une piece jointe d''un expediteur inconnu ou inattendu : c''est une methode frequente de piratage."
        ]
      },
      {
        "heading": "Organiser sa boîte de réception",
        "items": [
          "Les libelles (equivalent des dossiers) permettent de classer vos emails par theme (ex. Factures, Famille).",
          "Pour creer un libelle : dans le menu de gauche, cliquez sur Autre, puis Creer un libelle.",
          "L''etoile permet de marquer un email important a retrouver rapidement plus tard.",
          "La fonction Archiver range un email hors de la boite de reception sans le supprimer.",
          "Desabonnez-vous des newsletters inutiles (lien Se desabonner en bas des emails) pour garder une boite de reception claire."
        ]
      }
    ]
  }'::jsonb,
  youtube_videos = '[
    { "title": "Créer un compte Gmail sur PC (tuto facile)", "url": "https://www.youtube.com/watch?v=xS-ig2hd8Ok" },
    { "title": "Débuter avec Gmail : envoyer, recevoir et répondre aux emails", "url": "https://www.youtube.com/watch?v=bnSLX0pNdxg" },
    { "title": "Comment envoyer une pièce jointe par mail (exemple Gmail)", "url": "https://www.youtube.com/watch?v=fst2HW7EZG0" },
    { "title": "Libellés dans Gmail — mieux organiser sa boîte de réception", "url": "https://www.youtube.com/watch?v=obSPuoK5nSE" }
  ]'::jsonb
WHERE title = 'La messagerie électronique';

-- ── Word – Traitement de texte ───────────────────────────────
UPDATE public.courses
SET
  fiche_content = '{
    "subtitle": "Fiche mémo à télécharger et conserver — les bases de Microsoft Word",
    "sections": [
      {
        "heading": "Découvrir l''interface Word",
        "items": [
          "Le ruban, en haut de la fenetre, regroupe les outils par onglets : Accueil, Insertion, Mise en page, etc.",
          "L''onglet Accueil contient les outils les plus utilises : police, taille, gras, italique, alignement.",
          "La regle horizontale, sous le ruban, permet de visualiser et regler les marges et les retraits.",
          "La barre d''etat en bas affiche le nombre de mots et de pages du document.",
          "Enregistrez votre travail regulierement avec Ctrl + S pour ne jamais perdre votre texte."
        ]
      },
      {
        "heading": "Mettre en forme son texte",
        "items": [
          "Selectionnez d''abord le texte a modifier (clic maintenu ou double-clic sur un mot) avant d''appliquer une mise en forme.",
          "Gras (Ctrl + G), Italique (Ctrl + I), Souligne (Ctrl + U) : les trois mises en forme de base.",
          "Les styles (Titre 1, Titre 2, Normal) dans l''onglet Accueil harmonisent automatiquement l''apparence du document.",
          "L''alignement du texte (gauche, centre, droite, justifie) se regle avec les quatre icones dediees.",
          "L''outil Reproduire la mise en forme (pinceau) copie le style d''un texte vers un autre en un clic."
        ]
      },
      {
        "heading": "Créer des listes et des tableaux",
        "items": [
          "Les listes a puces ou numerotees se creent depuis l''onglet Accueil ; la touche Tabulation cree un sous-niveau.",
          "Pour inserer un tableau : onglet Insertion > Tableau, puis choisissez le nombre de lignes et de colonnes.",
          "La touche Tabulation permet de passer d''une cellule a la suivante dans un tableau.",
          "L''onglet contextuel Creation de tableau apparait automatiquement pour changer les couleurs et bordures.",
          "Pour ajouter une ligne en fin de tableau, placez le curseur dans la derniere cellule et appuyez sur Tabulation."
        ]
      },
      {
        "heading": "Imprimer et enregistrer en PDF",
        "items": [
          "Pour imprimer : Ctrl + P, verifiez l''apercu a droite, choisissez l''imprimante puis le nombre de copies.",
          "Pour enregistrer en PDF : Fichier > Enregistrer sous > choisissez le type PDF dans la liste deroulante.",
          "Le format PDF fige la mise en page : ideal pour envoyer un document qui ne doit plus etre modifie.",
          "Verifiez toujours l''apercu avant impression pour eviter de gacher du papier sur une mise en page incorrecte.",
          "Donnez un nom clair a votre fichier avant de l''enregistrer (ex. CV-Martin-2026 plutot que Document1)."
        ]
      }
    ]
  }'::jsonb,
  youtube_videos = '[
    { "title": "Les bases de Microsoft Word en 35 min (tuto gratuit débutant)", "url": "https://www.youtube.com/watch?v=jbQDbhg4qek" },
    { "title": "Les tableaux avec Word — tutoriel complet et facile", "url": "https://www.youtube.com/watch?v=bZYtWx1QJvU" },
    { "title": "Enregistrer / convertir un document Word en PDF", "url": "https://www.youtube.com/watch?v=e3ymdBbLP34" }
  ]'::jsonb
WHERE title = 'Word – Traitement de texte';

-- ── Excel – Tableaux et calculs ───────────────────────────────
UPDATE public.courses
SET
  fiche_content = '{
    "subtitle": "Fiche mémo à télécharger et conserver — les bases de Microsoft Excel",
    "sections": [
      {
        "heading": "Découvrir l''interface Excel",
        "items": [
          "Un classeur Excel est compose de plusieurs feuilles (onglets en bas) ; chaque feuille est une grille de cellules.",
          "Chaque cellule a une adresse unique combinant une lettre de colonne et un numero de ligne (ex. B3).",
          "La barre de formule, sous le ruban, affiche et permet de modifier le contenu reel de la cellule selectionnee.",
          "Cliquez sur une cellule pour la selectionner, double-cliquez pour modifier directement son contenu.",
          "Ctrl + fleche directionnelle deplace instantanement la selection jusqu''au bord du tableau de donnees."
        ]
      },
      {
        "heading": "Saisir et formater des données",
        "items": [
          "Excel distingue automatiquement le texte (aligne a gauche) des nombres (alignes a droite).",
          "Pour elargir une colonne, double-cliquez sur la bordure droite de son en-tete pour l''ajuster automatiquement.",
          "La mise en forme conditionnelle (onglet Accueil) colore automatiquement les cellules selon une regle (ex. valeurs negatives en rouge).",
          "Le format d''une cellule (nombre, devise, date, pourcentage) se choisit dans la liste deroulante de l''onglet Accueil.",
          "La poignee de recopie (petit carre en bas a droite de la cellule) permet d''etirer une valeur ou une formule sur plusieurs cellules."
        ]
      },
      {
        "heading": "Les formules essentielles",
        "items": [
          "Toute formule commence par le signe egal : par exemple =A1+A2 additionne les cellules A1 et A2.",
          "=SOMME(A1:A10) additionne automatiquement toutes les cellules de la plage A1 a A10.",
          "=MOYENNE(A1:A10) calcule la moyenne des valeurs de la plage selectionnee.",
          "=SI(A1>10;\"Oui\";\"Non\") affiche un resultat different selon qu''une condition est vraie ou fausse.",
          "En cas d''erreur de formule, Excel affiche un message commencant par # (ex. #DIV/0!) pour vous aider a la corriger."
        ]
      },
      {
        "heading": "Créer un graphique simple",
        "items": [
          "Selectionnez vos donnees (avec les titres de colonnes), puis onglet Insertion > choisissez un type de graphique.",
          "Le graphique en secteurs (camembert) convient pour montrer une repartition en pourcentage d''un total.",
          "Le graphique en courbes ou en barres convient pour montrer une evolution dans le temps.",
          "Cliquez sur le graphique pour faire apparaitre les onglets Creation et Format et personnaliser les couleurs.",
          "Ajoutez toujours un titre a votre graphique pour qu''il reste comprehensible une fois imprime ou partage."
        ]
      }
    ]
  }'::jsonb,
  youtube_videos = '[
    { "title": "Excel : les bases — formation Excel pour débutant (tuto gratuit)", "url": "https://www.youtube.com/watch?v=xnXO6GN21Jo" },
    { "title": "Tuto Excel : découvrir les formules", "url": "https://www.youtube.com/watch?v=ZX-fHVspbfs" },
    { "title": "Créer un graphique sur Excel — les bases pour débutant", "url": "https://www.youtube.com/watch?v=dQqPzZ4FlKU" }
  ]'::jsonb
WHERE title = 'Excel – Tableaux et calculs';

-- ── PowerPoint – Présentations ───────────────────────────────
UPDATE public.courses
SET
  fiche_content = '{
    "subtitle": "Fiche mémo à télécharger et conserver — les bases de Microsoft PowerPoint",
    "sections": [
      {
        "heading": "Créer sa première présentation",
        "items": [
          "Une presentation est une suite de diapositives (slides) ; la premiere sert de page de titre.",
          "Pour ajouter une diapositive : onglet Accueil > Nouvelle diapositive, ou clic droit dans le volet de gauche.",
          "Choisissez une disposition adaptee (titre seul, titre + contenu, deux colonnes) selon ce que vous voulez montrer.",
          "Les themes (onglet Creation) appliquent d''un coup des couleurs et polices coherentes a toute la presentation.",
          "Reorganisez l''ordre des diapositives par glisser-depose dans le volet de gauche."
        ]
      },
      {
        "heading": "Ajouter du texte et des images",
        "items": [
          "Cliquez directement dans une zone de texte predefinie pour taper votre contenu.",
          "Pour inserer une image : onglet Insertion > Images, puis choisissez un fichier sur votre ordinateur.",
          "Redimensionnez une image en tirant sur l''un de ses coins pour conserver ses proportions.",
          "Limitez le texte a l''essentiel sur chaque diapositive : une presentation se lit vite, elle n''est pas un document a lire en detail.",
          "Alignez les elements entre eux grace aux reperes automatiques qui apparaissent lors du deplacement."
        ]
      },
      {
        "heading": "Animer et présenter",
        "items": [
          "Les animations (onglet Animations) ajoutent un effet d''apparition a un element precis d''une diapositive.",
          "Les transitions (onglet Transitions) definissent l''effet de passage d''une diapositive a l''autre.",
          "Utilisez les animations avec moderation : trop d''effets distraient l''audience du contenu.",
          "Le mode Diaporama (touche F5) lance la presentation en plein ecran depuis la premiere diapositive.",
          "Le mode Presentateur affiche vos notes sur votre ecran, invisibles pour le public projete."
        ]
      }
    ]
  }'::jsonb,
  youtube_videos = '[
    { "title": "Comment créer une présentation PowerPoint ? Formation complète débutant", "url": "https://www.youtube.com/watch?v=TQ8xri6IlZU" },
    { "title": "Ajouter du texte dans PowerPoint + alignement et mise en forme", "url": "https://www.youtube.com/watch?v=wztj_l73PRY" },
    { "title": "Animations PowerPoint et transition Morph", "url": "https://www.youtube.com/watch?v=_6j0z-KHqZs" }
  ]'::jsonb
WHERE title = 'PowerPoint – Présentations';

-- ── Sécurité et bonnes pratiques ───────────────────────────────
UPDATE public.courses
SET
  fiche_content = '{
    "subtitle": "Fiche mémo à télécharger et conserver — les bons réflexes pour rester en sécurité",
    "sections": [
      {
        "heading": "Créer un mot de passe solide",
        "items": [
          "Un bon mot de passe compte au moins 12 caracteres et melange majuscules, minuscules, chiffres et symboles.",
          "Evitez les informations personnelles devinables (date de naissance, prenom, nom de votre animal).",
          "Utilisez un mot de passe different pour chaque compte important, en particulier pour votre messagerie.",
          "Activez la double authentification quand elle est proposee : un code envoye sur votre telephone protege votre compte meme si le mot de passe est decouvert.",
          "Un gestionnaire de mots de passe peut generer et retenir des mots de passe complexes a votre place."
        ]
      },
      {
        "heading": "Reconnaître les arnaques en ligne",
        "items": [
          "Le phishing (hameconnage) consiste a imiter un site ou un email connu (banque, impots, colis) pour voler vos identifiants.",
          "Mefiez-vous de tout message qui cree un sentiment d''urgence (votre compte sera bloque sous 24h).",
          "Verifiez toujours l''adresse email complete de l''expediteur, pas seulement le nom affiche.",
          "Ne cliquez jamais directement sur un lien recu par SMS ou email suspect : tapez plutot l''adresse officielle vous-meme dans le navigateur.",
          "Une entreprise serieuse ne vous demandera jamais votre mot de passe complet par email ou par telephone."
        ]
      },
      {
        "heading": "Protéger ses données et faire des sauvegardes",
        "items": [
          "Une sauvegarde est une copie de vos fichiers importants stockee a un autre endroit (disque externe, cloud).",
          "La regle 3-2-1 : 3 copies de vos donnees, sur 2 supports differents, dont 1 hors de votre domicile (ex. cloud).",
          "Programmez une sauvegarde reguliere plutot que d''y penser seulement apres une panne ou un vol.",
          "Les services cloud (Google Drive, OneDrive) sauvegardent automatiquement vos fichiers des qu''ils sont synchronises.",
          "Verifiez de temps en temps que vos sauvegardes sont bien lisibles et a jour."
        ]
      },
      {
        "heading": "Mettre à jour ses logiciels",
        "items": [
          "Les mises a jour corrigent des failles de securite decouvertes apres la sortie du logiciel : elles ne sont pas juste esthetiques.",
          "Activez les mises a jour automatiques de Windows dans Parametres > Windows Update.",
          "Un logiciel ou un navigateur non mis a jour depuis longtemps devient une porte d''entree facile pour les pirates.",
          "Ne telechargez jamais une mise a jour proposee par une fenetre pop-up surgissant sur un site web : passez par le logiciel officiel lui-meme.",
          "Redemarrez votre ordinateur apres une mise a jour importante pour qu''elle s''applique completement."
        ]
      }
    ]
  }'::jsonb,
  youtube_videos = '[
    { "title": "Comment créer des mots de passe solides ?", "url": "https://www.youtube.com/watch?v=7Db6NtX_ZPg" },
    { "title": "Comment repérer et lutter contre les tentatives de phishing ?", "url": "https://www.youtube.com/watch?v=_estF1s77Mc" },
    { "title": "Comment sauvegarder vos fichiers et votre système gratuitement", "url": "https://www.youtube.com/watch?v=unzx4q1sfJQ" },
    { "title": "Comment mettre à jour d''un coup tous les logiciels de votre ordinateur Windows", "url": "https://www.youtube.com/watch?v=Jo4lUA9Breg" }
  ]'::jsonb
WHERE title = 'Sécurité et bonnes pratiques';

-- ── Outils du quotidien numérique ───────────────────────────────
UPDATE public.courses
SET
  fiche_content = '{
    "subtitle": "Fiche mémo à télécharger et conserver — les gestes indispensables du quotidien numérique",
    "sections": [
      {
        "heading": "Lire et créer des fichiers PDF",
        "items": [
          "Le PDF est un format qui conserve la mise en page d''un document quel que soit l''appareil qui l''ouvre.",
          "Windows ouvre les PDF nativement dans le navigateur ou l''application Lecteur, sans logiciel a installer.",
          "Pour transformer un document Word en PDF : Fichier > Enregistrer sous > type PDF.",
          "Pour remplir un formulaire PDF, cliquez directement dans les champs prevus (encadres ou surlignes) avant de l''enregistrer.",
          "Un PDF peut etre signe electroniquement grace aux outils integres des lecteurs PDF modernes."
        ]
      },
      {
        "heading": "Faire une capture d''écran",
        "items": [
          "Le raccourci Windows + Maj (Shift) + S ouvre l''outil de capture pour selectionner une zone precise de l''ecran.",
          "La capture est automatiquement copiee dans le presse-papiers : collez-la avec Ctrl + V dans un document ou un email.",
          "La touche Impr ecran (PrtScn) seule capture tout l''ecran en une fois.",
          "L''outil Capture d''ecran et croquis permet aussi d''annoter (surligner, entourer) l''image avant de l''enregistrer.",
          "Renommez et classez vos captures dans un dossier dedie pour les retrouver facilement plus tard."
        ]
      },
      {
        "heading": "Utiliser une clé USB",
        "items": [
          "Inserez la cle dans un port USB libre ; elle apparait dans l''Explorateur de fichiers sous un nom du type Disque amovible.",
          "Pour copier un fichier vers la cle : selectionnez-le, clic droit > Copier, ouvrez la cle, clic droit > Coller.",
          "Avant de retirer la cle, cliquez sur Ejecter le peripherique en toute securite dans la barre des taches pour eviter de perdre des donnees.",
          "Une cle USB peut transporter un virus d''un ordinateur a un autre : laissez votre antivirus l''analyser a l''insertion.",
          "Formater une cle USB efface tout son contenu : a ne faire qu''en connaissance de cause."
        ]
      },
      {
        "heading": "Remplir des formulaires en ligne",
        "items": [
          "Lisez toujours l''integralite du formulaire avant de commencer a le remplir pour preparer les informations demandees.",
          "Les champs marques d''un asterisque (*) sont obligatoires ; le formulaire refusera l''envoi s''ils sont vides.",
          "Verifiez le format attendu (date, numero de telephone) affiche en petit sous le champ avant de valider.",
          "Relisez l''ensemble du formulaire avant de cliquer sur Envoyer ou Valider : la correction est parfois impossible apres.",
          "Conservez toujours une preuve de votre envoi (capture d''ecran, email de confirmation, numero de dossier)."
        ]
      }
    ]
  }'::jsonb,
  youtube_videos = '[
    { "title": "Comment créer un fichier PDF facilement sur PC", "url": "https://www.youtube.com/watch?v=uf3yK_7St2g" },
    { "title": "Capture d''écran ultra facile sur Windows 11/10", "url": "https://www.youtube.com/watch?v=c61gRsSoxRo" },
    { "title": "Tutoriel : comment utiliser une clef USB", "url": "https://www.youtube.com/watch?v=A6Vaxv1SKwU" },
    { "title": "Comment remplir un document ou formulaire PDF très facilement", "url": "https://www.youtube.com/watch?v=chfwvMTpxek" }
  ]'::jsonb
WHERE title = 'Outils du quotidien numérique';

-- ── Google Workspace – Outils gratuits ───────────────────────────────
UPDATE public.courses
SET
  fiche_content = '{
    "subtitle": "Fiche mémo à télécharger et conserver — Drive, Docs et Sheets au quotidien",
    "sections": [
      {
        "heading": "Google Drive : stocker et partager",
        "items": [
          "Google Drive est un espace de stockage en ligne accessible depuis n''importe quel appareil connecte a votre compte Google.",
          "Pour envoyer un fichier volumineux, partagez plutot un lien Drive qu''une piece jointe email classique.",
          "Clic droit sur un fichier > Partager pour choisir qui peut le voir ou le modifier, par simple adresse email.",
          "Le dossier Mon Drive se synchronise automatiquement si vous installez l''application Google Drive sur votre ordinateur.",
          "La corbeille de Drive conserve les fichiers supprimes pendant 30 jours avant suppression definitive."
        ]
      },
      {
        "heading": "Google Docs : traitement de texte en ligne",
        "items": [
          "Google Docs est l''equivalent gratuit de Word, utilisable directement dans le navigateur, sans rien installer.",
          "Chaque modification est enregistree automatiquement : pas besoin d''appuyer sur Ctrl + S.",
          "Plusieurs personnes peuvent modifier le meme document en meme temps ; chaque curseur apparait d''une couleur differente.",
          "L''historique des versions (Fichier > Historique des versions) permet de revenir a une version anterieure du document.",
          "Le menu Fichier > Telecharger permet d''exporter le document au format Word ou PDF si besoin."
        ]
      },
      {
        "heading": "Google Sheets : tableur en ligne",
        "items": [
          "Google Sheets est l''equivalent gratuit d''Excel, avec les memes bases : cellules, lignes, colonnes et formules.",
          "Les formules commencent aussi par le signe egal (ex. =SOMME(A1:A10)) et fonctionnent presque comme dans Excel.",
          "Le partage fonctionne comme sur Google Docs : bouton Partager en haut a droite pour inviter d''autres personnes.",
          "Les modifications de chaque collaborateur sont visibles en temps reel, avec son nom affiche a cote de sa selection.",
          "Un fichier Excel peut etre importe dans Sheets (Fichier > Importer) pour continuer a y travailler en ligne."
        ]
      },
      {
        "heading": "Accéder à vos fichiers depuis votre téléphone",
        "items": [
          "Installez les applications Google Drive, Docs et Sheets depuis le Play Store ou l''App Store pour un acces mobile complet.",
          "Connectez-vous avec le meme compte Google que sur votre ordinateur pour retrouver automatiquement tous vos fichiers.",
          "Activez l''option Disponible hors connexion sur un fichier pour le consulter meme sans connexion internet.",
          "Depuis votre telephone, vous pouvez aussi photographier un document papier et l''enregistrer directement dans Drive.",
          "Les modifications faites sur mobile se synchronisent automatiquement des que vous retrouvez une connexion internet."
        ]
      }
    ]
  }'::jsonb,
  youtube_videos = '[
    { "title": "Tutoriel Google Drive : enregistrer, organiser et partager ses fichiers", "url": "https://www.youtube.com/watch?v=eUiBo2Ywyzo" },
    { "title": "Tutoriel Google Docs : créer des documents et mettre en forme du texte", "url": "https://www.youtube.com/watch?v=ivgJjIYgHYg" },
    { "title": "Tutoriel Google Sheets : réaliser des calculs, des tableaux et des graphiques", "url": "https://www.youtube.com/watch?v=4DLg1RYaC3o" },
    { "title": "Google Drive complet sur appareils mobiles : astuce sans application", "url": "https://www.youtube.com/watch?v=ET8bIz0nOeU" }
  ]'::jsonb
WHERE title = 'Google Workspace – Outils gratuits';

-- ── Dactylographie — Maîtriser le clavier ───────────────────────────────
UPDATE public.courses
SET
  fiche_content = '{
    "subtitle": "Fiche mémo à télécharger et conserver — la méthode pour bien taper au clavier",
    "sections": [
      {
        "heading": "Position des mains et touches de base",
        "items": [
          "Posez vos doigts sur la rangee des touches reperes : les index se placent sur F et J, reconnaissables au petit relief tactile.",
          "Chaque doigt est responsable d''une zone precise du clavier : ne tapez pas uniquement avec les index.",
          "Gardez le dos droit et les poignets legerement surelevees, sans les poser sur le bureau en tapant.",
          "Ne regardez pas le clavier : fiez-vous a la memoire musculaire, meme si c''est plus lent au debut.",
          "Quelques minutes d''entrainement chaque jour valent mieux qu''une longue session occasionnelle."
        ]
      },
      {
        "heading": "Mots courts et rythme régulier",
        "items": [
          "Tapez a un rythme regulier, comme un metronome, plutot que par a-coups rapides suivis de pauses.",
          "La regularite du rythme compte davantage que la vitesse brute pour progresser durablement.",
          "Commencez par des mots courts et familiers avant de passer a des textes plus longs.",
          "Une erreur n''est pas grave : continuez sans vous arreter pour corriger immediatement chaque faute.",
          "Le nombre de mots par minute se calcule en comptant les groupes de 5 caracteres tapes correctement."
        ]
      },
      {
        "heading": "Phrases simples et ponctuation de base",
        "items": [
          "Une espace suit toujours un point ou une virgule, jamais avant (sauf pour les signes doubles comme : ; ! ? en francais).",
          "La touche Maj (Shift) maintenue permet de taper une majuscule sans activer le verrouillage majuscule.",
          "Terminez toujours vos phrases par une ponctuation avant de passer a la ligne suivante.",
          "Entrainez-vous a taper des phrases completes plutot que des mots isoles des que les bases sont acquises.",
          "La ponctuation ralentit naturellement la frappe au debut : c''est normal, la vitesse reviendra avec la pratique."
        ]
      },
      {
        "heading": "Accents et caractères spéciaux",
        "items": [
          "Les accents (e, e, a, c accentues) ont leur propre touche sur un clavier AZERTY francais, a gauche de la touche Entree pour la plupart.",
          "La touche Maj + touche d''accent permet d''obtenir certaines majuscules accentuees.",
          "L''arobase (@) s''obtient avec Alt Gr + touche a sur un clavier francais.",
          "Les guillemets francais (« ») s''obtiennent avec Alt Gr et les touches dediees selon la disposition du clavier.",
          "Prenez le temps de memoriser ces positions : elles reviennent tres souvent dans un texte professionnel en francais."
        ]
      },
      {
        "heading": "Texte continu et montée en vitesse",
        "items": [
          "Une fois la precision acquise, augmentez progressivement la vitesse sans sacrifier la justesse.",
          "Alternez des sessions courtes et intenses avec des pauses pour eviter la fatigue musculaire des mains.",
          "Relisez vos statistiques de precision apres chaque exercice pour identifier les touches qui posent encore probleme.",
          "Un objectif realiste pour un debutant est d''atteindre 30 a 40 mots par minute apres plusieurs semaines de pratique reguliere.",
          "La vitesse suit naturellement la precision : ne cherchez jamais a taper plus vite qu''un rythme maitrise."
        ]
      },
      {
        "heading": "Niveau expert : chiffres, symboles et textes complexes",
        "items": [
          "Les chiffres se trouvent sur la rangee du haut du clavier ou sur le pave numerique a droite pour une saisie plus rapide.",
          "Les symboles courants (%, euro, /, -) demandent de memoriser des combinaisons de touches specifiques (souvent avec Maj ou Alt Gr).",
          "Un numero de telephone ou une adresse email se tapent sans espace superflu et avec l''orthographe exacte du symbole (@, point).",
          "Entrainez-vous sur des textes varies (adresses, codes, donnees chiffrees) pour ne pas etre surpris en situation reelle.",
          "A ce niveau, l''objectif est la fiabilite totale : mieux vaut taper juste a vitesse moderee que vite avec des erreurs a corriger."
        ]
      }
    ]
  }'::jsonb,
  youtube_videos = '[
    { "title": "1re leçon de dactylographie (frappe à l''aveugle) sur un clavier AZERTY", "url": "https://www.youtube.com/watch?v=TztRoJCu7XI" },
    { "title": "Apprendre à taper sans regarder le clavier", "url": "https://www.youtube.com/watch?v=dRdP358qqQ0" },
    { "title": "Apprendre à taper à l''ordinateur sans regarder et rapidement en 2 semaines", "url": "https://www.youtube.com/watch?v=mornzyOjNMA" }
  ]'::jsonb
WHERE title = 'Dactylographie — Maîtriser le clavier';
