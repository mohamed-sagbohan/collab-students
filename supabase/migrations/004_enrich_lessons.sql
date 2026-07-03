-- ============================================================
-- Migration 004 — Enrichissement du contenu des leçons
-- Exécutez dans Supabase > SQL Editor
-- ============================================================

DO $$
BEGIN

-- ============================================================
-- COURS 1 : MAÎTRISER SON ORDINATEUR
-- ============================================================

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>Avant de commencer à utiliser votre ordinateur, il est essentiel de savoir l''allumer et l''éteindre correctement. Un mauvais arrêt peut endommager vos fichiers ou ralentir votre machine. Cette leçon vous guide pas à pas.</p>

<h2>Allumer l''ordinateur</h2>
<ol>
  <li>Appuyez sur le bouton d''alimentation <strong>⏻</strong> (sur la tour, le portable ou la tablette).</li>
  <li>L''ordinateur affiche un écran de démarrage avec le logo Windows.</li>
  <li>Patientez : le démarrage prend entre 30 secondes et 2 minutes selon votre machine.</li>
  <li>Si un mot de passe est demandé, saisissez-le et appuyez sur <strong>Entrée</strong>.</li>
</ol>

<h2>Éteindre correctement</h2>
<p>Ne jamais appuyer sur le bouton d''alimentation pour éteindre, sauf en cas de blocage total. La bonne méthode :</p>
<ol>
  <li>Fermez tous vos programmes ouverts (sauvegardez vos documents si besoin).</li>
  <li>Cliquez sur le bouton <strong>Démarrer</strong> (icône Windows en bas à gauche).</li>
  <li>Cliquez sur l''icône <strong>⏻ Alimentation</strong>.</li>
  <li>Choisissez <strong>Arrêter</strong>.</li>
  <li>Attendez que l''écran s''éteigne complètement avant de débrancher le câble électrique.</li>
</ol>

<h2>Veille, Redémarrage ou Arrêt : lequel choisir ?</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:10px 14px;text-align:left;border:1px solid #e5e7eb">Mode</th>
      <th style="padding:10px 14px;text-align:left;border:1px solid #e5e7eb">Quand l''utiliser</th>
      <th style="padding:10px 14px;text-align:left;border:1px solid #e5e7eb">Temps de reprise</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Veille</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Pause de moins d''une journée</td><td style="padding:8px 14px;border:1px solid #e5e7eb">2 à 5 secondes</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Redémarrer</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Après une mise à jour ou en cas de lenteur</td><td style="padding:8px 14px;border:1px solid #e5e7eb">1 à 2 minutes</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Arrêter</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">En fin de journée ou avant un déplacement</td><td style="padding:8px 14px;border:1px solid #e5e7eb">1 à 2 minutes</td></tr>
  </tbody>
</table>

<h2>Mon ordinateur ne répond plus — que faire ?</h2>
<p>Si l''écran est figé et que rien ne fonctionne :</p>
<ol>
  <li>Attendez 1 à 2 minutes : Windows règle parfois le problème seul.</li>
  <li>Essayez <strong>Ctrl + Alt + Suppr</strong> → cliquez sur <strong>Gestionnaire des tâches</strong> → fermez le programme bloqué.</li>
  <li>En dernier recours seulement : maintenez le bouton d''alimentation appuyé 5 secondes. L''ordinateur s''éteint de force.</li>
</ol>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Bonne habitude :</strong> Redémarrez votre ordinateur au moins une fois par semaine. Cela libère la mémoire, installe les mises à jour et maintient votre machine performante.
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>Toujours éteindre via le menu <strong>Démarrer → Arrêter</strong></li>
  <li>La <strong>veille</strong> est pratique pour une courte absence</li>
  <li>Le <strong>redémarrage</strong> résout de nombreux problèmes de lenteur</li>
  <li>Forcer l''arrêt avec le bouton uniquement si l''ordinateur est complètement bloqué</li>
</ul>
' WHERE title = 'Allumer et éteindre correctement';

-- ──────────────────────────────────────────────────────────────

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>Dès que Windows démarre, vous arrivez sur le bureau. C''est votre espace de travail numérique. Comprendre comment il est organisé vous permettra de naviguer rapidement et efficacement.</p>

<h2>Le bureau Windows</h2>
<p>Le bureau est l''écran principal que vous voyez après vous être connecté. Il contient :</p>
<ul>
  <li><strong>Les icônes :</strong> petits images représentant vos programmes, dossiers ou fichiers. Double-cliquez dessus pour les ouvrir.</li>
  <li><strong>La barre des tâches :</strong> barre horizontale en bas de l''écran. Elle affiche les programmes ouverts, l''horloge et les notifications.</li>
  <li><strong>Le bouton Démarrer :</strong> icône Windows en bas à gauche, accès à tous vos programmes et paramètres.</li>
  <li><strong>La barre de recherche :</strong> à côté de Démarrer, pour trouver rapidement n''importe quel programme ou fichier.</li>
</ul>

<h2>Les fenêtres</h2>
<p>Chaque programme s''ouvre dans une <strong>fenêtre</strong>. En haut à droite de chaque fenêtre se trouvent 3 boutons essentiels :</p>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;border:1px solid #e5e7eb">Bouton</th>
      <th style="padding:8px 14px;border:1px solid #e5e7eb">Action</th>
      <th style="padding:8px 14px;border:1px solid #e5e7eb">Ce qui se passe</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb;text-align:center"><strong>—</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Réduire</td><td style="padding:8px 14px;border:1px solid #e5e7eb">La fenêtre disparaît mais le programme reste ouvert (visible dans la barre des tâches)</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb;text-align:center"><strong>□</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Agrandir / Restaurer</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Bascule entre plein écran et taille libre</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb;text-align:center"><strong>✕</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Fermer</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Ferme le programme complètement</td></tr>
  </tbody>
</table>

<h2>Déplacer et redimensionner une fenêtre</h2>
<ul>
  <li><strong>Déplacer :</strong> cliquez sur la barre de titre (en haut de la fenêtre) et maintenez le bouton gauche enfoncé tout en faisant glisser.</li>
  <li><strong>Redimensionner :</strong> placez votre curseur sur un bord ou un coin jusqu''à ce qu''il devienne une double flèche (↔ ou ↕), puis faites glisser.</li>
</ul>

<h2>Travailler avec plusieurs fenêtres</h2>
<p><strong>Astuce Snap :</strong> faites glisser une fenêtre vers le bord gauche ou droit de l''écran. Windows la positionnera automatiquement en demi-écran. Faites de même avec une autre fenêtre de l''autre côté pour travailler sur deux applications côte à côte.</p>

<h2>La barre des tâches en détail</h2>
<ul>
  <li><strong>Programmes épinglés :</strong> à gauche, les applications que vous utilisez souvent</li>
  <li><strong>Applications ouvertes :</strong> s''affichent avec un trait en dessous</li>
  <li><strong>Zone de notification :</strong> à droite — réseau Wi-Fi, volume, horloge, batterie</li>
  <li><strong>Centre de notifications (🔔) :</strong> tout à droite, affiche vos alertes</li>
</ul>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Raccourcis utiles :</strong><br>
  <strong>Win + D</strong> : afficher/masquer le bureau rapidement<br>
  <strong>Alt + Tab</strong> : basculer entre les fenêtres ouvertes<br>
  <strong>Win + Tab</strong> : vue de toutes les fenêtres ouvertes
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>Le bouton <strong>—</strong> réduit la fenêtre sans fermer le programme</li>
  <li>Le bouton <strong>✕</strong> ferme le programme</li>
  <li>On peut travailler avec deux fenêtres côte à côte grâce au Snap</li>
  <li><strong>Alt + Tab</strong> permet de passer rapidement d''un programme à un autre</li>
</ul>
' WHERE title = 'Le bureau, les fenêtres et la barre des tâches';

-- ──────────────────────────────────────────────────────────────

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>La souris est l''outil principal pour interagir avec votre ordinateur. Maîtriser ses différentes actions vous permettra de travailler plus vite et plus efficacement. Cette leçon couvre tout ce que vous devez savoir.</p>

<h2>Les parties de la souris</h2>
<ul>
  <li><strong>Bouton gauche :</strong> le plus utilisé — sélectionner, cliquer sur des boutons, ouvrir des liens</li>
  <li><strong>Bouton droit :</strong> ouvre un menu contextuel avec des options supplémentaires</li>
  <li><strong>Molette centrale :</strong> faire défiler une page vers le haut ou le bas</li>
  <li><strong>Boutons supplémentaires</strong> (sur certaines souris) : naviguer Précédent/Suivant dans le navigateur</li>
</ul>

<h2>Les actions essentielles</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Action</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Comment faire</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Résultat</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Clic simple</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Un clic bouton gauche</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Sélectionner un élément</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Double clic</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Deux clics rapides bouton gauche</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Ouvrir un fichier ou programme</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Clic droit</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Un clic bouton droit</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Afficher le menu contextuel</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Maintenir + glisser</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Clic gauche maintenu et déplacement</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Déplacer un fichier (glisser-déposer)</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Molette</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Faire tourner la molette</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Défiler la page</td></tr>
  </tbody>
</table>

<h2>Sélectionner plusieurs éléments</h2>
<p>Utile pour copier ou déplacer plusieurs fichiers à la fois :</p>
<ul>
  <li><strong>Ctrl + clic :</strong> maintenez Ctrl et cliquez sur chaque élément — sélection individuelle</li>
  <li><strong>Maj + clic :</strong> cliquez sur le premier élément, maintenez Maj, cliquez sur le dernier — sélectionne toute la plage</li>
  <li><strong>Cliquer-glisser dans un espace vide :</strong> dessine un rectangle de sélection autour de plusieurs éléments</li>
</ul>

<h2>Le glisser-déposer (drag and drop)</h2>
<ol>
  <li>Cliquez sur un fichier ou une icône et <strong>maintenez</strong> le bouton gauche enfoncé.</li>
  <li>Déplacez la souris vers l''emplacement de destination.</li>
  <li>Relâchez le bouton gauche.</li>
</ol>

<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>⚠️ À savoir :</strong> Le glisser-déposer entre deux dossiers du même disque <em>déplace</em> le fichier. Vers une clé USB ou un autre disque, il est <em>copié</em>. Pour toujours copier, maintenez <strong>Ctrl</strong> pendant le glisser-déposer.
</div>

<h2>Le pavé tactile (touchpad) sur portable</h2>
<p>Si vous utilisez un ordinateur portable sans souris externe :</p>
<ul>
  <li><strong>Glisser le doigt :</strong> déplace le curseur</li>
  <li><strong>Tap (toucher) :</strong> équivaut au clic gauche</li>
  <li><strong>Tap à deux doigts :</strong> équivaut au clic droit</li>
  <li><strong>Glisser deux doigts :</strong> défile la page</li>
  <li><strong>Pincer / Écarter deux doigts :</strong> zoom avant / arrière</li>
</ul>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>Le <strong>clic gauche</strong> sélectionne et ouvre</li>
  <li>Le <strong>clic droit</strong> affiche les options</li>
  <li>Le <strong>double clic</strong> ouvre les fichiers et programmes</li>
  <li><strong>Ctrl + clic</strong> pour sélectionner plusieurs éléments</li>
</ul>
' WHERE title = 'La souris et ses fonctions';

-- ──────────────────────────────────────────────────────────────

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>Le clavier est votre outil de saisie principal. Au-delà des lettres et chiffres, il contient des touches spéciales et des combinaisons (raccourcis) qui vous font économiser un temps précieux chaque jour.</p>

<h2>Les touches spéciales à connaître absolument</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Touche</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Rôle</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Entrée (↵)</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Valider, confirmer, aller à la ligne</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Retour arrière (⌫)</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Effacer le caractère à gauche du curseur</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Suppr (Delete)</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Effacer le caractère à droite, ou supprimer un fichier</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Maj (Shift ⇧)</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Majuscule momentanée, accès aux symboles (@, #, !, …)</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Verr Maj (Caps Lock)</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Active/désactive les majuscules permanentes</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Échap (Esc)</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Annuler une action, fermer un menu ou une boîte de dialogue</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Tab (↹)</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Passer au champ suivant dans un formulaire, indenter</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Espace</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Insérer un espace, faire défiler une page</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Flèches (← ↑ → ↓)</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Déplacer le curseur dans un texte ou naviguer dans les menus</td></tr>
  </tbody>
</table>

<h2>Les raccourcis clavier indispensables</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Raccourci</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Action</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + C</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Copier la sélection</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + X</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Couper la sélection</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + V</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Coller</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + Z</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Annuler la dernière action</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + Y</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Rétablir (annuler l''annulation)</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + A</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Tout sélectionner</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + S</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Enregistrer le document en cours</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + P</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Imprimer</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + F</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Rechercher dans une page ou un document</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + T</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Nouvel onglet dans le navigateur</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Alt + F4</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Fermer le programme actif</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Alt + Tab</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Basculer entre les programmes ouverts</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Win + D</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Afficher/masquer le bureau</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Win + E</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Ouvrir l''Explorateur de fichiers</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Win + L</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Verrouiller l''ordinateur</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Win + I</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Ouvrir les Paramètres Windows</td></tr>
  </tbody>
</table>

<h2>Astuce : mémoriser les raccourcis</h2>
<p>Les initiales des raccourcis correspondent souvent à leur action en anglais :</p>
<ul>
  <li><strong>C</strong> = <em>Copy</em> (copier) → Ctrl + C</li>
  <li><strong>V</strong> = <em>paVer</em> (coller) → Ctrl + V</li>
  <li><strong>X</strong> = comme une paire de ciseaux ✂ (couper) → Ctrl + X</li>
  <li><strong>Z</strong> = la dernière lettre de l''alphabet → revenir en arrière → Ctrl + Z</li>
  <li><strong>S</strong> = <em>Save</em> (enregistrer) → Ctrl + S</li>
</ul>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Conseil :</strong> Apprenez 2 à 3 nouveaux raccourcis par semaine. Utilisez-les délibérément pendant quelques jours jusqu''à ce qu''ils deviennent automatiques. Commencez par Ctrl+C, Ctrl+V et Ctrl+Z.
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li><strong>Ctrl + Z</strong> est votre meilleur ami : il annule n''importe quelle erreur</li>
  <li><strong>Ctrl + S</strong> doit devenir un réflexe : enregistrez souvent</li>
  <li><strong>Alt + Tab</strong> permet de passer d''un programme à l''autre sans toucher la souris</li>
</ul>
' WHERE title = 'Le clavier et les raccourcis essentiels';

-- ──────────────────────────────────────────────────────────────

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>Votre ordinateur contient des milliers de fichiers. Sans organisation, retrouver un document devient un vrai cauchemar. Cette leçon vous apprend à structurer vos fichiers comme un professionnel.</p>

<h2>Fichiers et dossiers : la différence</h2>
<ul>
  <li>Un <strong>fichier</strong> contient des données : un document Word (.docx), une photo (.jpg), une vidéo (.mp4), une musique (.mp3)…</li>
  <li>Un <strong>dossier</strong> est un conteneur qui organise les fichiers, comme une chemise cartonnée dans un classeur.</li>
  <li>Les dossiers peuvent eux-mêmes contenir d''autres dossiers (sous-dossiers).</li>
</ul>

<h2>Comprendre les extensions de fichiers</h2>
<p>L''extension (les lettres après le point) indique le type de fichier :</p>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Extension</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Type</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Programme pour l''ouvrir</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">.docx</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Document Word</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Microsoft Word</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">.xlsx</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Tableau Excel</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Microsoft Excel</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">.pdf</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Document PDF</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Navigateur ou Adobe Reader</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">.jpg .png</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Image</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Visionneuse de photos Windows</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">.mp4 .avi</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Vidéo</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Lecteur Windows Media</td></tr>
  </tbody>
</table>

<h2>L''Explorateur de fichiers</h2>
<p>Ouvrez-le avec <strong>Win + E</strong> ou via l''icône dossier dans la barre des tâches. Il se compose de :</p>
<ul>
  <li><strong>Panneau gauche :</strong> arborescence de vos dossiers (Bureau, Documents, Images, Téléchargements…)</li>
  <li><strong>Zone principale :</strong> contenu du dossier sélectionné</li>
  <li><strong>Barre d''adresse :</strong> en haut, affiche le chemin du dossier actuel</li>
</ul>

<h2>Créer un dossier</h2>
<ol>
  <li>Naviguez vers l''emplacement souhaité dans l''Explorateur.</li>
  <li>Clic droit dans un espace vide → <strong>Nouveau → Dossier</strong></li>
  <li>Tapez le nom du dossier et appuyez sur <strong>Entrée</strong>.</li>
</ol>

<h2>Renommer, copier, déplacer, supprimer</h2>
<ul>
  <li><strong>Renommer :</strong> clic droit sur le fichier → <strong>Renommer</strong> (ou touche <strong>F2</strong>)</li>
  <li><strong>Copier :</strong> Ctrl+C → naviguez vers la destination → Ctrl+V</li>
  <li><strong>Déplacer :</strong> Ctrl+X → naviguez vers la destination → Ctrl+V</li>
  <li><strong>Supprimer :</strong> touche <strong>Suppr</strong> → le fichier va dans la <strong>Corbeille</strong></li>
  <li><strong>Supprimer définitivement :</strong> Maj + Suppr (sans passer par la Corbeille — attention, irréversible !)</li>
</ul>

<h2>Retrouver un fichier avec la recherche</h2>
<p>Si vous ne retrouvez plus un fichier :</p>
<ol>
  <li>Ouvrez l''Explorateur de fichiers (<strong>Win + E</strong>)</li>
  <li>Cliquez dans la barre de recherche en haut à droite</li>
  <li>Tapez une partie du nom du fichier ou son contenu</li>
  <li>Windows liste tous les fichiers correspondants</li>
</ol>

<h2>Organisation recommandée pour les débutants</h2>
<p>Dans votre dossier <strong>Documents</strong>, créez cette structure simple :</p>
<pre style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;font-size:0.85em">
Documents/
├── Administratif/
│   ├── Impôts/
│   └── Santé/
├── Personnel/
│   ├── Photos/
│   └── Loisirs/
└── Travail/
    ├── Projets/
    └── Archives/
</pre>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Bonne pratique :</strong> Nommez vos fichiers de manière explicite avec la date : <em>2024-03-15_Facture_EDF.pdf</em> plutôt que <em>document1.pdf</em>. Vous retrouverez tout instantanément.
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>Les fichiers se rangent dans des <strong>dossiers</strong></li>
  <li><strong>Win + E</strong> ouvre l''Explorateur de fichiers</li>
  <li>Un fichier supprimé va d''abord dans la <strong>Corbeille</strong> (récupérable)</li>
  <li>Nommez vos fichiers clairement et datez-les</li>
</ul>
' WHERE title = 'Organiser ses fichiers et dossiers';

-- ============================================================
-- COURS 2 : INTERNET ET NAVIGATION WEB
-- ============================================================

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>Internet est devenu indispensable dans la vie quotidienne. Mais comment ça fonctionne exactement, et quels outils utiliser pour naviguer en toute sécurité ? Cette leçon répond à ces questions fondamentales.</p>

<h2>Qu''est-ce qu''Internet ?</h2>
<p>Internet est un réseau mondial d''ordinateurs et de serveurs connectés entre eux. Il permet de :</p>
<ul>
  <li>Accéder à des milliards de pages d''information</li>
  <li>Communiquer par email, messagerie ou vidéo</li>
  <li>Acheter en ligne, regarder des vidéos, écouter de la musique</li>
  <li>Effectuer des démarches administratives (impôts, Ameli, CAF…)</li>
</ul>

<h2>Le navigateur web : votre porte d''accès</h2>
<p>Le navigateur est le programme que vous utilisez pour visiter des sites :</p>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Navigateur</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Points forts</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Google Chrome</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Le plus populaire, rapide, simple. Recommandé pour les débutants.</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Microsoft Edge</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Installé par défaut sur Windows 11, performant.</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Mozilla Firefox</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Très respectueux de la vie privée, open source.</td></tr>
  </tbody>
</table>

<h2>Décrypter une adresse web (URL)</h2>
<p>Exemple : <code>https://www.ameli.fr/assure/remboursements</code></p>
<ul>
  <li><strong>https://</strong> : connexion chiffrée et sécurisée (le cadenas 🔒 dans la barre)</li>
  <li><strong>www</strong> : sous-domaine (souvent optionnel)</li>
  <li><strong>ameli.fr</strong> : nom du site + extension</li>
  <li><strong>/assure/remboursements</strong> : chemin vers la page précise</li>
</ul>

<h2>Les extensions de domaines courantes</h2>
<ul>
  <li><strong>.fr</strong> : site français</li>
  <li><strong>.com</strong> : site commercial international</li>
  <li><strong>.gouv.fr</strong> : site du gouvernement français (officiel)</li>
  <li><strong>.org</strong> : organisation (associations, ONG…)</li>
  <li><strong>.edu</strong> : établissement d''enseignement</li>
</ul>

<h2>Les onglets : travailler sur plusieurs sites à la fois</h2>
<ul>
  <li><strong>Ctrl + T</strong> : ouvrir un nouvel onglet</li>
  <li><strong>Ctrl + W</strong> : fermer l''onglet actif</li>
  <li><strong>Ctrl + Tab</strong> : passer à l''onglet suivant</li>
  <li>Clic du milieu (molette) sur un lien : ouvre dans un nouvel onglet sans quitter la page</li>
</ul>

<h2>Les favoris (marque-pages)</h2>
<p>Pour retenir un site que vous aimez :</p>
<ol>
  <li>Naviguez vers le site</li>
  <li>Appuyez sur <strong>Ctrl + D</strong></li>
  <li>Donnez un nom et choisissez le dossier</li>
  <li>Retrouvez vos favoris avec <strong>Ctrl + Maj + B</strong> (barre des favoris)</li>
</ol>

<h2>L''historique de navigation</h2>
<p><strong>Ctrl + H</strong> affiche tous les sites que vous avez visités. Utile pour retrouver une page vue sans l''avoir sauvegardée. Pour effacer l''historique : <strong>Ctrl + Maj + Suppr</strong>.</p>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Navigation privée :</strong> <strong>Ctrl + Maj + N</strong> ouvre une fenêtre de navigation privée (aucun historique, aucun cookie enregistré). Utile sur un ordinateur partagé.
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>Le <strong>navigateur</strong> est le programme pour visiter des sites</li>
  <li>Une URL commençant par <strong>https</strong> indique une connexion sécurisée</li>
  <li><strong>Ctrl + T</strong> ouvre un nouvel onglet, <strong>Ctrl + D</strong> ajoute aux favoris</li>
  <li><strong>.gouv.fr</strong> = site officiel du gouvernement français</li>
</ul>
' WHERE title = 'Comprendre Internet et les navigateurs';

-- ──────────────────────────────────────────────────────────────

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>Google traite plus de 8 milliards de recherches par jour. Savoir bien chercher vous permet de trouver une information fiable en quelques secondes, là où d''autres perdent des minutes à trier des résultats non pertinents.</p>

<h2>Comment Google fonctionne</h2>
<p>Google parcourt en permanence des milliards de pages web avec des programmes appelés <em>robots d''indexation</em>. Quand vous cherchez, il classe les résultats par pertinence selon plus de 200 critères.</p>

<h2>Les bases : choisir les bons mots-clés</h2>
<ul>
  <li>Tapez des <strong>mots-clés essentiels</strong>, pas des phrases complètes</li>
  <li><em>"météo Lyon demain"</em> est plus efficace que <em>"Quel temps fera-t-il à Lyon demain ?"</em></li>
  <li>Google ignore les mots courants (le, la, de, et…) sauf dans les guillemets</li>
  <li>L''ordre des mots a peu d''importance pour Google</li>
</ul>

<h2>Techniques avancées pour affiner vos recherches</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Astuce</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Exemple</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Résultat</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>"guillemets"</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb"><code>"traitement de texte"</code></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Cherche l''expression exacte</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>moins (−)</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb"><code>jaguar -voiture</code></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Exclut le mot "voiture" des résultats</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>site:</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb"><code>site:service-public.fr retraite</code></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Cherche uniquement sur ce site</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>filetype:</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb"><code>formulaire CERFA filetype:pdf</code></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Cherche uniquement des PDF</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>OR</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb"><code>Lyon OR Marseille logement</code></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Résultats pour l''un ou l''autre</td></tr>
  </tbody>
</table>

<h2>Lire les résultats intelligemment</h2>
<ul>
  <li><strong>Résultats "Annonce" :</strong> publicités payantes, affichées en premier. Pas forcément les plus pertinents.</li>
  <li><strong>Résultats naturels :</strong> classés par Google selon leur pertinence et fiabilité.</li>
  <li><strong>Encadrés d''information :</strong> résumés affichés directement par Google (horaires, calculs, définitions…)</li>
  <li><strong>Google Maps :</strong> apparaît pour les recherches d''adresses ou commerces locaux</li>
</ul>

<h2>Les outils de recherche utiles</h2>
<p>Après une recherche, cliquez sur <strong>Outils</strong> (sous la barre de recherche) pour filtrer par :</p>
<ul>
  <li><strong>Date :</strong> retrouver uniquement les articles récents (dernière heure, jour, semaine, mois, année)</li>
  <li><strong>Type :</strong> images, vidéos, actualités, livres, maps</li>
</ul>

<h2>Exemples concrets de recherches</h2>
<ul>
  <li>Trouver une adresse : <code>Mairie de Lyon adresse horaires</code></li>
  <li>Convertir : <code>100 euros en dollars</code></li>
  <li>Calculer : <code>25 * 4 + 12</code> (Google fait le calcul directement)</li>
  <li>Traduire : <code>traduire "bonjour" en espagnol</code></li>
  <li>Météo : <code>météo Paris</code></li>
</ul>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Bonne pratique :</strong> Pour toute information importante (santé, droit, finances), consultez toujours plusieurs sources et privilégiez les sites officiels : <em>.gouv.fr</em>, <em>ameli.fr</em>, <em>service-public.fr</em>. La première page Google n''est pas toujours fiable.
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>Utilisez des <strong>mots-clés</strong>, pas des phrases</li>
  <li>Les <strong>guillemets</strong> cherchent une expression exacte</li>
  <li><strong>site:nom-du-site.fr</strong> pour limiter la recherche à un site</li>
  <li>Méfiez-vous des résultats marqués <strong>"Annonce"</strong></li>
</ul>
' WHERE title = 'Faire une recherche efficace sur Google';

-- ──────────────────────────────────────────────────────────────

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>Internet regorge d''informations fiables… mais aussi d''arnaques, de fausses nouvelles et de sites dangereux. Savoir distinguer un site de confiance d''un site malveillant est une compétence essentielle.</p>

<h2>Les signes d''un site fiable</h2>
<ul>
  <li>🔒 <strong>HTTPS dans la barre d''adresse</strong> : la connexion est chiffrée. Vos données échangées avec ce site sont protégées. Cliquez sur le cadenas pour voir le certificat.</li>
  <li><strong>Nom de domaine clair et reconnaissable :</strong> <code>ameli.fr</code>, <code>service-public.fr</code>, <code>leboncoin.fr</code>. Méfiez-vous des variantes : <code>ameli-france-sante.xyz</code>.</li>
  <li><strong>Mentions légales présentes :</strong> tout site sérieux affiche qui le gère (en bas de page ou dans "Mentions légales").</li>
  <li><strong>Contenu daté et à jour :</strong> les articles mentionnent leur date de publication.</li>
  <li><strong>Pas de popups agressives</strong> ni d''alertes qui clignottent.</li>
  <li><strong>Coordonnées de contact accessibles :</strong> adresse, téléphone ou formulaire de contact.</li>
</ul>

<h2>Attention aux faux sites</h2>
<p>Les escrocs créent des sites qui ressemblent parfaitement à de vrais sites. Comment les repérer :</p>
<ul>
  <li>L''URL est proche mais pas identique : <code>crédit-agricolé-connexion.com</code> au lieu de <code>credit-agricole.fr</code></li>
  <li>Vous êtes arrivé sur ce site en cliquant sur un lien dans un email suspect</li>
  <li>Le site demande votre mot de passe ou numéro de carte bancaire sans raison valable</li>
</ul>

<h2>Les arnaques les plus courantes</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Arnaque</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Comment la reconnaître</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Que faire</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Fausse alerte virus</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Popup : "Votre ordinateur est infecté ! Appelez ce numéro"</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Fermez avec Alt+F4. N''appelez jamais ce numéro.</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Faux cadeau / concours</td><td style="padding:8px 14px;border:1px solid #e5e7eb">"Vous avez gagné un iPhone ! Cliquez ici"</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Fermez la page. C''est toujours une arnaque.</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Phishing</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Email imitant votre banque ou les impôts</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Ne cliquez pas. Allez directement sur le vrai site.</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Faux support technique</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Popup demandant d''appeler "Microsoft Support"</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Microsoft ne vous appelle jamais ainsi. Fermez.</td></tr>
  </tbody>
</table>

<h2>Sites officiels en France à connaître</h2>
<ul>
  <li><strong>service-public.fr</strong> : toutes les démarches administratives</li>
  <li><strong>ameli.fr</strong> : Sécurité sociale / Assurance Maladie</li>
  <li><strong>impots.gouv.fr</strong> : déclaration d''impôts</li>
  <li><strong>caf.fr</strong> : Caisse d''Allocations Familiales</li>
  <li><strong>info-retraite.fr</strong> : informations retraite</li>
</ul>

<div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>🚨 Règle absolue :</strong> Votre banque, les impôts, la Sécu et La Poste ne vous demanderont <em>jamais</em> votre mot de passe, code PIN ou numéro complet de carte bancaire par email, SMS ou téléphone. Si quelqu''un vous le demande, c''est une arnaque.
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>🔒 <strong>HTTPS</strong> = connexion chiffrée (mais ne garantit pas que le site est honnête)</li>
  <li>Vérifiez toujours l''URL exacte avant de saisir des informations</li>
  <li>Une "offre trop belle" est toujours une arnaque</li>
  <li>En cas de doute : fermez et allez directement sur le site officiel</li>
</ul>
' WHERE title = 'Reconnaître un site fiable';

-- ============================================================
-- COURS 3 : LA MESSAGERIE ÉLECTRONIQUE
-- ============================================================

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>L''email (ou courrier électronique) est l''un des outils de communication les plus utilisés au monde. Gmail, le service de Google, est gratuit, fiable et très facile à prendre en main. Cette leçon vous explique comment créer votre compte et comprendre comment fonctionnent les emails.</p>

<h2>Anatomie d''une adresse email</h2>
<p style="text-align:center;font-size:1.1em;background:#f8fafc;padding:12px;border-radius:8px;margin:12px 0">
  <strong style="color:#4f46e5">prenom.nom</strong> <strong style="color:#64748b">@</strong> <strong style="color:#059669">gmail.com</strong>
</p>
<ul>
  <li>La partie avant <strong>@</strong> : votre identifiant (vous le choisissez lors de la création)</li>
  <li><strong>@</strong> : se lit "arobase", sépare l''identifiant du fournisseur</li>
  <li>La partie après <strong>@</strong> : le fournisseur de messagerie (Gmail, Yahoo, Orange, Laposte…)</li>
</ul>

<h2>Créer un compte Gmail étape par étape</h2>
<ol>
  <li>Ouvrez votre navigateur et allez sur <strong>gmail.com</strong></li>
  <li>Cliquez sur <strong>Créer un compte</strong> → <strong>Pour mon usage personnel</strong></li>
  <li>Saisissez votre prénom, nom et date de naissance</li>
  <li>Choisissez une adresse email disponible. Si "marie.dupont" est pris, essayez "marie.dupont75" ou "m.dupont1960"</li>
  <li>Créez un mot de passe fort (12 caractères minimum, avec majuscules, chiffres et symboles)</li>
  <li>Ajoutez un numéro de téléphone de récupération (pour retrouver votre compte si vous oubliez le mot de passe)</li>
  <li>Acceptez les conditions d''utilisation</li>
</ol>

<h2>L''interface Gmail</h2>
<ul>
  <li><strong>Boîte de réception :</strong> vos emails reçus, classés par ordre de date</li>
  <li><strong>Messages envoyés :</strong> tous les emails que vous avez envoyés</li>
  <li><strong>Brouillons :</strong> emails commencés mais pas encore envoyés</li>
  <li><strong>Spam :</strong> emails suspects filtrés automatiquement</li>
  <li><strong>Corbeille :</strong> emails supprimés (conservés 30 jours avant suppression définitive)</li>
</ul>

<h2>L''application Gmail sur smartphone</h2>
<p>Téléchargez l''application <strong>Gmail</strong> sur Android ou iPhone. Vos emails se synchronisent automatiquement. Vous recevrez des notifications dès l''arrivée d''un nouveau message.</p>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Conseil vital :</strong> Notez votre adresse email et votre mot de passe dans un <strong>carnet papier</strong> conservé en lieu sûr. L''accès à votre email est nécessaire pour récupérer l''accès à presque tous vos autres comptes en ligne.
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>Une adresse email = un identifiant + @ + fournisseur</li>
  <li>Gmail est gratuit et offre 15 Go de stockage</li>
  <li>Notez toujours vos identifiants dans un carnet papier</li>
  <li>Ajoutez un numéro de téléphone pour récupérer votre compte</li>
</ul>
' WHERE title = 'Créer et comprendre une adresse Gmail';

-- ──────────────────────────────────────────────────────────────

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>Envoyer et recevoir des emails est la compétence numérique la plus utilisée au quotidien. Cette leçon vous apprend toutes les fonctionnalités essentielles de la messagerie Gmail.</p>

<h2>Envoyer un email</h2>
<ol>
  <li>Cliquez sur le bouton <strong>Rédiger</strong> (en haut à gauche dans Gmail)</li>
  <li>Champ <strong>À :</strong> tapez l''adresse email du destinataire. Gmail propose des suggestions si vous avez déjà écrit à cette personne.</li>
  <li>Champ <strong>Objet :</strong> titre court et clair qui décrit votre email. Ex: <em>"Demande de rendez-vous — Mardi 15 mars"</em></li>
  <li>Zone de texte : rédigez votre message</li>
  <li>Cliquez sur le bouton bleu <strong>Envoyer</strong></li>
</ol>

<h2>La différence entre À, Cc et Cci</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Champ</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Signification</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Quand l''utiliser</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>À</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Destinataire principal</td><td style="padding:8px 14px;border:1px solid #e5e7eb">La personne à qui vous écrivez directement</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Cc</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Copie carbone (visible par tous)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Personnes à informer, pas les destinataires directs</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Cci</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Copie cachée (invisible par les autres)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Envois groupés discrets, ou garder quelqu''un informé discrètement</td></tr>
  </tbody>
</table>

<h2>Répondre, Répondre à tous, Transférer</h2>
<ul>
  <li><strong>Répondre :</strong> votre réponse va uniquement à l''expéditeur</li>
  <li><strong>Répondre à tous :</strong> votre réponse va à l''expéditeur ET à toutes les personnes en copie</li>
  <li><strong>Transférer :</strong> envoie cet email (et sa pièce jointe éventuelle) à une nouvelle personne</li>
</ul>

<h2>Rédiger un email professionnel</h2>
<p>Structure recommandée :</p>
<ol>
  <li><strong>Formule de politesse d''ouverture :</strong> "Madame, Monsieur," ou "Bonjour [Prénom],"</li>
  <li><strong>Corps du message :</strong> clair, court, une idée par paragraphe</li>
  <li><strong>Formule de clôture :</strong> "Cordialement," ou "Bien à vous,"</li>
  <li><strong>Signature :</strong> votre prénom, nom, téléphone si nécessaire</li>
</ol>

<h2>Créer une signature automatique</h2>
<p>Pour ne pas avoir à signer chaque email :</p>
<ol>
  <li>Dans Gmail, cliquez sur l''engrenage ⚙️ → <strong>Voir tous les paramètres</strong></li>
  <li>Section <strong>Signature</strong> → <strong>Créer</strong></li>
  <li>Rédigez votre signature (nom, téléphone, poste…)</li>
  <li>Choisissez de l''insérer automatiquement dans les nouveaux emails</li>
</ol>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Conseil pratique :</strong> Un bon objet d''email, c''est un email qui sera lu. Évitez les objets vagues comme "Question" ou "Urgent". Préférez : "Facture n°2024-156 en attente de validation".
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>L''<strong>objet</strong> est crucial : il doit résumer le contenu en une ligne</li>
  <li><strong>Cc</strong> = copie visible, <strong>Cci</strong> = copie cachée</li>
  <li><strong>Répondre à tous</strong> avec prudence : assurez-vous que tout le monde doit voir votre réponse</li>
  <li>Créez une signature automatique pour gagner du temps</li>
</ul>
' WHERE title = 'Envoyer et recevoir des emails';

-- ============================================================
-- COURS 4 : WORD
-- ============================================================

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>Microsoft Word est le logiciel de traitement de texte le plus utilisé au monde. Il permet de rédiger des lettres, CV, rapports, contrats et tout type de document texte. Cette leçon vous présente l''interface pour que vous vous sentiez à l''aise dès votre premier démarrage.</p>

<h2>Ouvrir Word et créer un document</h2>
<ol>
  <li>Menu <strong>Démarrer</strong> → tapez <em>Word</em> dans la barre de recherche → cliquez sur l''application</li>
  <li>Cliquez sur <strong>Document vide</strong> pour créer un nouveau document</li>
  <li>Ou choisissez un <strong>modèle</strong> prêt à l''emploi (lettre de motivation, CV, rapport…)</li>
</ol>

<h2>L''interface Word en détail</h2>
<ul>
  <li><strong>Le Ruban :</strong> barre d''outils principale en haut, avec plusieurs onglets (Accueil, Insertion, Mise en page, Révision…). Chaque onglet regroupe des outils liés.</li>
  <li><strong>La barre d''accès rapide :</strong> tout en haut à gauche, avec Enregistrer, Annuler, Rétablir</li>
  <li><strong>La zone de saisie :</strong> la feuille blanche au centre, là où vous tapez</li>
  <li><strong>La règle :</strong> en haut de la feuille, pour régler les marges et tabulations</li>
  <li><strong>La barre d''état :</strong> tout en bas — nombre de mots, page actuelle, niveau de zoom</li>
</ul>

<h2>Les onglets principaux du Ruban</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Onglet</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Contenu</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Accueil</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Police, taille, gras, italique, couleur, alignement, listes</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Insertion</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Images, tableaux, graphiques, en-tête, pied de page, liens</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Mise en page</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Marges, orientation (portrait/paysage), taille du papier</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Révision</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Orthographe, grammaire, commentaires, suivi des modifications</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Affichage</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Zoom, afficher la règle, mode lecture</td></tr>
  </tbody>
</table>

<h2>Enregistrer son document</h2>
<ul>
  <li><strong>Ctrl + S</strong> : enregistre le document. La première fois, Word demande le nom et l''emplacement.</li>
  <li><strong>Format .docx :</strong> le format standard Word, compatible avec toutes les versions récentes</li>
  <li><strong>Format .doc :</strong> format ancien, compatible avec les très vieilles versions de Word</li>
  <li><strong>Enregistrement automatique :</strong> si vous utilisez OneDrive, Word enregistre toutes les quelques secondes automatiquement</li>
</ul>

<h2>Ouvrir un document existant</h2>
<ul>
  <li>Dans Word : <strong>Fichier → Ouvrir</strong> → naviguez vers votre fichier</li>
  <li>Directement dans l''Explorateur Windows : double-cliquez sur un fichier .docx</li>
  <li>Documents récents : <strong>Fichier → Récents</strong> pour retrouver vos derniers fichiers ouverts</li>
</ul>

<h2>Raccourcis essentiels dans Word</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Raccourci</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Action</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + S</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Enregistrer</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + Z</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Annuler la dernière action</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + A</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Sélectionner tout le texte</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + F</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Rechercher un mot dans le document</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + H</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Remplacer un mot par un autre</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + P</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Imprimer</td></tr>
  </tbody>
</table>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Conseil :</strong> Prenez l''habitude d''appuyer sur <strong>Ctrl + S</strong> toutes les 5 à 10 minutes pendant que vous travaillez. En cas de panne de courant ou plantage, vous ne perdrez qu''un minimum de travail.
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>Le <strong>Ruban</strong> contient tous les outils, organisés par onglets</li>
  <li><strong>Ctrl + S</strong> pour enregistrer souvent</li>
  <li>Sauvegardez en <strong>.docx</strong> pour partager facilement</li>
  <li>Les <strong>modèles</strong> (templates) font gagner beaucoup de temps</li>
</ul>
' WHERE title = 'Découvrir l''interface Word';

-- ──────────────────────────────────────────────────────────────

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>La mise en forme donne à votre document un aspect professionnel et facilite sa lecture. Cette leçon couvre toutes les techniques essentielles : police, taille, couleur, alignement et les styles Word.</p>

<h2>Sélectionner le texte à mettre en forme</h2>
<p>Avant toute mise en forme, vous devez sélectionner le texte concerné :</p>
<ul>
  <li><strong>Clic + glisser :</strong> maintenez le clic gauche et balayez le texte</li>
  <li><strong>Double clic :</strong> sélectionne un mot entier</li>
  <li><strong>Triple clic :</strong> sélectionne un paragraphe entier</li>
  <li><strong>Ctrl + A :</strong> sélectionne tout le document</li>
  <li><strong>Maj + flèches :</strong> étend ou réduit la sélection au clavier</li>
</ul>

<h2>Les mises en forme de base</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Raccourci</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Résultat</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Exemple</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + G</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Gras</td><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ce texte est en gras</strong></td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + I</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Italique</td><td style="padding:8px 14px;border:1px solid #e5e7eb"><em>Ce texte est en italique</em></td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + U</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Souligné</td><td style="padding:8px 14px;border:1px solid #e5e7eb"><u>Ce texte est souligné</u></td></tr>
  </tbody>
</table>

<h2>Police et taille</h2>
<ul>
  <li><strong>Police (typographie) :</strong> le style des lettres. Calibri et Arial sont lisibles. Times New Roman est plus formel.</li>
  <li><strong>Taille recommandée :</strong> 11–12 pour le corps du texte, 14–18 pour les titres</li>
  <li>Pour changer : sélectionnez le texte → cliquez sur le menu de police ou de taille dans l''onglet Accueil</li>
</ul>

<h2>L''alignement du texte</h2>
<ul>
  <li><strong>Ctrl + Maj + G</strong> : aligné à gauche (standard pour les documents courants)</li>
  <li><strong>Ctrl + E</strong> : centré (titres, coordonnées dans une lettre)</li>
  <li><strong>Ctrl + D</strong> : aligné à droite (date dans une lettre)</li>
  <li><strong>Ctrl + J</strong> : justifié (les deux marges sont alignées — style livre ou rapport)</li>
</ul>

<h2>La couleur et la surbrillance</h2>
<ul>
  <li><strong>Couleur de police :</strong> onglet Accueil → bouton <em>A</em> avec une couleur. Sélectionnez le texte puis choisissez la couleur.</li>
  <li><strong>Surbrillance :</strong> bouton crayon fluo dans l''onglet Accueil. Utile pour mettre en évidence des passages importants.</li>
</ul>

<h2>Les styles Word : la méthode professionnelle</h2>
<p>Au lieu de tout mettre en forme manuellement, utilisez les <strong>Styles</strong> (onglet Accueil, à droite). Ils garantissent une mise en forme cohérente dans tout le document :</p>
<ul>
  <li><strong>Titre 1 :</strong> grand titre de section</li>
  <li><strong>Titre 2 :</strong> sous-titre</li>
  <li><strong>Normal :</strong> texte courant</li>
  <li><strong>Accentuation :</strong> texte mis en valeur</li>
</ul>
<p>Avantage : si vous changez le style "Titre 1", tous vos titres changent automatiquement.</p>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Conseil pro :</strong> Limitez-vous à 2 polices maximum dans un document (une pour les titres, une pour le corps). Trop de polices différentes donnent un rendu amateur.
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>Toujours <strong>sélectionner le texte avant</strong> de le mettre en forme</li>
  <li><strong>Ctrl + G</strong> (gras), <strong>Ctrl + I</strong> (italique), <strong>Ctrl + U</strong> (souligné)</li>
  <li>Utilisez les <strong>Styles</strong> pour une mise en forme cohérente et professionnelle</li>
  <li>Police 11–12 pour le texte, 14–18 pour les titres</li>
</ul>
' WHERE title = 'Mettre en forme son texte';

-- ============================================================
-- COURS 5 : EXCEL
-- ============================================================

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>Microsoft Excel est le logiciel de tableur le plus utilisé dans les entreprises et les foyers. Il permet de créer des tableaux, faire des calculs automatiques, gérer un budget et visualiser des données avec des graphiques. Ne vous laissez pas intimider : cette leçon vous explique les bases simplement.</p>

<h2>Ouvrir Excel et créer un classeur</h2>
<ol>
  <li>Menu <strong>Démarrer</strong> → tapez <em>Excel</em> → cliquez sur l''application</li>
  <li>Cliquez sur <strong>Classeur vide</strong> pour commencer</li>
  <li>Ou choisissez un modèle : budget familial, planning, inventaire…</li>
</ol>

<h2>Vocabulaire essentiel d''Excel</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Terme</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Définition</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Classeur</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Le fichier Excel (.xlsx), qui peut contenir plusieurs feuilles</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Feuille</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Un onglet (visible en bas) — un classeur peut en avoir plusieurs</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Cellule</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Une case du tableau, à l''intersection d''une colonne et d''une ligne</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Référence</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">L''adresse d''une cellule : B3 = colonne B, ligne 3</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Plage</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Un groupe de cellules : A1:A10 = de A1 à A10</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Formule</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Un calcul automatique commençant par le signe = (ex : =A1+B1)</td></tr>
  </tbody>
</table>

<h2>L''interface Excel en détail</h2>
<ul>
  <li><strong>Le Ruban :</strong> identique à Word, avec les onglets Accueil, Insertion, Mise en page…</li>
  <li><strong>La barre de formule :</strong> affiche le contenu de la cellule sélectionnée (texte, nombre ou formule)</li>
  <li><strong>Zone Nom :</strong> tout à gauche de la barre de formule — affiche la référence de la cellule active (ex: B3)</li>
  <li><strong>Les colonnes :</strong> identifiées par des lettres (A, B, C… Z, AA, AB…)</li>
  <li><strong>Les lignes :</strong> identifiées par des chiffres (1, 2, 3…)</li>
  <li><strong>Les onglets de feuilles :</strong> en bas, pour naviguer entre vos feuilles</li>
</ul>

<h2>Se déplacer dans le tableau</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Action</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Touche</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Cellule suivante à droite</td><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Tab</strong></td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Cellule suivante en bas</td><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Entrée</strong></td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Navigation libre</td><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Flèches du clavier</strong></td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Aller à la cellule A1</td><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + Début</strong></td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Aller à la dernière cellule remplie</td><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + Fin</strong></td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Atteindre une cellule précise</td><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Ctrl + G</strong> → tapez la référence (ex: D15)</td></tr>
  </tbody>
</table>

<h2>Saisir et modifier des données</h2>
<ol>
  <li>Cliquez sur une cellule pour la sélectionner</li>
  <li>Tapez votre contenu (texte, nombre, date)</li>
  <li>Appuyez sur <strong>Entrée</strong> pour valider et passer à la cellule du dessous</li>
  <li>Ou appuyez sur <strong>Tab</strong> pour passer à droite</li>
  <li>Pour modifier une cellule existante : double-cliquez dessus ou appuyez sur <strong>F2</strong></li>
  <li>Pour annuler une saisie en cours : appuyez sur <strong>Échap</strong></li>
</ol>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Conseil :</strong> Commencez toujours par créer une ligne d''<strong>en-têtes</strong> en ligne 1 (ex: Produit, Quantité, Prix unitaire, Total). Cela structure votre tableau et facilite les calculs.
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>Excel = classeur → feuilles → colonnes + lignes → cellules</li>
  <li>Chaque cellule a une adresse unique : <strong>lettre + chiffre</strong> (ex: C5)</li>
  <li><strong>Tab</strong> = cellule à droite, <strong>Entrée</strong> = cellule en dessous</li>
  <li>La barre de formule affiche le contenu exact de la cellule sélectionnée</li>
</ul>
' WHERE title = 'Découvrir l''interface Excel';

-- ──────────────────────────────────────────────────────────────

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>La formule est le cœur d''Excel. C''est elle qui transforme votre tableau en outil de calcul automatique. Une fois les formules maîtrisées, Excel recalcule tout instantanément quand vous modifiez une valeur.</p>

<h2>Le principe fondamental</h2>
<p>Toute formule Excel commence par le signe <strong>=</strong>. Excel calcule et affiche le résultat. Si vous modifiez les données sources, le résultat se met à jour automatiquement.</p>

<h2>Les opérations de base</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Opération</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Symbole</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Exemple</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Résultat</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Addition</td><td style="padding:8px 14px;border:1px solid #e5e7eb">+</td><td style="padding:8px 14px;border:1px solid #e5e7eb">=A1+B1</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Additionne A1 et B1</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Soustraction</td><td style="padding:8px 14px;border:1px solid #e5e7eb">-</td><td style="padding:8px 14px;border:1px solid #e5e7eb">=A1-B1</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Soustrait B1 de A1</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Multiplication</td><td style="padding:8px 14px;border:1px solid #e5e7eb">*</td><td style="padding:8px 14px;border:1px solid #e5e7eb">=A1*B1</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Multiplie A1 par B1</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Division</td><td style="padding:8px 14px;border:1px solid #e5e7eb">/</td><td style="padding:8px 14px;border:1px solid #e5e7eb">=A1/B1</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Divise A1 par B1</td></tr>
  </tbody>
</table>

<h2>Les fonctions essentielles</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Fonction</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Description</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Exemple</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><code>=SOMME(A1:A10)</code></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Additionne toutes les valeurs de A1 à A10</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Total d''une colonne de prix</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><code>=MOYENNE(B2:B8)</code></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Calcule la moyenne</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Note moyenne d''un élève</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><code>=MAX(C1:C5)</code></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Renvoie la valeur la plus grande</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Meilleure vente du mois</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><code>=MIN(C1:C5)</code></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Renvoie la valeur la plus petite</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Prix le plus bas</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><code>=NB(A1:A20)</code></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Compte le nombre de cellules contenant un nombre</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Combien d''articles vendus</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><code>=NBVAL(A1:A20)</code></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Compte les cellules non vides</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Combien de lignes remplies</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><code>=ARRONDI(A1;2)</code></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Arrondit à 2 décimales</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Prix avec 2 chiffres après la virgule</td></tr>
  </tbody>
</table>

<h2>Exemple pratique : budget mensuel</h2>
<pre style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;font-size:0.85em">
  A           B
1 Loyer       750
2 Électricité 85
3 Internet    35
4 Courses     320
5 TOTAL       =SOMME(B1:B4)  → affiche 1190
</pre>

<h2>Copier une formule sur toute une colonne</h2>
<ol>
  <li>Entrez votre formule dans la première cellule (ex: D2 = =B2*C2 pour calculer le total d''un article)</li>
  <li>Cliquez sur D2</li>
  <li>Positionnez la souris sur le petit carré vert en bas à droite de la cellule (le "poignée de recopie")</li>
  <li>Faites glisser vers le bas — la formule s''adapte automatiquement à chaque ligne</li>
</ol>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Bon réflexe :</strong> Utilisez toujours des références de cellules (=A1+B1) plutôt que des valeurs fixes (=100+50). Ainsi, si vous changez le prix en A1, le total se recalcule automatiquement.
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>Toute formule commence par <strong>=</strong></li>
  <li><strong>=SOMME(A1:A10)</strong> additionne une plage de cellules</li>
  <li>La poignée de recopie copie une formule sur toute une colonne</li>
  <li>Excel recalcule tout automatiquement quand vous modifiez une valeur</li>
</ul>
' WHERE title = 'Les formules essentielles';

-- ============================================================
-- COURS 7 : SÉCURITÉ
-- ============================================================

UPDATE public.lessons SET content = '
<h2>Introduction</h2>
<p>Les arnaques en ligne coûtent des milliards d''euros chaque année. Les cybercriminels deviennent de plus en plus sophistiqués, mais leurs techniques reposent souvent sur les mêmes principes. Cette leçon vous apprend à les reconnaître et à vous protéger.</p>

<h2>Le phishing (hameçonnage) : la principale menace</h2>
<p>Le phishing consiste à vous envoyer un faux email imitant une institution de confiance (banque, impôts, La Poste, Netflix…) pour vous pousser à cliquer sur un lien et voler vos informations.</p>

<h2>Comment reconnaître un email de phishing</h2>
<ul>
  <li><strong>L''adresse de l''expéditeur est bizarre :</strong> <em>impots@fiscal-service-officiel.xyz</em> au lieu de <em>@impots.gouv.fr</em></li>
  <li><strong>Urgence artificielle :</strong> "Votre compte sera suspendu dans 24h", "Action requise immédiatement"</li>
  <li><strong>Fautes d''orthographe</strong> ou formulation maladroite</li>
  <li><strong>Le lien ne correspond pas :</strong> survolez sans cliquer — l''URL affichée est différente de l''URL réelle</li>
  <li><strong>On vous demande votre mot de passe ou vos données bancaires</strong> : une vraie institution ne fait jamais ça par email</li>
</ul>

<h2>Les autres arnaques courantes</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Arnaque</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Comment elle fonctionne</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Comment se protéger</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Faux support technique</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Popup : "Appelez Microsoft au 0800..." — un "technicien" demande l''accès à votre PC</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Fermez avec Alt+F4. Microsoft ne vous contacte jamais ainsi.</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">SMS frauduleux (smishing)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">"Votre colis n''a pu être livré. Payez 1,99€ ici"</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Vérifiez directement sur le site officiel du transporteur.</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Faux vendeur en ligne</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Article très bon marché, paiement par virement</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Payez toujours par carte avec protection acheteur (PayPal, CB).</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Rançongiciel (ransomware)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Vos fichiers sont chiffrés, on réclame une rançon</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Sauvegardez régulièrement vos données. Ne téléchargez pas de fichiers suspects.</td></tr>
  </tbody>
</table>

<h2>Que faire si vous pensez avoir été victime</h2>
<ol>
  <li><strong>Changez immédiatement</strong> vos mots de passe (email, banque, réseaux sociaux)</li>
  <li><strong>Contactez votre banque</strong> si vous avez communiqué des données bancaires</li>
  <li><strong>Faites un signalement</strong> sur <em>cybermalveillance.gouv.fr</em></li>
  <li><strong>Portez plainte</strong> à la gendarmerie ou au commissariat</li>
</ol>

<h2>La double authentification (2FA)</h2>
<p>C''est la meilleure protection supplémentaire. Même si quelqu''un connaît votre mot de passe, il ne peut pas se connecter sans un code envoyé sur votre téléphone.</p>
<p>Activez-la sur : Gmail, votre banque, Facebook, Amazon. Dans les paramètres de chaque service, cherchez <em>Sécurité → Validation en deux étapes</em>.</p>

<div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>🚨 Règle absolue :</strong> Votre banque, les impôts, la Sécu ne vous demanderont JAMAIS votre mot de passe, code PIN ou numéro complet de carte par email, SMS ou téléphone. Raccrochez ou fermez immédiatement.
</div>

<h2>Ce qu''il faut retenir</h2>
<ul>
  <li>Vérifiez toujours <strong>l''adresse email</strong> de l''expéditeur avant d''agir</li>
  <li>Ne cliquez jamais sur un lien dans un email suspect → allez directement sur le site officiel</li>
  <li>Activez la <strong>double authentification</strong> sur vos comptes importants</li>
  <li>En cas de doute : <em>cybermalveillance.gouv.fr</em></li>
</ul>
' WHERE title = 'Reconnaître les arnaques en ligne';

RAISE NOTICE '✅ Migration 004 — Leçons enrichies avec succès.';
END $$;
