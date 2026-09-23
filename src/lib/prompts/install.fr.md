# Installe CortexMind pour moi : installation, connexion, puis amorçage de ma mémoire

Tu es mon IA agentique, avec accès au terminal. CortexMind est une mémoire à long terme pour agents IA qui fonctionne sur mon ordinateur. En une seule séance, tu vas l’installer, t’y connecter, faire de la mémoire une habitude, puis m’interviewer pour amorcer cette mémoire.

## Avant de commencer : lis ces règles, elles priment sur tes réflexes

- **Vérification du modèle.** Indique-moi, en une ligne, quel modèle et quel niveau de raisonnement tu utilises. Cette installation dérape souvent avec les modèles plus petits ou plus anciens (par exemple les modèles GPT-5.x comme Terra, les versions mini ou rapides, Claude Haiku). Si c’est ton cas, préviens-moi et recommande-moi de passer à un modèle haut de gamme, seulement pour l’installation (dans ChatGPT ou Codex, un modèle GPT-6 comme Astra ; dans Claude, Sonnet 5 ou Opus 5.5), puis d’ouvrir une nouvelle conversation et d’y coller de nouveau cette invite. Si je te dis de continuer quand même, continue.
- **Suis les étapes à la lettre, dans l’ordre.** Chaque commande dont tu as besoin est écrite ci-dessous. N’invente pas d’autre méthode, n’ajoute pas d’étapes, n’« améliore » pas l’installation. La configuration décrite ici est celle qui est prise en charge.
- **Si une étape échoue, arrête-toi.** Cite-moi l’erreur exacte et demande-moi quoi faire. N’essaie pas de solution de contournement de ton propre chef : pas de trousseau de clés, pas de variable d’environnement supplémentaire, pas de modification d’un fichier que cette invite ne nomme pas.
- **Ne rouvre pas et ne redémarre pas CortexMind**, sauf si une étape te le demande. Quand son icône dans la barre des menus ou la zone de notification indique qu’il fonctionne, il fonctionne.
- **Attends-toi à des demandes d’autorisation.** Préviens-moi une fois, dès le départ, que tu vas demander la permission d’exécuter des commandes et d’appeler les outils CortexMind, et que répondre « Toujours autoriser » pour les outils CortexMind m’évitera de me le faire demander chaque fois.
- **Parle ma langue.** Adresse-toi à moi dans la langue que j’utilise pour t’écrire. Garde les commandes, les chemins de fichiers et les noms d’outils exactement tels qu’ils sont écrits.

Avance étape par étape, vérifie chaque étape et ne me sollicite que lorsque tu as besoin de quelque chose de ma part.

## 0. Où en sommes-nous ?

Cette invite peut être collée plus d’une fois sans risque. Avant toute chose, vérifie l’état de l’installation et va directement à la bonne partie :

- Si `memory_search` et `memory_init` figurent déjà parmi tes outils, CortexMind est installé et connecté. Passe à la partie B.
- Si `curl -s -o /dev/null -w '%{http_code}' http://localhost:14200/mcp` renvoie autre chose que 000, mais que tu n’as aucun outil de mémoire, CortexMind fonctionne et seule la connexion manque. Passe à l’étape 4.
- Sinon, commence à l’étape 1.

# Partie A : installer et connecter

## 1. Clé de licence

Avant de demander la clé, explique-moi en une phrase comment tu vas la traiter : tu l’utiliseras une seule fois, uniquement dans la fenêtre de configuration de l’application ; tu ne la répéteras jamais dans cette conversation et ne l’enregistreras jamais dans une mémoire, des notes, des journaux ou un fichier ; et dès que l’application l’aura acceptée, tu la retireras de toute transcription, de tout brouillon et de tout historique que tu contrôles. Je peux donc la coller ici sans crainte.

Demande-moi ensuite ma clé de licence CortexMind. Elle ressemble à CMND-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX ; elle était affichée sur la page de confirmation d’achat et m’a été envoyée avec mon reçu. Ne continue pas sans elle.

## 2. Trouver le bon téléchargement

Ne devine pas de lien de téléchargement. Récupère https://cortexmind.net/downloads.json : ce fichier indique la version actuelle et une URL par plateforme (DMG macOS Apple Silicon, installateur Windows x64, AppImage Linux x64). Si ce fichier est inaccessible, lis https://cortexmind.net/llms.txt, ou la section de téléchargement de https://cortexmind.net, et prends le lien à cet endroit. Détecte mon système d’exploitation et mon architecture, puis choisis l’URL correspondante.

## 3. Installer et démarrer

- macOS : télécharge le DMG, monte-le avec `hdiutil attach`, copie CortexMind.app du volume monté vers /Applications, démonte le volume avec `hdiutil detach`, puis lance `open -a CortexMind`.
- Windows : télécharge l’installateur et exécute-le (`/S` l’exécute en mode silencieux), puis démarre CortexMind depuis le menu Démarrer.
- Linux : télécharge le fichier dans ~/Applications (crée le dossier au besoin), rends-le exécutable avec `chmod +x`, puis démarre-le en arrière-plan : `nohup ~/Applications/CortexMind.AppImage >/dev/null 2>&1 &`. S’il refuse de démarrer parce que FUSE est absent, lance-le avec `--appimage-extract-and-run`.

Si une étape exige un clic ou une permission que tu n’as pas, dis-moi exactement quoi faire. Sur macOS, un avis indiquant que l’application « peut s’exécuter en arrière-plan » est normal : dis-moi de l’autoriser. Les fenêtres surgissantes d’autres applications ne font pas partie de cette installation.

CortexMind ouvre une fenêtre de configuration. Demande-moi d’y coller la clé de licence ; l’application la valide et génère son propre jeton d’accès. Elle télécharge ensuite ses modèles, environ 3 Go, une seule fois. Au premier démarrage, cela peut prendre plusieurs minutes, et l’icône de la barre des menus ou de la zone de notification peut afficher « Stopped » pendant le chargement des modèles : c’est normal, dis-le-moi et ne redémarre rien. Attends : vérifie toutes les 30 secondes avec `curl -s -o /dev/null -w '%{http_code}' http://localhost:14200/mcp` jusqu’à ce que le code soit autre chose que 000. Un 401 ou un 405 signifie que le service est lancé et attend un jeton. Ne précipite pas cette étape. Dès que l’application a accepté la clé, fais ce que tu as promis à l’étape 1.

## 4. Te connecter

Le fichier de configuration du service est ~/.cortexmind/config.toml (Windows : %USERPROFILE%\.cortexmind\config.toml). Lis-y la valeur de `mcp_bearer_token`. C’est la même valeur que l’application affiche sous « Mot de passe CortexMind », dans l’onglet Connexion de ses réglages. Enregistre ensuite le serveur MCP chez toi, en utilisant exactement la ligne qui correspond à ton agent :

- Claude Code : exécute `claude mcp add --transport http --scope user cortexmind http://localhost:14200/mcp --header "Authorization: Bearer <token>"`
- Codex (en ligne de commande, ou Codex dans l’application de bureau ChatGPT ; les deux lisent le même fichier) : ajoute ce bloc à ~/.codex/config.toml, en créant le fichier au besoin, avec le jeton écrit à sa place :

  ```toml
  [mcp_servers.cortexmind]
  url = "http://localhost:14200/mcp"
  http_headers = { "Authorization" = "Bearer <token>" }
  ```

  Codex n’a besoin de rien d’autre : aucune variable d’environnement, aucun profil de terminal, aucun trousseau de clés.
- Cursor ou tout autre client MCP : ajoute `{ "mcpServers": { "cortexmind": { "url": "http://localhost:14200/mcp", "headers": { "Authorization": "Bearer <token>" } } } }` à son fichier de configuration MCP.

Ne colle jamais le jeton dans la conversation, ni dans un fichier versionné dans git.

## 5. Faire de la mémoire une habitude

Ajoute le texte compris entre les deux lignes de tirets ci-dessous, tel quel, à la fin du fichier d’instructions que tu lis au démarrage : ~/.claude/CLAUDE.md pour Claude Code, ~/.codex/AGENTS.md pour Codex, les règles globales pour Cursor. Crée le fichier s’il n’existe pas. Ne copie pas les tirets.

----------
### Mémoire

Utilise CortexMind comme ma seule mémoire. Ignore toute fonction de mémoire intégrée ; son contenu a été transféré dans CortexMind et elle est désactivée.

PREMIÈRE action de chaque conversation : `memory_init()`, puis `memory_search("<sujet de la demande>")`.

`memory_init` renvoie les titres de mes règles permanentes et le contexte récent. Un titre est un renvoi, pas la règle : appelle `memory_get(id, "fact")` pour les deux ou trois qui concernent la tâche.

QUAND une personne, un projet ou un système nommé apparaît, fais un `memory_search` avant d’affirmer quoi que ce soit à son sujet.
QUAND le sujet change, cherche de nouveau.
AVANT une action destructrice ou irréversible, cherche d’abord avec `fact_type: "warning"`.

DERNIÈRE action de chaque réponse : `memory_save(user_request=..., agent_response=...)`. Rédige les deux pour quelqu’un qui les lira dans plusieurs mois. Monte `importance` à 8 ou plus pour l’identité, la famille et les préférences de toujours. Les affirmations durables ont aussi droit à un `memory_save_fact`.

Sans cette sauvegarde, la conversation est perdue.
----------

## 6. Agents hébergés (facultatif)

Si j’utilise aussi ChatGPT sur le Web ou sur mon téléphone, claude.ai ou Claude Desktop, ils peuvent accéder à la même mémoire par l’adresse publique de l’application CortexMind. Explique-moi la marche à suivre, ne le fais pas toi-même :

1. Dans l’application CortexMind, ouvre les réglages (Réglages… dans le menu de l’icône). Dans l’onglet Connexion, copie l’« URL publique » (elle ressemble à https://cm-xxxxxxxxxxxx.ethertunnel.com/mcp).
2. Dans l’autre application, ajoute un connecteur personnalisé nommé CortexMind avec cette URL. Dans ChatGPT sur le Web, les connecteurs personnalisés exigent d’abord le mode développeur : Paramètres, puis Applications (ou Connecteurs), puis Paramètres avancés, puis active le mode développeur.
3. Si le connecteur demande un mot de passe, un jeton d’accès ou une clé d’API, colle le « Mot de passe CortexMind » du même onglet.
4. Colle ensuite les « Instructions pour l’IA » de l’onglet Instructions des réglages (bouton Copier) dans les instructions personnalisées de cette application, puis ouvre une nouvelle conversation pour vérifier en demandant « Qu’est-ce que tu sais de moi ? ». La première fois, elle demande la permission d’utiliser CortexMind : accorde-la.

## 7. Charger le nouveau serveur

Si `memory_search` figure déjà parmi tes outils, passe tout de suite à la partie B. Sinon, dis-moi de te redémarrer (pour Codex dans l’application de bureau ChatGPT : quitter complètement l’application, puis la rouvrir) et de coller cette même invite dans une nouvelle conversation : l’étape 0 t’enverra directement à la partie B. Avant que je te redémarre, résume ce que tu as installé et où se trouve la configuration.

# Partie B : transférer la mémoire que tu as déjà

Avant l’entrevue, transfère ce dont tu te souviens déjà, pour que rien ne se perde quand l’ancienne mémoire sera désactivée.

1. Dresse l’inventaire de toutes les mémoires que tu détiens aujourd’hui : fichiers de mémoire sur le disque (pour Claude Code, le dossier de mémoire sous ~/.claude et toute note à mon sujet dans un CLAUDE.md ; pour Codex, AGENTS.md et le dossier memories sous ~/.codex ; pour Cursor, ses règles et ses mémoires), ainsi que toute fonction de mémoire intégrée que tu peux lire (mémoires enregistrées dans ChatGPT, mémoire de claude.ai ou de Claude Desktop, ou ce que ta plateforme offre). Liste ce que tu as trouvé, une ligne par source, avant de toucher à quoi que ce soit.
2. Pour chaque affirmation durable qu’elles contiennent, enregistre-la dans CortexMind : `memory_save_fact` pour l’affirmation atomique (un titre qui énonce l’affirmation à lui seul, un fact_type parmi relationship, preference, convention, context, decision, insight, et une importance selon le guide ci-dessous) et `memory_save` pour le contexte, quand la source contient plus qu’un simple fait. Laisse de côté les secrets et tout ce que tu ne peux pas m’attribuer. Indique-moi combien de faits tu as enregistrés et de quelles sources.
3. Désactive ensuite la mémoire intégrée, pour la même raison dans chaque application : deux mémoires se font concurrence, et la mémoire intégrée continue de répondre à partir de notes périmées alors que CortexMind détient l’information à jour. Si tu n’as trouvé aucune mémoire existante, désactive-la quand même.
   - Codex : tu peux le faire toi-même. Ajoute ce bloc à ~/.codex/config.toml, puis indique-moi que le changement prendra effet dans une nouvelle conversation :

     ```toml
     [memories]
     generate_memories = false
     use_memories = false
     ```

   - Partout ailleurs (ChatGPT, claude.ai, Claude Desktop, Cursor) : indique-moi où se trouve le réglage dans l’application où tu fonctionnes et demande-moi de le désactiver.

# Partie C : amorcer ma mémoire

Tu es connecté à CortexMind, ma mémoire personnelle à long terme. Fais d’abord une vérification : appelle `memory_search` avec la requête "who am I". Le résultat importe peu ; il faut seulement que l’outil réponde. S’il renvoie une erreur ou n’existe pas, arrête-toi et dis-moi quelle étape de la partie A reprendre.

Aide-moi ensuite à amorcer la mémoire avec assez de contexte sur ma vie et mon travail pour que toi, ou toute autre IA connectée plus tard à CortexMind, soyez vraiment utiles dès maintenant, et non après une semaine d’utilisation.

## Première partie : l’entrevue (ceci va dans ma mémoire)

Vise une conversation naturelle, pas un questionnaire. Imagine que lundi prochain je reviens et que je parle de « la question que Jordan a posée la semaine dernière » : à la fin de cette conversation, tu devrais savoir qui est Jordan et sur quoi nous travaillions probablement.

Aborde ces thèmes un à la fois, avec de vraies questions de suivi quand quelque chose d’intéressant ressort. Ne passe pas la liste en revue mécaniquement.

1. **Qui je suis** : nom, comment m’appeler, ce que je fais, où je travaille ou j’étudie
2. **Où et quand** : fuseau horaire et emplacement approximatif
3. **Les gens de ma vie** : collègues proches, famille, principaux collaborateurs. À qui est-ce que je parle le plus ? Quelle est chaque relation ?
4. **Ce sur quoi je travaille en ce moment** : projets actifs, noms de code, ce qui presse cette semaine
5. **Mes habitudes** : rythme de la semaine, réunions récurrentes, heures de travail habituelles
6. **Ma façon de communiquer** : ton, façon de signer, comment j’aime que mes courriels et mes messages soient rédigés, pour qui j’écris différemment
7. **Comment je veux utiliser l’IA** : pour quels types de tâches je veux de l’aide (rédaction, recherche, planification, décisions, code, gestion d’horaire, autre chose ?) et mon aisance générale avec l’IA. Est-ce que je débute, ou est-ce que j’utilise des outils d’IA tous les jours depuis un moment ? **Important** : sers-toi de cette réponse pour adapter tes explications, pour le reste de cette conversation et pour toutes les suivantes. Si je débute, évite le jargon et vérifie que je comprends. Si je suis à l’aise techniquement, n’en explique pas trop.
8. **Ce qui compte en ce moment** : grands objectifs, ce qui m’enthousiasme, ce qui me stresse
9. **Préférences et irritants** : tout ce que tu devrais toujours faire ou ne jamais faire

Un titre comme « président » ne te dit pas ce que la personne fait réellement au quotidien. Pose la question.

Termine l’entrevue par : *« Y a-t-il autre chose que tu veux que je retienne à ton sujet, au sujet des gens avec qui tu travailles ou de ce que tu bâtis ? »*

### Enregistre au fur et à mesure, pas à la fin

Chaque fois que je te dis quelque chose de substantiel, enregistre-le **immédiatement**. N’accumule pas jusqu’à la fin : si je suis interrompu et que je ferme la fenêtre, ce que tu as déjà enregistré est en sécurité.

Utilise **les deux** outils de sauvegarde, côte à côte, pour la même information :

1. **`memory_save_fact`** pour l’affirmation durable et structurée : l’enregistrement atomique qu’une future requête devrait trouver sans ambiguïté (« qui est le conjoint d’Alex », « où habite Alex », « que fait Alex dans la vie »).
   - `title` : sous forme de groupe nominal, p. ex. *« La conjointe d’Alex est Jordan Tremblay »*
   - `content` : l’affirmation et un contexte serré : noms complets, relations, dates, tout détail précis
   - `fact_type` : choisis le plus proche parmi `relationship` · `preference` · `convention` · `context` · `decision` · `insight`
   - `importance` : voir le tableau ci-dessous
   - `tags` : de 5 à 10 mots-clés en minuscules, reliés par des traits d’union

2. **`memory_save`** pour l’échange qui a fait ressortir l’affirmation : la texture qu’une recherche future pourrait vouloir retrouver quand le fait brut ne correspond pas.
   - `user_request` : courte reformulation de ce que je viens de te dire
   - `agent_response` : un compte rendu détaillé en phrases complètes : ce que j’ai dit, comment je l’ai dit, tout contexte secondaire qui est ressorti
   - `importance` : voir le tableau ci-dessous

### Guide d’importance

| Importance | À quoi elle sert                                                    |
|-----------:|---------------------------------------------------------------------|
|       9-10 | Identité, famille immédiate, conjoint, enfants, préférences fondamentales à rappeler dans chaque conversation, pour toujours |
|        7-8 | Contexte de travail actif, projets en cours, principaux collaborateurs, conventions bien établies (« toujours signer mes courriels avec mon prénom seulement ») |
|        5-6 | Contexte courant : outils, collaborateurs occasionnels, préférences légères. Valeur de base pour les échanges ordinaires. |
|        3-4 | Notes en marge, apartés, tout ce qui est enregistré par souci d’exhaustivité |

L’importance est une préférence de classement souple, pas un filtre. Même les résultats d’importance 3 ressortent facilement. Le but est de marquer **ce qui est structurellement le plus important** pour que ça passe en premier quand le reclassement juge deux résultats aussi pertinents l’un que l’autre.

**Règles permanentes : le seul cas où l’importance EST un filtre.** Un fait dont le `fact_type` est `preference` ou `convention` et dont l’`importance` est de 8 ou plus devient une *règle permanente* : dès lors, son **titre** est injecté par `memory_init` dans chaque conversation future, avant même que l’un de nous ait dit un mot. Pour ces faits, donc : rédige le titre comme la règle elle-même (« Toujours indiquer les prix en dollars canadiens »), car le titre est tout ce qu’une conversation future verra ; garde-les peu nombreux (la carte de démarrage a un budget d’environ 60, et chaque règle coûte du contexte à chaque échange) ; et le serveur refuse la promotion à moins que tu passes `human_confirmed=true`, alors demande-moi explicitement (« est-ce que ça devrait être une règle permanente ? ») avant d’en enregistrer une à 8 ou plus. Une préférence bien ancrée qui ne compte qu’une fois un sujet abordé va à 7 : elle reste entièrement consultable par recherche, sans figurer sur la carte de démarrage.

## Deuxième partie : à propos de *toi* comme assistant (ceci ne va PAS dans ma mémoire)

Quand l’entrevue sur la mémoire te semble complète, change de mode. Pose-moi quelques questions sur la façon dont je veux que **tu** te présentes à moi. Ces réponses sont différentes : elles vont dans les instructions personnalisées de mon IA (au même endroit où j’ai collé les instructions de mémoire), pas dans ma mémoire. **N’appelle pas `memory_save` pour cette partie.** Garde les réponses dans la conversation seulement.

Demande :

- Veux-tu que j’aie un nom ? Autre chose que « Claude », « ChatGPT » ou le nom par défaut que tu utilises ?
- Comment devrais-je t’écrire ? Formel, décontracté, chaleureux, bref, enjoué, professionnel : quels adjectifs décrivent ton assistant idéal ?
- Des manies que tu aimes ? (p. ex. « termine par une courte signature », « pas de remplissage, va droit au but », « dis-moi quand je me trompe »)
- Un ton à éviter ? (p. ex. « pas de flagornerie », « laisse tomber les mises en garde », « ne t’excuse pas à moins d’avoir vraiment brisé quelque chose »)

Une fois que j’ai répondu, produis un court bloc d’identité que je peux coller dans mes instructions personnalisées. Reste concis : 5 à 10 lignes au maximum. Présente-le ainsi :

> « Parfait. Voici un court bloc d’identité que tu pourrais ajouter à tes instructions personnalisées, à côté des instructions de mémoire :
>
> ```
> ## À propos de toi comme assistant
> - Ton nom est {nom, ou « pas de nom fixe »}
> - Ton : {mes adjectifs}
> - {remarques précises sur le comportement, une par ligne}
> ```
>
> Tu n’es pas obligé de le coller : la mémoire fonctionne sans lui, mais c’est ce qui donne aux prochaines conversations l’impression d’être vraiment *les tiennes*. »

## Quand les deux parties sont terminées

Dis-moi :

> « C’est terminé. J’ai enregistré ton identité, les gens de ta vie, ton travail en cours et la façon dont tu veux que je me présente, à la fois comme faits durables (pour qu’ils passent en premier dans chaque requête future) et comme la conversation qui les a fait ressortir (pour que la texture puisse être retrouvée).
>
> Si tu veux vérifier ce qui a été enregistré, ouvre le tableau de bord de CortexMind : dans l’icône de la barre des menus ou de la zone de notification, choisis « Ouvrir le tableau de bord », puis connecte-toi avec le « Mot de passe CortexMind » de l’onglet Connexion des réglages. »

Termine sur une note chaleureuse. Pas besoin d’enregistrer un résumé final : tu as déjà tout enregistré au fur et à mesure.
