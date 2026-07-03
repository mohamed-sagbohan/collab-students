-- ============================================================
-- LearnIT — Création admin + données d'exemple
-- Exécutez ce script dans Supabase > SQL Editor
-- Aucun pré-requis : le compte admin est créé automatiquement
--
--   Email    : lopesboser@gmail.com
--   Mot de passe : Admin1234!
-- ============================================================

DO $$
DECLARE
  v_admin_id   UUID;
  v_instructor UUID;

  -- IDs des cours
  c_ordi      UUID;
  c_internet  UUID;
  c_email     UUID;
  c_word      UUID;
  c_excel     UUID;
  c_ppt       UUID;
  c_secu      UUID;
  c_quotidien UUID;
  c_google    UUID;

  -- IDs de leçons (pour les exercices)
  l_ordi_4  UUID;
  l_net_3   UUID;
  l_secu_1  UUID;

  -- IDs d'exercices
  e1 UUID;
  e2 UUID;
  e3 UUID;

BEGIN

  -- ── Création du compte admin ─────────────────────────────
  -- Si le compte existe déjà, on récupère son ID sans erreur
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'lopesboser@gmail.com') THEN
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'lopesboser@gmail.com';
    RAISE NOTICE 'Compte admin déjà existant, ID récupéré.';
  ELSE
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'lopesboser@gmail.com',
      crypt('Admin1234!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Administrateur"}',
      NOW(),
      NOW(),
      '', '', '', ''
    );
    RAISE NOTICE 'Compte admin créé (lopesboser@gmail.com).';
  END IF;

  -- ── Création / mise à jour du profil admin ───────────────
  INSERT INTO public.profiles (id, name, role)
  VALUES (v_admin_id, 'Administrateur', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', name = 'Administrateur';

  v_instructor := v_admin_id;

  -- ============================================================
  -- 1. MAÎTRISER SON ORDINATEUR
  -- ============================================================
  INSERT INTO public.courses (title, description, instructor_id, published)
  VALUES (
    'Maîtriser son ordinateur',
    'Le point de départ absolu : allumer, éteindre, naviguer dans Windows, utiliser la souris, le clavier et organiser vos fichiers.',
    v_instructor, true
  ) RETURNING id INTO c_ordi;

  INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  (c_ordi, 'Allumer et éteindre correctement', '
<h2>Pourquoi c''est important ?</h2>
<p>Mal éteindre un ordinateur peut corrompre des fichiers et endommager le disque dur. Voici la bonne méthode.</p>

<h3>Allumer l''ordinateur</h3>
<ol>
  <li>Appuyez sur le bouton d''alimentation ⏻ sur la tour ou le portable.</li>
  <li>Attendez que Windows charge complètement (30 secondes à 2 minutes).</li>
  <li>Entrez votre mot de passe si demandé.</li>
</ol>

<h3>Éteindre correctement</h3>
<ol>
  <li>Fermez tous vos programmes ouverts.</li>
  <li>Cliquez sur le bouton <strong>Démarrer</strong> (icône Windows en bas à gauche).</li>
  <li>Cliquez sur le symbole ⏻ <strong>(Alimentation)</strong>.</li>
  <li>Choisissez <strong>Arrêter</strong>.</li>
  <li>Attendez que l''écran s''éteigne complètement avant de débrancher.</li>
</ol>

<h3>Veille vs Arrêt</h3>
<p><strong>Veille :</strong> l''ordinateur se met en pause. Idéal pour une courte absence, il se rallume rapidement.</p>
<p><strong>Arrêt :</strong> l''ordinateur s''éteint complètement. À faire en fin de journée pour permettre les mises à jour Windows.</p>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Conseil :</strong> N''appuyez jamais longtemps sur le bouton d''alimentation pour forcer l''arrêt, sauf si l''ordinateur est complètement bloqué.
</div>
', 1),

  (c_ordi, 'Le bureau, les fenêtres et la barre des tâches', '
<h2>Le bureau Windows</h2>
<p>Le bureau est votre espace de travail principal. Vous y trouvez :</p>
<ul>
  <li><strong>Les icônes :</strong> raccourcis vers vos programmes et fichiers</li>
  <li><strong>La barre des tâches</strong> (en bas) : elle affiche les programmes ouverts et l''heure</li>
  <li><strong>Le bouton Démarrer</strong> (coin bas-gauche) : accès à tous vos programmes</li>
</ul>

<h2>Ouvrir et fermer une fenêtre</h2>
<p>Chaque programme s''ouvre dans une <strong>fenêtre</strong>. En haut à droite de chaque fenêtre, vous trouverez 3 boutons :</p>
<ul>
  <li><strong>—</strong> Réduire : cache la fenêtre (le programme reste ouvert)</li>
  <li><strong>□</strong> Agrandir / Restaurer : plein écran ou taille normale</li>
  <li><strong>✕</strong> Fermer : ferme le programme</li>
</ul>

<h2>Déplacer et redimensionner</h2>
<p><strong>Déplacer :</strong> cliquez sur la barre de titre et faites glisser.</p>
<p><strong>Redimensionner :</strong> placez votre curseur sur le bord de la fenêtre jusqu''à ce qu''il devienne une double flèche, puis faites glisser.</p>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Astuce Windows :</strong> Faites glisser une fenêtre vers le bord gauche ou droit de l''écran : Windows la positionnera automatiquement en demi-écran. Parfait pour travailler avec deux fenêtres côte à côte.
</div>
', 2),

  (c_ordi, 'La souris et ses fonctions', '
<h2>Les actions de la souris</h2>
<ul>
  <li><strong>Clic gauche :</strong> sélectionner, ouvrir, cliquer sur un bouton</li>
  <li><strong>Double clic gauche :</strong> ouvrir un fichier ou un dossier</li>
  <li><strong>Clic droit :</strong> afficher un menu de choix (couper, copier, propriétés…)</li>
  <li><strong>Molette :</strong> faire défiler une page vers le haut ou le bas</li>
</ul>

<h2>Sélectionner plusieurs éléments</h2>
<ul>
  <li>Maintenez <strong>Ctrl</strong> et cliquez sur chaque élément souhaité</li>
  <li>Cliquez sur le premier, maintenez <strong>Maj (Shift)</strong>, cliquez sur le dernier : sélectionne toute la plage</li>
</ul>

<h2>Glisser-déposer</h2>
<ol>
  <li>Cliquez sur un fichier et maintenez le bouton gauche enfoncé</li>
  <li>Faites glisser vers l''emplacement souhaité</li>
  <li>Relâchez le bouton</li>
</ol>

<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>⚠️ À savoir :</strong> Glisser-déposer entre deux dossiers du même disque <em>déplace</em> le fichier. Vers une clé USB ou un autre disque, il est <em>copié</em>.
</div>
', 3),

  (c_ordi, 'Le clavier et les raccourcis essentiels', '
<h2>Les touches importantes</h2>
<ul>
  <li><strong>Entrée (↵) :</strong> valider, aller à la ligne</li>
  <li><strong>Retour arrière (⌫) :</strong> effacer le caractère à gauche du curseur</li>
  <li><strong>Suppr (Delete) :</strong> effacer le caractère à droite, ou supprimer un fichier</li>
  <li><strong>Maj (Shift ⇧) :</strong> majuscule momentanée, ou accès aux symboles</li>
  <li><strong>Verr Maj (Caps Lock) :</strong> majuscules permanentes</li>
  <li><strong>Échap (Esc) :</strong> annuler, fermer un menu</li>
  <li><strong>Tab (↹) :</strong> passer au champ suivant dans un formulaire</li>
</ul>

<h2>Les raccourcis clavier incontournables</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb">Raccourci</th>
      <th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb">Action</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><strong>Ctrl + C</strong></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Copier</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><strong>Ctrl + X</strong></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Couper</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><strong>Ctrl + V</strong></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Coller</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><strong>Ctrl + Z</strong></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Annuler la dernière action</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><strong>Ctrl + A</strong></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Tout sélectionner</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><strong>Ctrl + S</strong></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Enregistrer</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><strong>Ctrl + P</strong></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Imprimer</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><strong>Alt + F4</strong></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Fermer le programme actif</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><strong>Win + D</strong></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Afficher/masquer le bureau</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><strong>Win + E</strong></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Ouvrir l''Explorateur de fichiers</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><strong>Win + L</strong></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Verrouiller l''ordinateur</td></tr>
  </tbody>
</table>
', 4),

  (c_ordi, 'Organiser ses fichiers et dossiers', '
<h2>Fichiers et dossiers : la différence</h2>
<p>Un <strong>fichier</strong> contient des données : un document, une photo, une vidéo…</p>
<p>Un <strong>dossier</strong> est un conteneur qui organise les fichiers, comme une chemise cartonnée dans un classeur.</p>

<h2>L''Explorateur de fichiers</h2>
<p>Ouvrez-le avec <strong>Win + E</strong> ou via l''icône dossier dans la barre des tâches. Dans le panneau gauche :</p>
<ul>
  <li><strong>Bureau :</strong> fichiers visibles sur le bureau</li>
  <li><strong>Documents :</strong> textes, tableaux, présentations</li>
  <li><strong>Images :</strong> photos</li>
  <li><strong>Téléchargements :</strong> tout ce que vous téléchargez depuis Internet</li>
</ul>

<h2>Créer un dossier</h2>
<ol>
  <li>Naviguez vers l''emplacement souhaité</li>
  <li>Clic droit dans un espace vide → <strong>Nouveau → Dossier</strong></li>
  <li>Tapez le nom et appuyez sur Entrée</li>
</ol>

<h2>Renommer, copier, déplacer, supprimer</h2>
<ul>
  <li><strong>Renommer :</strong> sélectionnez le fichier → touche <strong>F2</strong></li>
  <li><strong>Copier :</strong> Ctrl+C puis Ctrl+V dans le dossier destination</li>
  <li><strong>Déplacer :</strong> Ctrl+X puis Ctrl+V dans le dossier destination</li>
  <li><strong>Supprimer :</strong> touche <strong>Suppr</strong> → le fichier va dans la Corbeille</li>
</ul>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Organisation conseillée :</strong> Créez des dossiers comme <em>Travail</em>, <em>Personnel</em>, <em>Photos 2024</em>. Une bonne organisation vous fera gagner un temps précieux chaque jour.
</div>
', 5);

  -- Récupère l''ID de la leçon sur les raccourcis pour les exercices
  SELECT id INTO l_ordi_4 FROM public.lessons
  WHERE course_id = c_ordi AND order_index = 4;

  -- ============================================================
  -- 2. INTERNET ET NAVIGATION WEB
  -- ============================================================
  INSERT INTO public.courses (title, description, instructor_id, published)
  VALUES (
    'Internet et navigation web',
    'Naviguez sur le web en toute confiance : navigateurs, recherches efficaces, sites fiables et téléchargements sécurisés.',
    v_instructor, true
  ) RETURNING id INTO c_internet;

  INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  (c_internet, 'Comprendre Internet et les navigateurs', '
<h2>Qu''est-ce qu''Internet ?</h2>
<p>Internet est un réseau mondial d''ordinateurs connectés entre eux, permettant d''accéder à des milliards de pages d''information, de communiquer, d''acheter en ligne et de regarder des vidéos.</p>

<h2>Le navigateur web</h2>
<p>Le <strong>navigateur</strong> est le programme qui vous permet de visiter des sites web :</p>
<ul>
  <li><strong>Google Chrome</strong> (recommandé pour débutants)</li>
  <li><strong>Mozilla Firefox</strong></li>
  <li><strong>Microsoft Edge</strong> (installé par défaut sur Windows)</li>
</ul>

<h2>Lire une adresse web (URL)</h2>
<p>Une URL comme <code>https://www.google.fr</code> se lit :</p>
<ul>
  <li><strong>https://</strong> : connexion sécurisée (le cadenas 🔒 dans la barre d''adresse)</li>
  <li><strong>www.google</strong> : nom du site</li>
  <li><strong>.fr</strong> : extension (pays ou type)</li>
</ul>

<h2>Navigation de base</h2>
<ul>
  <li><strong>← →</strong> : boutons précédent / suivant</li>
  <li><strong>⟳</strong> : recharger la page</li>
  <li><strong>Ctrl + T</strong> : nouvel onglet</li>
  <li><strong>Ctrl + W</strong> : fermer l''onglet actif</li>
  <li><strong>Ctrl + L</strong> : aller dans la barre d''adresse</li>
</ul>
', 1),

  (c_internet, 'Faire une recherche efficace sur Google', '
<h2>Les bases d''une bonne recherche</h2>
<p>Tapez vos mots-clés dans la barre de recherche Google. Pas besoin de phrases : <em>"météo Paris"</em> est plus efficace que <em>"Quel temps fait-il à Paris aujourd''hui ?"</em></p>

<h2>Techniques pour affiner vos recherches</h2>
<ul>
  <li><strong>Guillemets :</strong> <code>"traitement de texte"</code> cherche l''expression exacte</li>
  <li><strong>Moins (−) :</strong> <code>banque -BNP</code> exclut un mot des résultats</li>
  <li><strong>site: :</strong> <code>site:gouvernement.fr retraite</code> cherche uniquement sur ce site</li>
  <li><strong>filetype: :</strong> <code>formulaire filetype:pdf</code> cherche uniquement des PDF</li>
</ul>

<h2>Lire les résultats intelligemment</h2>
<ul>
  <li><strong>Résultats "Annonce" :</strong> publicités payantes, pas forcément les meilleurs résultats</li>
  <li><strong>Résultats naturels :</strong> classés par pertinence par Google</li>
</ul>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Bonne pratique :</strong> Pour une info importante (santé, droit), consultez toujours plusieurs sources et privilégiez les sites officiels (.gouv.fr, organismes reconnus).
</div>
', 2),

  (c_internet, 'Reconnaître un site fiable', '
<h2>Signes d''un site de confiance</h2>
<ul>
  <li>🔒 <strong>HTTPS</strong> dans la barre d''adresse : connexion chiffrée</li>
  <li><strong>Nom de domaine clair :</strong> <code>ameli.fr</code> est officiel, <code>ameli-info-sante.xyz</code> est suspect</li>
  <li><strong>Mentions légales présentes</strong> (qui est l''éditeur ?)</li>
  <li><strong>Pas de popups agressives</strong> ni de boutons clignotants</li>
  <li><strong>Contenu daté et à jour</strong></li>
</ul>

<h2>Les arnaques courantes</h2>
<ul>
  <li><strong>Faux virus :</strong> une popup dit "VOTRE ORDINATEUR EST INFECTÉ" → fermez avec Alt+F4, n''appelez pas le numéro affiché</li>
  <li><strong>Phishing :</strong> un faux site imite votre banque ou La Poste pour voler vos identifiants</li>
  <li><strong>Offre trop belle :</strong> iPhone à 50€, c''est une arnaque</li>
</ul>

<div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>🚨 Règle d''or :</strong> Votre banque, les impôts ou la Sécu ne vous demanderont JAMAIS votre mot de passe par email ou téléphone.
</div>
', 3),

  (c_internet, 'Télécharger un fichier en sécurité', '
<h2>Comment télécharger</h2>
<ol>
  <li>Cliquez sur le lien ou bouton de téléchargement</li>
  <li>Une fenêtre demande : <strong>Ouvrir</strong> ou <strong>Enregistrer</strong> → choisissez <strong>Enregistrer</strong></li>
  <li>Choisissez le dossier (par défaut : Téléchargements)</li>
  <li>Attendez la fin du téléchargement</li>
</ol>

<h2>Retrouver un fichier téléchargé</h2>
<p>Dans Chrome : <strong>Ctrl + J</strong> affiche tous vos téléchargements récents. Sinon, ouvrez le dossier <strong>Téléchargements</strong> dans l''Explorateur.</p>

<h2>Vérifier la sécurité</h2>
<ul>
  <li>Méfiez-vous des fichiers <strong>.exe</strong> depuis des sites inconnus</li>
  <li>Windows affiche "Ce fichier peut être dangereux" → prenez cet avertissement au sérieux</li>
  <li>Téléchargez les logiciels uniquement depuis les <strong>sites officiels</strong> des éditeurs</li>
</ul>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Conseil :</strong> Les fichiers PDF, images (.jpg, .png) et documents Office (.docx) sont généralement sûrs. Les .exe et .zip depuis des sites inconnus nécessitent de la vigilance.
</div>
', 4);

  SELECT id INTO l_net_3 FROM public.lessons
  WHERE course_id = c_internet AND order_index = 3;

  -- ============================================================
  -- 3. LA MESSAGERIE ÉLECTRONIQUE
  -- ============================================================
  INSERT INTO public.courses (title, description, instructor_id, published)
  VALUES (
    'La messagerie électronique',
    'Créez et utilisez votre compte Gmail pour communiquer, envoyer des pièces jointes et gérer votre boîte de réception efficacement.',
    v_instructor, true
  ) RETURNING id INTO c_email;

  INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  (c_email, 'Créer et comprendre une adresse Gmail', '
<h2>Anatomie d''une adresse email</h2>
<p style="text-align:center;font-size:1.1em;margin:16px 0"><strong>prenom.nom</strong> @ <strong>gmail.com</strong></p>
<ul>
  <li>La partie avant <strong>@</strong> : votre identifiant (vous le choisissez)</li>
  <li>La partie après <strong>@</strong> : le fournisseur (Gmail, Yahoo, Orange…)</li>
</ul>

<h2>Créer un compte Gmail</h2>
<ol>
  <li>Allez sur <strong>gmail.com</strong> → cliquez sur <strong>Créer un compte</strong></li>
  <li>Remplissez votre prénom, nom et date de naissance</li>
  <li>Choisissez une adresse disponible (ex: <em>marie.martin2024@gmail.com</em>)</li>
  <li>Créez un mot de passe fort (voir le cours Sécurité)</li>
  <li>Ajoutez un numéro de téléphone pour récupérer votre compte</li>
</ol>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Conseil :</strong> Notez votre adresse et mot de passe dans un carnet papier. La perte d''accès à votre email peut bloquer beaucoup de démarches administratives.
</div>
', 1),

  (c_email, 'Envoyer et recevoir des emails', '
<h2>Envoyer un email</h2>
<ol>
  <li>Cliquez sur <strong>Rédiger</strong> (bouton en haut à gauche dans Gmail)</li>
  <li><strong>À :</strong> adresse email du destinataire</li>
  <li><strong>Objet :</strong> titre court et clair (ex: "Demande de rendez-vous le 15 mars")</li>
  <li>Rédigez votre message</li>
  <li>Cliquez sur <strong>Envoyer</strong></li>
</ol>

<h2>Cc et Cci</h2>
<ul>
  <li><strong>Cc</strong> (Copie carbone) : met en copie des personnes à informer. Tous les destinataires se voient mutuellement.</li>
  <li><strong>Cci</strong> (Copie cachée) : comme Cc, mais les destinataires ne voient pas les autres. Utile pour des envois groupés discrets.</li>
</ul>

<h2>Répondre à un email</h2>
<ul>
  <li><strong>Répondre :</strong> uniquement à l''expéditeur</li>
  <li><strong>Répondre à tous :</strong> à l''expéditeur et tous les destinataires en copie</li>
  <li><strong>Transférer :</strong> envoyer cet email à une autre personne</li>
</ul>
', 2),

  (c_email, 'Envoyer une pièce jointe', '
<h2>Joindre un fichier dans Gmail</h2>
<ol>
  <li>Commencez à rédiger votre email</li>
  <li>Cliquez sur l''icône <strong>trombone 📎</strong> en bas de la fenêtre</li>
  <li>Naviguez vers votre fichier et sélectionnez-le</li>
  <li>Attendez le chargement (barre de progression visible)</li>
  <li>Envoyez normalement</li>
</ol>

<h2>Limites importantes</h2>
<ul>
  <li>Gmail limite les pièces jointes à <strong>25 Mo</strong></li>
  <li>Pour des fichiers plus lourds, partagez un lien <strong>Google Drive</strong></li>
  <li>Ne jamais ouvrir une pièce jointe d''un expéditeur inconnu</li>
</ul>

<h2>Ouvrir une pièce jointe reçue</h2>
<p>Dans l''email reçu, la pièce jointe apparaît en bas. Survolez-la pour voir les options : <strong>Aperçu</strong> (sans télécharger) ou <strong>Télécharger</strong>.</p>
', 3),

  (c_email, 'Organiser sa boîte de réception', '
<h2>Les dossiers Gmail</h2>
<ul>
  <li><strong>Principale :</strong> emails personnels et importants</li>
  <li><strong>Promotions :</strong> newsletters et publicités</li>
  <li><strong>Réseaux sociaux :</strong> notifications Facebook, Instagram…</li>
  <li><strong>Spam :</strong> emails suspects filtrés automatiquement</li>
</ul>

<h2>Marquer, archiver, supprimer</h2>
<ul>
  <li><strong>Étoile ⭐ :</strong> marquer un email important</li>
  <li><strong>Archiver :</strong> enlever de la boîte de réception sans supprimer</li>
  <li><strong>Supprimer :</strong> envoyer dans la corbeille (supprimé après 30 jours)</li>
</ul>

<h2>Se désabonner</h2>
<p>En bas de chaque newsletter, cherchez le lien <strong>Se désabonner</strong>. C''est légalement obligatoire pour les entreprises sérieuses.</p>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Bonne habitude :</strong> Prenez 5 minutes par jour pour traiter vos emails : archivez ce qui est lu, répondez à l''urgent, supprimez les pubs.
</div>
', 4);

  -- ============================================================
  -- 4. WORD – TRAITEMENT DE TEXTE
  -- ============================================================
  INSERT INTO public.courses (title, description, instructor_id, published)
  VALUES (
    'Word – Traitement de texte',
    'Rédigez lettres, CV et documents professionnels avec Microsoft Word. De l''interface aux mises en forme avancées, pas à pas.',
    v_instructor, true
  ) RETURNING id INTO c_word;

  INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  (c_word, 'Découvrir l''interface Word', '
<h2>Ouvrir Word</h2>
<p>Menu <strong>Démarrer</strong> → tapez "Word" → cliquez. Un document vierge s''ouvre.</p>

<h2>L''interface en un coup d''œil</h2>
<ul>
  <li><strong>Le Ruban :</strong> barre d''outils avec tous les boutons, organisés en onglets</li>
  <li><strong>La zone de saisie :</strong> la feuille blanche où vous tapez</li>
  <li><strong>La barre d''état :</strong> en bas, indique le nombre de mots et le zoom</li>
</ul>

<h2>Les onglets principaux du Ruban</h2>
<ul>
  <li><strong>Accueil :</strong> police, taille, gras, italique, alignement</li>
  <li><strong>Insertion :</strong> images, tableaux, liens, en-têtes</li>
  <li><strong>Mise en page :</strong> marges, orientation, taille du papier</li>
  <li><strong>Révision :</strong> vérification orthographique, commentaires</li>
</ul>

<h2>Enregistrer son document</h2>
<p><strong>Ctrl + S</strong> pour enregistrer. La première fois, Word demande où enregistrer et quel nom donner. Choisissez <strong>.docx</strong> pour partager avec d''autres.</p>
', 1),

  (c_word, 'Mettre en forme son texte', '
<h2>Les mises en forme essentielles</h2>
<p>Sélectionnez d''abord votre texte (cliquez et faites glisser), puis :</p>
<ul>
  <li><strong>Ctrl + G</strong> : <strong>Gras</strong></li>
  <li><strong>Ctrl + I</strong> : <em>Italique</em></li>
  <li><strong>Ctrl + U</strong> : <u>Souligné</u></li>
</ul>

<h2>Police et taille</h2>
<ul>
  <li><strong>Police :</strong> nom de la typographie (Calibri, Times New Roman, Arial…)</li>
  <li><strong>Taille :</strong> 11–12 pour le corps du texte, 14–16 pour les titres</li>
</ul>

<h2>L''alignement</h2>
<ul>
  <li><strong>Ctrl + Maj + G :</strong> aligné à gauche (standard)</li>
  <li><strong>Ctrl + E :</strong> centré (pour les titres)</li>
  <li><strong>Ctrl + J :</strong> justifié (les deux bords alignés, comme dans un livre)</li>
</ul>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Conseil pro :</strong> Utilisez les <strong>Styles</strong> (onglet Accueil) plutôt que de tout mettre en forme manuellement. Les styles "Titre 1", "Titre 2", "Normal" rendent votre document cohérent et professionnel.
</div>
', 2),

  (c_word, 'Créer des listes et des tableaux', '
<h2>Les listes</h2>
<ul>
  <li><strong>Liste à puces (•) :</strong> pour des éléments sans ordre particulier</li>
  <li><strong>Liste numérotée (1. 2. 3.) :</strong> pour des étapes ou un classement</li>
</ul>
<p>Cliquez sur le bouton correspondant dans l''onglet <strong>Accueil</strong>, tapez votre texte, et appuyez sur <strong>Entrée</strong> pour passer à l''élément suivant.</p>

<h2>Insérer un tableau</h2>
<ol>
  <li>Onglet <strong>Insertion</strong> → <strong>Tableau</strong></li>
  <li>Survolez la grille pour choisir lignes et colonnes</li>
  <li>Cliquez pour insérer</li>
</ol>
<p>Dans le tableau, naviguez entre les cellules avec la touche <strong>Tab</strong>.</p>

<h2>Style de tableau</h2>
<p>Cliquez dans le tableau → l''onglet <strong>Création de tableau</strong> apparaît. Choisissez un style prédéfini pour un rendu professionnel immédiat.</p>
', 3),

  (c_word, 'Imprimer et enregistrer en PDF', '
<h2>Imprimer un document</h2>
<ol>
  <li><strong>Ctrl + P</strong> pour ouvrir le menu d''impression</li>
  <li>Choisissez votre imprimante et le nombre de copies</li>
  <li>Vérifiez l''<strong>aperçu</strong> à droite avant d''imprimer</li>
  <li>Cliquez sur <strong>Imprimer</strong></li>
</ol>

<h2>Enregistrer en PDF</h2>
<p>Le format PDF conserve exactement la mise en page sur n''importe quel appareil.</p>
<ol>
  <li>Fichier → <strong>Enregistrer sous</strong></li>
  <li>Dans "Type", choisissez <strong>PDF (*.pdf)</strong></li>
  <li>Cliquez sur <strong>Enregistrer</strong></li>
</ol>
<p>Raccourci rapide : Fichier → <strong>Exporter</strong> → Créer un document PDF/XPS.</p>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Bon réflexe :</strong> Envoyez toujours vos documents en PDF plutôt qu''en .docx. Cela garantit que la mise en page restera identique chez le destinataire.
</div>
', 4);

  -- ============================================================
  -- 5. EXCEL – TABLEAUX ET CALCULS
  -- ============================================================
  INSERT INTO public.courses (title, description, instructor_id, published)
  VALUES (
    'Excel – Tableaux et calculs',
    'Créez des tableaux, gérez votre budget et analysez vos données avec Microsoft Excel. Idéal pour les débutants complets.',
    v_instructor, true
  ) RETURNING id INTO c_excel;

  INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  (c_excel, 'Découvrir l''interface Excel', '
<h2>Ouvrir Excel</h2>
<p>Menu <strong>Démarrer</strong> → tapez "Excel" → cliquez. Un classeur vierge s''ouvre.</p>

<h2>Vocabulaire de base</h2>
<ul>
  <li><strong>Classeur :</strong> le fichier Excel (.xlsx), qui contient des feuilles</li>
  <li><strong>Feuille :</strong> un onglet (en bas). Un classeur peut en avoir plusieurs</li>
  <li><strong>Cellule :</strong> une case du tableau, identifiée par sa colonne (A, B…) et sa ligne (1, 2…)</li>
  <li><strong>Référence :</strong> l''adresse d''une cellule, ex: <code>B3</code> = colonne B, ligne 3</li>
</ul>

<h2>Se déplacer dans le tableau</h2>
<ul>
  <li><strong>Clic :</strong> sélectionne une cellule</li>
  <li><strong>Flèches du clavier :</strong> navigation cellule par cellule</li>
  <li><strong>Tab :</strong> passer à la cellule suivante à droite</li>
  <li><strong>Entrée :</strong> passer à la cellule du dessous</li>
  <li><strong>Ctrl + Début :</strong> aller à la cellule A1</li>
</ul>
', 1),

  (c_excel, 'Saisir et formater des données', '
<h2>Types de données</h2>
<ul>
  <li><strong>Texte :</strong> noms, titres de colonnes (aligné à gauche par défaut)</li>
  <li><strong>Nombres :</strong> quantités, prix (alignés à droite par défaut)</li>
  <li><strong>Dates :</strong> saisissez au format <code>15/03/2024</code></li>
</ul>

<h2>Mettre en forme les cellules</h2>
<p>Sélectionnez les cellules → onglet <strong>Accueil</strong> :</p>
<ul>
  <li>Gras, italique, taille de police</li>
  <li><strong>Couleur de remplissage :</strong> pour les en-têtes de colonnes</li>
  <li><strong>Format nombre :</strong> afficher des euros (€), des pourcentages (%), des dates…</li>
</ul>

<h2>Ajuster la largeur des colonnes</h2>
<p>Double-cliquez sur le bord droit de l''en-tête de colonne (entre A et B par exemple) : la colonne s''ajuste automatiquement à son contenu.</p>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Conseil :</strong> Mettez toujours vos en-têtes de colonnes en <strong>gras</strong> et avec une couleur de fond. Cela rend votre tableau immédiatement lisible.
</div>
', 2),

  (c_excel, 'Les formules essentielles', '
<h2>Principe des formules</h2>
<p>Toute formule commence par le signe <strong>=</strong>. Excel calcule et affiche le résultat dans la cellule.</p>

<h2>Les formules de base</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb">Formule</th>
      <th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb">Description</th>
      <th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb">Exemple</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><code>=A1+B1</code></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Addition</td><td style="padding:8px 12px;border:1px solid #e5e7eb">=100+250</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><code>=A1-B1</code></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Soustraction</td><td style="padding:8px 12px;border:1px solid #e5e7eb">=500-120</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><code>=A1*B1</code></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Multiplication</td><td style="padding:8px 12px;border:1px solid #e5e7eb">=10*1.2</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><code>=SOMME(A1:A10)</code></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Somme d''une plage</td><td style="padding:8px 12px;border:1px solid #e5e7eb">Additionne A1 à A10</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><code>=MOYENNE(B2:B8)</code></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Moyenne</td><td style="padding:8px 12px;border:1px solid #e5e7eb">Moyenne de B2 à B8</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><code>=MAX(C1:C5)</code></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Valeur maximale</td><td style="padding:8px 12px;border:1px solid #e5e7eb">Plus grande valeur</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><code>=MIN(C1:C5)</code></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Valeur minimale</td><td style="padding:8px 12px;border:1px solid #e5e7eb">Plus petite valeur</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb"><code>=NB(A1:A20)</code></td><td style="padding:8px 12px;border:1px solid #e5e7eb">Compte les nombres</td><td style="padding:8px 12px;border:1px solid #e5e7eb">Combien de valeurs ?</td></tr>
  </tbody>
</table>
', 3),

  (c_excel, 'Créer un graphique simple', '
<h2>Pourquoi les graphiques ?</h2>
<p>Un graphique permet de visualiser des données d''un coup d''œil. Excel en propose de nombreux types : barres, courbes, camembert…</p>

<h2>Créer un graphique</h2>
<ol>
  <li>Sélectionnez les données à représenter (incluez les titres de colonnes)</li>
  <li>Onglet <strong>Insertion</strong> → groupe <strong>Graphiques</strong></li>
  <li>Choisissez le type de graphique (histogramme, courbe, secteurs…)</li>
  <li>Le graphique s''insère automatiquement dans la feuille</li>
</ol>

<h2>Choisir le bon type</h2>
<ul>
  <li><strong>Histogramme (barres) :</strong> comparer des valeurs</li>
  <li><strong>Courbe :</strong> voir une évolution dans le temps</li>
  <li><strong>Secteurs (camembert) :</strong> montrer des pourcentages (parts d''un tout)</li>
</ul>

<h2>Modifier le graphique</h2>
<p>Cliquez sur le graphique → des onglets <strong>Création</strong> et <strong>Format</strong> apparaissent. Changez les couleurs, ajoutez un titre, modifiez les étiquettes.</p>
', 4);

  -- ============================================================
  -- 6. POWERPOINT – PRÉSENTATIONS
  -- ============================================================
  INSERT INTO public.courses (title, description, instructor_id, published)
  VALUES (
    'PowerPoint – Présentations',
    'Concevez des présentations claires et visuelles pour vos exposés, réunions ou projets avec Microsoft PowerPoint.',
    v_instructor, true
  ) RETURNING id INTO c_ppt;

  INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  (c_ppt, 'Créer sa première présentation', '
<h2>Ouvrir PowerPoint</h2>
<p>Menu <strong>Démarrer</strong> → tapez "PowerPoint" → cliquez. Choisissez <strong>Présentation vide</strong>.</p>

<h2>Vocabulaire</h2>
<ul>
  <li><strong>Diapositive (slide) :</strong> une page de votre présentation</li>
  <li><strong>Espace réservé :</strong> zone de texte ou d''image prédéfinie</li>
  <li><strong>Thème :</strong> ensemble de couleurs, polices et effets visuels cohérents</li>
</ul>

<h2>Choisir un thème</h2>
<p>Onglet <strong>Création</strong> → choisissez parmi les thèmes proposés. Votre présentation adoptera automatiquement les couleurs et polices du thème.</p>

<h2>Ajouter une nouvelle diapositive</h2>
<ul>
  <li>Onglet <strong>Accueil</strong> → <strong>Nouvelle diapositive</strong></li>
  <li>Ou faites un clic droit dans le panneau des diapositives (à gauche) → <strong>Nouvelle diapositive</strong></li>
</ul>

<h2>Enregistrer</h2>
<p><strong>Ctrl + S</strong>. Format : <strong>.pptx</strong> pour PowerPoint, ou exportez en PDF pour le partage.</p>
', 1),

  (c_ppt, 'Ajouter du texte et des images', '
<h2>Saisir du texte</h2>
<p>Cliquez sur un espace réservé de texte et tapez. Les espaces sont pré-formatés (titre, contenu).</p>
<p>Pour ajouter une zone de texte libre : onglet <strong>Insertion</strong> → <strong>Zone de texte</strong> → dessinez la zone.</p>

<h2>Règles d''or pour le texte</h2>
<ul>
  <li><strong>Moins c''est mieux :</strong> maximum 5 à 6 lignes par diapositive</li>
  <li>Taille minimum : <strong>24 points</strong> pour être lisible à distance</li>
  <li>Privilégiez les <strong>mots-clés</strong> aux phrases complètes</li>
</ul>

<h2>Insérer une image</h2>
<ol>
  <li>Onglet <strong>Insertion</strong> → <strong>Images</strong></li>
  <li>Choisissez <strong>À partir de ce périphérique</strong> pour une image de votre ordinateur, ou <strong>Images en ligne</strong> pour chercher sur Internet</li>
  <li>Redimensionnez en faisant glisser les poignées aux coins (maintenez Maj pour conserver les proportions)</li>
</ol>
', 2),

  (c_ppt, 'Animer et présenter', '
<h2>Ajouter des transitions</h2>
<p>Les transitions sont les effets entre les diapositives.</p>
<ol>
  <li>Cliquez sur une diapositive dans le panneau gauche</li>
  <li>Onglet <strong>Transitions</strong> → choisissez un effet</li>
  <li><strong>Appliquer partout</strong> pour utiliser la même transition sur toutes les diapositives</li>
</ol>

<h2>Animer les éléments</h2>
<p>Les animations font apparaître les éléments d''une diapositive progressivement.</p>
<ol>
  <li>Sélectionnez un élément (texte ou image)</li>
  <li>Onglet <strong>Animations</strong> → choisissez un effet d''entrée</li>
</ol>
<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>⚠️ Conseil :</strong> Moins d''animations, c''est plus professionnel. Évitez les effets trop complexes qui distraient de votre message.
</div>

<h2>Lancer la présentation</h2>
<ul>
  <li><strong>F5 :</strong> lancer depuis le début</li>
  <li><strong>Maj + F5 :</strong> lancer depuis la diapositive actuelle</li>
  <li><strong>Clic gauche / Flèche droite :</strong> diapositive suivante</li>
  <li><strong>Échap :</strong> quitter la présentation</li>
</ul>
', 3);

  -- ============================================================
  -- 7. SÉCURITÉ ET BONNES PRATIQUES
  -- ============================================================
  INSERT INTO public.courses (title, description, instructor_id, published)
  VALUES (
    'Sécurité et bonnes pratiques',
    'Protégez-vous en ligne : créez des mots de passe solides, reconnaissez les arnaques, sauvegardez vos données et maintenez votre ordinateur à jour.',
    v_instructor, true
  ) RETURNING id INTO c_secu;

  INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  (c_secu, 'Créer un mot de passe solide', '
<h2>Pourquoi les mots de passe sont cruciaux</h2>
<p>Un mot de passe faible peut être deviné en quelques secondes par un programme automatique. Vos comptes email, bancaires et administratifs méritent une vraie protection.</p>

<h2>Les règles d''un bon mot de passe</h2>
<ul>
  <li>Au moins <strong>12 caractères</strong></li>
  <li>Mélange de <strong>majuscules, minuscules, chiffres et symboles</strong> (!@#$…)</li>
  <li>Pas de mot du dictionnaire, prénom ou date de naissance</li>
  <li><strong>Unique pour chaque site</strong> : ne réutilisez jamais le même</li>
</ul>

<h2>La méthode des 3 mots</h2>
<p>Recommandée par les experts en cybersécurité : choisissez 3 mots aléatoires et assemblez-les avec un chiffre et un symbole :</p>
<p style="text-align:center;font-size:1.1em"><strong>Cheval!Lampe7Nuage</strong></p>
<p>Long, facile à mémoriser, très difficile à deviner.</p>

<h2>Gestionnaire de mots de passe</h2>
<p><strong>Bitwarden</strong> (gratuit) ou <strong>1Password</strong> retiennent tous vos mots de passe. Vous n''en mémorisez qu''un seul.</p>

<div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>🚨 Jamais :</strong> noter vos mots de passe sur un post-it collé sur l''écran ou dans un fichier texte non protégé.
</div>
', 1),

  (c_secu, 'Reconnaître les arnaques en ligne', '
<h2>Le phishing (hameçonnage)</h2>
<p>De faux emails imitent votre banque, La Poste ou les impôts pour vous faire cliquer sur un lien et voler vos informations.</p>
<p><strong>Signaux d''alarme :</strong></p>
<ul>
  <li>Adresse de l''expéditeur bizarre (ex: <em>impots@service-fiscal-officiel.xyz</em>)</li>
  <li>Fautes d''orthographe</li>
  <li>Urgence exagérée : "Votre compte sera suspendu dans 24h"</li>
  <li>Lien vers une adresse suspecte (survolez sans cliquer pour voir l''URL)</li>
</ul>

<h2>Les fausses alertes virus</h2>
<p>Une popup surgit : "VOTRE ORDINATEUR EST INFECTÉ ! Appelez ce numéro" → c''est une arnaque (scareware). Fermez la fenêtre avec <strong>Alt + F4</strong>.</p>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Réflexe sécurité :</strong> En cas de doute, ne cliquez jamais sur un lien. Allez directement sur le vrai site en tapant l''adresse dans votre navigateur.
</div>
', 2),

  (c_secu, 'Protéger ses données et faire des sauvegardes', '
<h2>Vos données personnelles</h2>
<p>Vos données personnelles incluent : nom, adresse, téléphone, email, photos, documents bancaires. Ces informations ont de la valeur et doivent être protégées.</p>

<h2>La règle de sauvegarde 3-2-1</h2>
<p>Votre ordinateur peut tomber en panne, être volé ou infecté. Sans sauvegarde, vous perdez tout.</p>
<ul>
  <li><strong>3</strong> copies de vos données</li>
  <li>sur <strong>2</strong> supports différents</li>
  <li>dont <strong>1</strong> hors site (cloud ou chez un proche)</li>
</ul>

<h2>Solutions pratiques</h2>
<ul>
  <li><strong>Clé USB / disque dur externe :</strong> sauvegarde locale, rapide</li>
  <li><strong>Google Drive / OneDrive :</strong> sauvegarde cloud automatique, 15 Go gratuits</li>
</ul>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Fréquence recommandée :</strong> Documents importants → 1 fois par semaine. Tout le reste → 1 fois par mois.
</div>
', 3),

  (c_secu, 'Mettre à jour ses logiciels', '
<h2>Pourquoi mettre à jour ?</h2>
<p>Les mises à jour ne servent pas qu''à ajouter des fonctionnalités : elles <strong>corrigent des failles de sécurité</strong>. Un système non mis à jour est vulnérable.</p>

<h2>Mettre à jour Windows</h2>
<ol>
  <li>Menu Démarrer → <strong>Paramètres ⚙️</strong></li>
  <li><strong>Windows Update</strong></li>
  <li><strong>Rechercher des mises à jour</strong></li>
  <li>Installez tout ce qui est proposé</li>
</ol>

<h2>L''antivirus Windows Defender</h2>
<p>Windows 11 intègre <strong>Microsoft Defender</strong> (gratuit, activé par défaut). Il est suffisant si vous respectez les bonnes pratiques. Vous n''avez pas besoin d''en acheter un.</p>

<h2>Ce qu''un antivirus ne protège pas</h2>
<ul>
  <li>Vos mots de passe si vous les donnez volontairement</li>
  <li>Un achat frauduleux que vous avez vous-même validé</li>
</ul>
<p>La meilleure protection reste votre <strong>vigilance</strong>.</p>
', 4);

  SELECT id INTO l_secu_1 FROM public.lessons
  WHERE course_id = c_secu AND order_index = 1;

  -- ============================================================
  -- 8. OUTILS DU QUOTIDIEN NUMÉRIQUE
  -- ============================================================
  INSERT INTO public.courses (title, description, instructor_id, published)
  VALUES (
    'Outils du quotidien numérique',
    'Les gestes indispensables que les débutants ne connaissent pas : PDF, captures d''écran, clés USB et formulaires en ligne.',
    v_instructor, true
  ) RETURNING id INTO c_quotidien;

  INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  (c_quotidien, 'Lire et créer des fichiers PDF', '
<h2>Qu''est-ce qu''un PDF ?</h2>
<p>Le format PDF (Portable Document Format) préserve la mise en page d''un document quelle que soit la machine utilisée pour l''ouvrir. C''est le format idéal pour les documents officiels.</p>

<h2>Ouvrir un PDF</h2>
<p>Double-cliquez sur le fichier : il s''ouvre dans votre navigateur ou dans <strong>Adobe Acrobat Reader</strong> (gratuit à télécharger sur adobe.com).</p>

<h2>Créer un PDF depuis n''importe quel programme</h2>
<ol>
  <li><strong>Ctrl + P</strong> pour ouvrir l''impression</li>
  <li>Dans "Imprimante", choisissez <strong>Microsoft Print to PDF</strong></li>
  <li>Cliquez sur Imprimer → choisissez où enregistrer</li>
</ol>

<h2>Remplir un formulaire PDF</h2>
<p>Ouvrez le PDF dans Adobe Acrobat Reader, cliquez sur les champs et tapez. Enregistrez avec <strong>Ctrl + S</strong>.</p>
', 1),

  (c_quotidien, 'Faire une capture d''écran', '
<h2>Capturer tout l''écran</h2>
<p>Appuyez sur <strong>Impr écran</strong> (ou PrtSc). L''image est copiée. Collez-la dans Word ou Paint avec <strong>Ctrl + V</strong>.</p>

<h2>Sélectionner une zone précise (recommandé)</h2>
<p><strong>Win + Maj + S</strong> : l''écran s''assombrit, sélectionnez la zone avec la souris. La capture est copiée automatiquement dans le presse-papiers.</p>

<h2>Enregistrer directement</h2>
<p><strong>Win + Impr écran</strong> : enregistre une capture plein écran dans <strong>Images → Captures d''écran</strong>.</p>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Usage pratique :</strong> Les captures d''écran sont très utiles pour montrer un problème technique au support, ou garder une preuve d''une commande en ligne.
</div>
', 2),

  (c_quotidien, 'Utiliser une clé USB', '
<h2>Connecter une clé USB</h2>
<p>Insérez la clé dans un port USB. Une notification apparaît et la clé s''affiche dans l''Explorateur de fichiers sous la lettre D:, E: ou F:.</p>

<h2>Copier des fichiers sur la clé</h2>
<ol>
  <li><strong>Win + E</strong> pour ouvrir l''Explorateur</li>
  <li>Naviguez vers votre fichier → <strong>Ctrl + C</strong> (copier)</li>
  <li>Cliquez sur la clé USB dans le panneau gauche</li>
  <li><strong>Ctrl + V</strong> (coller)</li>
</ol>

<h2>Retirer la clé en sécurité</h2>
<ol>
  <li>Clic droit sur l''icône de la clé dans l''Explorateur</li>
  <li><strong>Éjecter</strong></li>
  <li>Attendez le message "Vous pouvez retirer le périphérique"</li>
</ol>
<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>⚠️ Important :</strong> Ne retirez jamais une clé USB brusquement, vous risquez de corrompre vos fichiers.
</div>
', 3),

  (c_quotidien, 'Remplir des formulaires en ligne', '
<h2>Les types de champs</h2>
<ul>
  <li><strong>Champ texte :</strong> cliquez et tapez votre réponse</li>
  <li><strong>Liste déroulante :</strong> cliquez pour voir les options</li>
  <li><strong>Cases à cocher (☐) :</strong> cliquez pour cocher/décocher (choix multiples)</li>
  <li><strong>Boutons radio (○) :</strong> un seul choix possible parmi plusieurs</li>
  <li><strong>Date :</strong> calendrier ou format JJ/MM/AAAA</li>
</ul>

<h2>Navigation rapide</h2>
<ul>
  <li><strong>Tab :</strong> champ suivant</li>
  <li><strong>Maj + Tab :</strong> champ précédent</li>
</ul>

<h2>Avant de valider</h2>
<ul>
  <li>Vérifiez votre adresse email (c''est là que vous recevrez la confirmation)</li>
  <li>Relisez votre numéro de téléphone</li>
  <li>Les champs <strong>*</strong> sont obligatoires</li>
</ul>

<div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>🚨 Attention :</strong> Ne remplissez jamais un formulaire demandant votre numéro de carte bancaire complet sur un site dont vous n''êtes pas sûr.
</div>
', 4);

  -- ============================================================
  -- 9. GOOGLE WORKSPACE (GRATUIT)
  -- ============================================================
  INSERT INTO public.courses (title, description, instructor_id, published)
  VALUES (
    'Google Workspace – Outils gratuits',
    'Découvrez Google Docs, Sheets et Drive : des alternatives gratuites à Office, accessibles partout, sur tous vos appareils.',
    v_instructor, true
  ) RETURNING id INTO c_google;

  INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  (c_google, 'Google Drive : stocker et partager', '
<h2>Qu''est-ce que Google Drive ?</h2>
<p>Google Drive est un espace de stockage en ligne (cloud) offrant <strong>15 Go gratuits</strong>. Vos fichiers sont accessibles depuis n''importe quel appareil connecté à Internet.</p>

<h2>Accéder à Google Drive</h2>
<p>Allez sur <strong>drive.google.com</strong> et connectez-vous avec votre compte Gmail.</p>

<h2>Organiser ses fichiers</h2>
<ul>
  <li>Créez des dossiers : <strong>Nouveau → Dossier</strong></li>
  <li>Glissez-déposez vos fichiers depuis votre ordinateur</li>
  <li>Utilisez la barre de recherche en haut pour tout retrouver</li>
</ul>

<h2>Partager un fichier</h2>
<ol>
  <li>Clic droit sur le fichier → <strong>Partager</strong></li>
  <li>Saisissez l''adresse Gmail du destinataire</li>
  <li>Choisissez : <strong>Lecteur</strong> (voit uniquement) ou <strong>Éditeur</strong> (peut modifier)</li>
  <li>Cliquez sur <strong>Envoyer</strong></li>
</ol>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Avantage :</strong> Plus besoin d''envoyer des fichiers lourds par email. Partagez simplement un lien Google Drive.
</div>
', 1),

  (c_google, 'Google Docs : traitement de texte en ligne', '
<h2>Qu''est-ce que Google Docs ?</h2>
<p>Google Docs est un traitement de texte gratuit, similaire à Microsoft Word. Vos documents sont sauvegardés automatiquement dans Google Drive, en temps réel.</p>

<h2>Créer un document</h2>
<p>Sur Google Drive : <strong>Nouveau → Google Docs</strong>. Ou directement sur <strong>docs.google.com</strong>.</p>

<h2>Fonctions essentielles</h2>
<ul>
  <li>Mise en forme identique à Word (gras, taille, police…)</li>
  <li><strong>Sauvegarde automatique :</strong> plus besoin de Ctrl+S</li>
  <li><strong>Historique des versions :</strong> Fichier → Historique → retrouvez toute version antérieure</li>
</ul>

<h2>Collaboration en temps réel</h2>
<p>Partagez le document avec un collègue → vous travaillez simultanément sur le même fichier et voyez les modifications de l''autre en direct.</p>

<h2>Exporter</h2>
<p>Fichier → <strong>Télécharger</strong> → Word (.docx) ou PDF selon vos besoins.</p>
', 2),

  (c_google, 'Google Sheets : tableur en ligne', '
<h2>Créer une feuille de calcul</h2>
<p>Sur Google Drive : <strong>Nouveau → Google Sheets</strong>. Ou sur <strong>sheets.google.com</strong>.</p>

<h2>Les mêmes bases qu''Excel</h2>
<ul>
  <li>Cellules identifiées par colonne (A, B…) et ligne (1, 2…)</li>
  <li>Formules identiques : <code>=SOMME(A1:A10)</code>, <code>=MOYENNE(B2:B8)</code>…</li>
  <li>Graphiques disponibles dans <strong>Insertion → Graphique</strong></li>
</ul>

<h2>Avantages vs Excel</h2>
<ul>
  <li>100% <strong>gratuit</strong></li>
  <li>Accessible depuis <strong>n''importe quel appareil</strong></li>
  <li><strong>Collaboration en temps réel</strong></li>
  <li>Compatible avec les fichiers <strong>.xlsx</strong> de Excel</li>
</ul>
', 3),

  (c_google, 'Accéder à vos fichiers depuis votre téléphone', '
<h2>Applications mobiles Google</h2>
<p>Toutes disponibles gratuitement sur Android et iPhone :</p>
<ul>
  <li><strong>Google Drive :</strong> accédez à tous vos fichiers</li>
  <li><strong>Google Docs :</strong> rédigez et modifiez</li>
  <li><strong>Google Sheets :</strong> consultez vos tableaux</li>
  <li><strong>Gmail :</strong> gérez vos emails</li>
</ul>

<h2>Travailler sans connexion</h2>
<ol>
  <li>Dans Google Drive (app) → Paramètres → <strong>Hors connexion</strong></li>
  <li>Activez la synchronisation</li>
  <li>Vos modifications se synchronisent dès que vous êtes reconnecté</li>
</ol>

<h2>Le vrai avantage du cloud</h2>
<p>Un document créé sur votre téléphone est immédiatement disponible sur votre ordinateur, et vice versa. Connectez-vous avec le <strong>même compte Gmail</strong> sur tous vos appareils.</p>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Conseil :</strong> Google Drive, Docs et Sheets remplacent avantageusement Office pour une utilisation personnelle ou en petite équipe — et ils sont entièrement gratuits.
</div>
', 4);

  -- ============================================================
  -- EXERCICES (avec questions)
  -- ============================================================

  -- Exercice 1 : Raccourcis clavier (leçon 4 du cours Ordinateur)
  INSERT INTO public.exercises (lesson_id, title)
  VALUES (l_ordi_4, 'Quiz — Les raccourcis clavier')
  RETURNING id INTO e1;

  INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, order_index) VALUES
  (e1, 'Quel raccourci permet de copier un élément sélectionné ?',
   'qcm',
   '["Ctrl + X", "Ctrl + C", "Ctrl + V", "Ctrl + Z"]',
   'Ctrl + C', 1),
  (e1, 'Vrai ou Faux : Ctrl + Z permet d''annuler la dernière action.',
   'vrai_faux',
   '["Vrai", "Faux"]',
   'Vrai', 2),
  (e1, 'Quel raccourci ouvre l''Explorateur de fichiers ?',
   'qcm',
   '["Win + D", "Win + E", "Win + L", "Ctrl + E"]',
   'Win + E', 3),
  (e1, 'Vrai ou Faux : Alt + F4 ferme le programme actif.',
   'vrai_faux',
   '["Vrai", "Faux"]',
   'Vrai', 4);

  -- Exercice 2 : Sites fiables (leçon 3 du cours Internet)
  INSERT INTO public.exercises (lesson_id, title)
  VALUES (l_net_3, 'Quiz — Reconnaître un site fiable')
  RETURNING id INTO e2;

  INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, order_index) VALUES
  (e2, 'Quel signe indique une connexion sécurisée dans la barre d''adresse ?',
   'qcm',
   '["Un bouclier rouge", "Un cadenas 🔒 et HTTPS", "Un point d''exclamation !", "Une étoile ⭐"]',
   'Un cadenas 🔒 et HTTPS', 1),
  (e2, 'Vrai ou Faux : Votre banque peut vous demander votre mot de passe par email.',
   'vrai_faux',
   '["Vrai", "Faux"]',
   'Faux', 2),
  (e2, 'Que faire si une popup vous dit que votre ordinateur est infecté ?',
   'qcm',
   '["Appeler le numéro affiché", "Cliquer sur OK", "Fermer la fenêtre avec Alt+F4", "Éteindre l''ordinateur"]',
   'Fermer la fenêtre avec Alt+F4', 3);

  -- Exercice 3 : Mots de passe (leçon 1 du cours Sécurité)
  INSERT INTO public.exercises (lesson_id, title)
  VALUES (l_secu_1, 'Quiz — Créer un bon mot de passe')
  RETURNING id INTO e3;

  INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, order_index) VALUES
  (e3, 'Quelle est la longueur minimale recommandée pour un mot de passe sécurisé ?',
   'qcm',
   '["6 caractères", "8 caractères", "12 caractères", "20 caractères"]',
   '12 caractères', 1),
  (e3, 'Vrai ou Faux : On peut utiliser le même mot de passe sur plusieurs sites si on le trouve facile à retenir.',
   'vrai_faux',
   '["Vrai", "Faux"]',
   'Faux', 2),
  (e3, 'Parmi ces mots de passe, lequel est le plus sécurisé ?',
   'qcm',
   '["123456", "prenom2024", "Cheval!Lampe7Nuage", "motdepasse"]',
   'Cheval!Lampe7Nuage', 3),
  (e3, 'Vrai ou Faux : Un gestionnaire de mots de passe comme Bitwarden est une bonne pratique de sécurité.',
   'vrai_faux',
   '["Vrai", "Faux"]',
   'Vrai', 4);

  RAISE NOTICE '';
  RAISE NOTICE '✅ Données insérées avec succès !';
  RAISE NOTICE '   → 9 cours publiés';
  RAISE NOTICE '   → 36 leçons avec contenu complet';
  RAISE NOTICE '   → 3 exercices avec 11 questions (QCM + Vrai/Faux)';

END $$;
