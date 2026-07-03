-- ============================================================
-- Migration 005 — Cours complet de dactylographie
-- 6 leçons de difficulté croissante avec exercices
-- Exécutez dans Supabase > SQL Editor
-- ============================================================

DO $$
DECLARE
  v_instructor UUID;
  c_dactylo    UUID;

  l1 UUID; l2 UUID; l3 UUID; l4 UUID; l5 UUID; l6 UUID;
  e1 UUID; e2 UUID; e3 UUID; e4 UUID; e5 UUID; e6 UUID;
BEGIN

  -- Récupérer l'instructeur (admin)
  SELECT id INTO v_instructor FROM public.profiles
  WHERE role IN ('admin', 'formateur') LIMIT 1;

  IF v_instructor IS NULL THEN
    RAISE EXCEPTION 'Aucun formateur ou admin trouvé.';
  END IF;

  -- Créer le cours
  INSERT INTO public.courses (title, description, instructor_id, published)
  VALUES (
    'Dactylographie — Maîtriser le clavier',
    'Apprenez à taper vite et sans fautes. De la position des doigts aux textes complexes, 6 niveaux progressifs pour devenir un expert du clavier.',
    v_instructor, true
  ) RETURNING id INTO c_dactylo;

  -- ============================================================
  -- LEÇON 1 — Position des mains et touches de base
  -- ============================================================
  INSERT INTO public.lessons (course_id, title, content, order_index)
  VALUES (c_dactylo, 'Position des mains et touches de base', '
<h2>Pourquoi la position compte</h2>
<p>La grande majorité des erreurs et de la lenteur vient d''une mauvaise position des mains. Bien positionner ses doigts dès le départ vous permettra de progresser deux fois plus vite.</p>

<h2>La rangée de base — votre point d''ancrage</h2>
<p>La <strong>rangée de base</strong> est la rangée du milieu du clavier. C''est là que vos doigts doivent toujours revenir après chaque touche.</p>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;text-align:center;font-family:monospace;font-size:1.1em;letter-spacing:0.15em">
  <strong>Main gauche :</strong> <span style="color:#4f46e5">A</span> &nbsp; <span style="color:#4f46e5">S</span> &nbsp; <span style="color:#4f46e5">D</span> &nbsp; <span style="color:#4f46e5">F</span> &nbsp;&nbsp;&nbsp; <strong>Main droite :</strong> <span style="color:#059669">J</span> &nbsp; <span style="color:#059669">K</span> &nbsp; <span style="color:#059669">L</span> &nbsp; <span style="color:#059669">M</span>
</div>

<h2>Placement doigt par doigt</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Doigt</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Main gauche</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Main droite</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Auriculaire</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">A</td><td style="padding:8px 14px;border:1px solid #e5e7eb">M</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Annulaire</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">S</td><td style="padding:8px 14px;border:1px solid #e5e7eb">L</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Majeur</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">D</td><td style="padding:8px 14px;border:1px solid #e5e7eb">K</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Index</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">F (repère tactile ●)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">J (repère tactile ●)</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>Pouce</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Barre espace</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Barre espace</td></tr>
  </tbody>
</table>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Les repères F et J :</strong> Regardez votre clavier. Les touches F et J ont une petite bosse (●). Ce sont vos points de référence. Vous pouvez retrouver la position correcte sans regarder le clavier.
</div>

<h2>Les règles d''or</h2>
<ul>
  <li><strong>Ne regardez pas le clavier.</strong> C''est la règle la plus importante. Au début c''est difficile, mais c''est ce qui vous permettra de progresser.</li>
  <li><strong>Gardez les poignets légèrement surélevés</strong>, ne les posez pas sur le bureau.</li>
  <li><strong>Revenez toujours</strong> sur la rangée de base entre les mots.</li>
  <li><strong>Frappez les touches légèrement</strong> — pas besoin d''appuyer fort.</li>
  <li><strong>Le pouce droit ou gauche</strong> appuie sur la barre espace.</li>
</ul>

<h2>L''exercice de cette leçon</h2>
<p>Vous allez taper des <strong>mots ultra-simples</strong> (2 à 3 lettres) sans vous presser. L''objectif est de <strong>taper sans regarder le clavier</strong> et de retrouver instinctivement les touches.</p>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Objectif :</strong> Précision avant vitesse. Peu importe si vous tapez lentement, ne regardez pas vos doigts.
</div>
', 1) RETURNING id INTO l1;

  -- ============================================================
  -- LEÇON 2 — Mots courts et rythme régulier
  -- ============================================================
  INSERT INTO public.lessons (course_id, title, content, order_index)
  VALUES (c_dactylo, 'Mots courts et rythme régulier', '
<h2>L''importance du rythme</h2>
<p>Un dactylographe rapide ne tape pas vite par à-coups — il maintient un <strong>rythme régulier et constant</strong>. Imaginez un métronome : chaque touche doit tomber à intervalle égal.</p>

<h2>Technique : lire en avance</h2>
<p>La clé de la vitesse n''est pas la rapidité des doigts mais la <strong>lecture anticipée</strong> : vos yeux lisent le prochain mot pendant que vos doigts tapent le mot actuel.</p>
<ul>
  <li>Niveau débutant : lire lettre par lettre</li>
  <li>Niveau intermédiaire : lire mot par mot</li>
  <li>Niveau expert : lire 2 à 3 mots en avance</li>
</ul>

<h2>Comment progresser rapidement</h2>
<ol>
  <li><strong>Commencez lentement</strong> (même 10 mots/min). La précision crée la vitesse, pas l''inverse.</li>
  <li><strong>Corrigez vos erreurs fréquentes</strong> : si vous ratez toujours le "p", entraînez-vous spécifiquement dessus.</li>
  <li><strong>Ne regardez jamais le clavier</strong> pendant l''exercice.</li>
  <li><strong>Faites des pauses</strong> : 15 minutes de pratique concentrée valent mieux qu''1 heure distraite.</li>
</ol>

<h2>Les mots les plus fréquents du français</h2>
<p>Maîtriser les 100 mots les plus utilisés couvre 50 % de tout texte courant. En voici quelques-uns :</p>
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin:12px 0;font-family:monospace;font-size:0.9em;line-height:2">
  le · la · les · de · du · un · une · et · en · est · que · qui · par · pour · dans · sur · avec · je · tu · il · nous · vous · ils · ce · se · sa · son · au · aux · ou
</div>

<h2>L''exercice de cette leçon</h2>
<p>Des <strong>mots de 4 à 6 lettres</strong> très courants. Concentrez-vous sur la régularité du rythme. Tapez à une vitesse où vous ne faites quasiment aucune erreur.</p>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Astuce :</strong> Si vous faites plus de 1 erreur tous les 10 caractères, ralentissez. La précision d''abord.
</div>
', 2) RETURNING id INTO l2;

  -- ============================================================
  -- LEÇON 3 — Phrases simples et ponctuation de base
  -- ============================================================
  INSERT INTO public.lessons (course_id, title, content, order_index)
  VALUES (c_dactylo, 'Phrases simples et ponctuation de base', '
<h2>Passer aux phrases</h2>
<p>Taper des mots isolés est plus simple que des phrases, car les phrases exigent de gérer la <strong>ponctuation</strong>, les <strong>majuscules</strong> et les <strong>espaces après la ponctuation</strong>.</p>

<h2>Règles typographiques à connaître</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Signe</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Espace avant</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Espace après</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Exemple</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Point (.)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Non</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Oui</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Bonjour. Comment</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Virgule (,)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Non</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Oui</td><td style="padding:8px 14px;border:1px solid #e5e7eb">chat, chien</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Point d''exclamation (!)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Non*</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Oui</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Bravo ! Super</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Point d''interrogation (?)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Non*</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Oui</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Ça va ? Oui</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Apostrophe ('')</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Non</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Non</td><td style="padding:8px 14px;border:1px solid #e5e7eb">l''école</td></tr>
  </tbody>
</table>
<p style="font-size:0.85em;color:#6b7280">* En français typographique strict, une espace fine précède ! et ?. Dans la pratique numérique courante, on n''en met pas.</p>

<h2>Taper les majuscules</h2>
<ul>
  <li>Maintenez <strong>Maj (Shift)</strong> avec le doigt opposé à la lettre à majusculer.</li>
  <li>Ex : "B" → doigt droit sur B, auriculaire gauche sur Maj.</li>
  <li>Ne bloquez pas Verr. Maj pour une seule lettre.</li>
</ul>

<h2>L''exercice de cette leçon</h2>
<p>Vous tapez des <strong>phrases courtes et simples</strong> avec points et virgules. Gérez les majuscules de début de phrase. L''objectif est la fluidité — ne bloquez pas sur la ponctuation.</p>

<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>⚠️ Attention :</strong> Après un point, rappelez-vous d''appuyer sur la barre espace avant de commencer la phrase suivante et de mettre une majuscule.
</div>
', 3) RETURNING id INTO l3;

  -- ============================================================
  -- LEÇON 4 — Accents et caractères spéciaux
  -- ============================================================
  INSERT INTO public.lessons (course_id, title, content, order_index)
  VALUES (c_dactylo, 'Accents et caractères spéciaux', '
<h2>Les accents : l''obstacle du clavier français</h2>
<p>Le français est une langue riche en accents. Bien les maîtriser est indispensable pour taper des textes corrects et professionnels. Voici tous les accents que vous devez connaître.</p>

<h2>Les accents sur clavier AZERTY (France)</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Caractère</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Comment le taper</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Exemples de mots</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>é</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Touche directe é (à droite de 3)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">été, écrire, café, prénom</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>è</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Touche directe è (à droite de ù)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">après, fève, père, mère</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>ê</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">^ puis e</td><td style="padding:8px 14px;border:1px solid #e5e7eb">être, forêt, fête, tête</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>à</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Touche directe à (à droite de 0)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">à, là, voilà, déjà</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>ù</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Touche directe ù</td><td style="padding:8px 14px;border:1px solid #e5e7eb">où</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>ç</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">Touche directe ç</td><td style="padding:8px 14px;border:1px solid #e5e7eb">ça, garçon, leçon, façon</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>ô û î â</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">^ puis la voyelle</td><td style="padding:8px 14px;border:1px solid #e5e7eb">rôle, sûr, île, âme</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>ï ë</strong></td><td style="padding:8px 14px;border:1px solid #e5e7eb">¨ puis la voyelle</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Noël, naïf</td></tr>
  </tbody>
</table>

<h2>Symboles fréquents</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Symbole</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Touche(s)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>@</strong> (arobase)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">AltGr + 0</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>€</strong> (euro)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">AltGr + E</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb"><strong>&</strong> (et commercial)</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Maj + 1</td></tr>
  </tbody>
</table>

<h2>L''exercice de cette leçon</h2>
<p>Un texte avec de nombreux accents et caractères accentués. Prenez le temps de bien les taper. C''est souvent là où les débutants hésitent le plus.</p>

<div style="background:#eff6ff;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>💡 Conseil :</strong> Si vous hésitez sur un accent, mémorisez sa position plutôt que de chercher. Répétez l''exercice plusieurs fois jusqu''à ce que les touches des accents deviennent automatiques.
</div>
', 4) RETURNING id INTO l4;

  -- ============================================================
  -- LEÇON 5 — Texte continu et vitesse
  -- ============================================================
  INSERT INTO public.lessons (course_id, title, content, order_index)
  VALUES (c_dactylo, 'Texte continu et montée en vitesse', '
<h2>De la précision à la vitesse</h2>
<p>Si vous avez bien travaillé les leçons précédentes, votre précision est bonne. Il est maintenant temps de <strong>travailler la vitesse</strong> tout en maintenant cette précision.</p>

<h2>Comment augmenter sa vitesse naturellement</h2>
<ol>
  <li><strong>Mémoire musculaire :</strong> Plus vous tapez les mêmes combinaisons de lettres, plus vos doigts les mémorisent et les tapent automatiquement. Répétez les exercices.</li>
  <li><strong>Chunks (groupes) :</strong> Au lieu de taper lettre par lettre, votre cerveau commence à "voir" des groupes de lettres (préfixes, suffixes, mots courants). Cela accélère naturellement.</li>
  <li><strong>Réduire les hésitations :</strong> Chaque hésitation casse le rythme. Entraînez-vous jusqu''à ce que vous n''hésitiez plus.</li>
</ol>

<h2>Les vrais WPM des professionnels</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Niveau</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">WPM</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Profil</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">🐢 Débutant</td><td style="padding:8px 14px;border:1px solid #e5e7eb">&lt; 15 WPM</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Chasse aux touches, regard clavier</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">🚶 Intermédiaire</td><td style="padding:8px 14px;border:1px solid #e5e7eb">15–29 WPM</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Utilisateur régulier d''ordinateur</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">🚴 Avancé</td><td style="padding:8px 14px;border:1px solid #e5e7eb">30–49 WPM</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Professionnel de bureau</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">🚀 Expert</td><td style="padding:8px 14px;border:1px solid #e5e7eb">50+ WPM</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Secrétaire, développeur, journaliste</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">🏆 Champion</td><td style="padding:8px 14px;border:1px solid #e5e7eb">100+ WPM</td><td style="padding:8px 14px;border:1px solid #e5e7eb">Compétiteur, record mondial : 212 WPM</td></tr>
  </tbody>
</table>

<h2>L''exercice de cette leçon</h2>
<p>Un <strong>paragraphe complet</strong> sur un sujet du quotidien numérique. Accents, ponctuation, majuscules : tout y est. Poussez votre vitesse tout en maintenant 90 % de précision minimum.</p>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Défi :</strong> Essayez de battre votre score à chaque tentative. Regardez votre WPM progresser en temps réel grâce à la barre de progression.
</div>
', 5) RETURNING id INTO l5;

  -- ============================================================
  -- LEÇON 6 — Texte expert : chiffres, symboles, majuscules
  -- ============================================================
  INSERT INTO public.lessons (course_id, title, content, order_index)
  VALUES (c_dactylo, 'Niveau expert — Chiffres, symboles et textes complexes', '
<h2>Le défi du niveau expert</h2>
<p>Les textes professionnels ne contiennent pas que des lettres. Adresses, numéros de téléphone, adresses email, codes, chiffres financiers — tout cela doit être tapé vite et sans erreur.</p>

<h2>Taper les chiffres efficacement</h2>
<p>Sur un clavier AZERTY, les chiffres sont en haut à gauche et nécessitent <strong>Maj</strong> pour être tapés (sinon ce sont les symboles). En pratique : si vous avez beaucoup de chiffres, utilisez le <strong>pavé numérique</strong> (à droite du clavier si présent).</p>
<ul>
  <li>Chiffres en rangée haute : nécessitent de tendre les doigts — revenez vite sur la rangée de base.</li>
  <li>Pavé numérique : placez l''index sur 4, majeur sur 5 (repère tactile ●), annulaire sur 6.</li>
</ul>

<h2>Cas pratiques fréquents</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Type de contenu</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Difficulté</th>
      <th style="padding:8px 14px;text-align:left;border:1px solid #e5e7eb">Exemple</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Adresse email</td><td style="padding:8px 14px;border:1px solid #e5e7eb">★★★</td><td style="padding:8px 14px;border:1px solid #e5e7eb">marie.dupont@gmail.com</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Numéro de téléphone</td><td style="padding:8px 14px;border:1px solid #e5e7eb">★★</td><td style="padding:8px 14px;border:1px solid #e5e7eb">06 12 34 56 78</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Adresse postale</td><td style="padding:8px 14px;border:1px solid #e5e7eb">★★★</td><td style="padding:8px 14px;border:1px solid #e5e7eb">12, rue des Fleurs – 75001 Paris</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">Montant financier</td><td style="padding:8px 14px;border:1px solid #e5e7eb">★★</td><td style="padding:8px 14px;border:1px solid #e5e7eb">1 250,50 €</td></tr>
    <tr><td style="padding:8px 14px;border:1px solid #e5e7eb">URL web</td><td style="padding:8px 14px;border:1px solid #e5e7eb">★★★★</td><td style="padding:8px 14px;border:1px solid #e5e7eb">https://www.service-public.fr</td></tr>
  </tbody>
</table>

<h2>L''exercice final</h2>
<p>Un texte professionnel complet avec chiffres, ponctuation variée, accents et majuscules. C''est le niveau d''un texte que vous pourriez trouver dans un email professionnel ou un document administratif.</p>

<div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>🏆 Défi expert :</strong> Atteignez 30 WPM avec 90 % de précision sur ce texte pour vous qualifier niveau Avancé. Dépassez 50 WPM pour rejoindre l''élite Expert !
</div>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:8px;margin:16px 0">
  <strong>✅ Félicitations !</strong> Si vous avez suivi tous les niveaux de ce cours, vous avez acquis les bases solides de la dactylographie. Continuez à pratiquer 10 minutes par jour et vous progresserez encore pendant des semaines.
</div>
', 6) RETURNING id INTO l6;

  -- ============================================================
  -- EXERCICES — 1 par leçon, difficulté croissante
  -- ============================================================

  -- Exercice 1 : Lettres et mots ultra-simples (rangée de base)
  INSERT INTO public.exercises (lesson_id, title, duration_seconds)
  VALUES (l1, 'Niveau 1 — Touches de base', 45)
  RETURNING id INTO e1;

  INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, order_index)
  VALUES (e1,
    'Tapez le texte suivant sans regarder le clavier. Concentrez-vous sur la position de vos doigts :',
    'dactylographie', NULL,
    'la de le sa ma il et un tu je du va au où ni si on me te se',
    1);

  -- Exercice 2 : Mots courants 4-6 lettres
  INSERT INTO public.exercises (lesson_id, title, duration_seconds)
  VALUES (l2, 'Niveau 2 — Mots courants', 60)
  RETURNING id INTO e2;

  INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, order_index)
  VALUES (e2,
    'Tapez ces mots courants en maintenant un rythme régulier :',
    'dactylographie', NULL,
    'chat chien maison jardin soleil nuage rivière montagne forêt chemin oiseau fleur herbe porte table chaise livre',
    1);

  -- Exercice 3 : Phrases simples avec ponctuation
  INSERT INTO public.exercises (lesson_id, title, duration_seconds)
  VALUES (l3, 'Niveau 3 — Phrases simples', 75)
  RETURNING id INTO e3;

  INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, order_index)
  VALUES (e3,
    'Tapez ces phrases en faisant attention aux majuscules et à la ponctuation :',
    'dactylographie', NULL,
    'Le chat dort sur le lit. Le chien joue dans le jardin. Il fait beau ce matin. Marie lit un livre. Paul mange une pomme.',
    1);

  -- Exercice 4 : Texte avec accents
  INSERT INTO public.exercises (lesson_id, title, duration_seconds)
  VALUES (l4, 'Niveau 4 — Accents et caractères', 90)
  RETURNING id INTO e4;

  INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, order_index)
  VALUES (e4,
    'Tapez ce texte avec tous ses accents et caractères spéciaux :',
    'dactylographie', NULL,
    'Bonjour ! Je m''appelle Marie Dupont. J''habite à Lyon, près de la forêt. J''aime lire des livres, écouter de la musique et me promener. Ça va très bien, merci !',
    1);

  -- Exercice 5 : Paragraphe continu
  INSERT INTO public.exercises (lesson_id, title, duration_seconds)
  VALUES (l5, 'Niveau 5 — Texte continu', 105)
  RETURNING id INTO e5;

  INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, order_index)
  VALUES (e5,
    'Tapez ce paragraphe complet en cherchant à maintenir un rythme fluide et régulier :',
    'dactylographie', NULL,
    'L''informatique est devenue une compétence essentielle dans notre vie quotidienne. Savoir utiliser un ordinateur, naviguer sur Internet et rédiger des emails sont des aptitudes indispensables. La pratique régulière de la dactylographie vous permettra de travailler plus efficacement chaque jour.',
    1);

  -- Exercice 6 : Texte expert avec chiffres et symboles
  INSERT INTO public.exercises (lesson_id, title, duration_seconds)
  VALUES (l6, 'Niveau 6 — Texte expert', 120)
  RETURNING id INTO e6;

  INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, order_index)
  VALUES (e6,
    'Défi final : tapez ce texte professionnel avec chiffres, accents et ponctuation variée :',
    'dactylographie', NULL,
    'Madame, Monsieur, Suite à notre entretien du 15 mars 2024, je vous transmets mon dossier complet. Mon adresse : 12, rue des Lilas, 69003 Lyon. Tel : 06 12 34 56 78. Email : marie.dupont@gmail.com. Cordialement, Marie Dupont.',
    1);

  RAISE NOTICE '✅ Cours de dactylographie créé avec 6 leçons et 6 exercices progressifs.';
END $$;
