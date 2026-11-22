# Profondeur de champ · Sony A7S II / A7S III

Simulateur interactif de profondeur de champ pensé pour les **Sony A7S II** et **A7S III**, avec une base d'objectifs monture E (dont le **FE 24-105mm F4 G OSS**) et les objectifs reflex adaptés les plus courants.

Adapté du [Depth Of Field Simulator](https://github.com/jherr/depth-of-field) de Jack Herrington (licence MIT).

## Ce qui change par rapport à l'original

- **Boîtiers** : uniquement A7S II et A7S III.
- **Modes capteur** : plein format (×1,0), Super 35 / APS-C (×1,5) et, sur A7S III, le recadrage ×1,1 de la 4K 120p.
- **Objectifs** (≈ 80) :
  - **24-105** : Sony FE 24-105mm F4 G OSS, Sony E PZ 18-105mm F4 G (APS-C), Canon EF 24-105 f/4L (I et II) et f/3.5-5.6 STM adaptés, Sigma 24-105 F4 Art adapté.
  - Sony FE (GM, G, Zeiss), Sigma DG DN, Tamron, Samyang, Zeiss Batis.
  - Objectifs APS-C : la sélection bascule automatiquement le boîtier en Super 35.
- **Profils Log** : A7S II en S-Log2 / S-Log3 dès ISO 1600 ; A7S III en S-Log3 / S-Log2 dès ISO 640 (double ISO natif 640 / 12 800).
- **Scènes d'intérieur** : salon (tungstène), bureau (néons), studio interview (LED 5600 K), pièce éclairée par une fenêtre, église (bougies et vitraux), en plus de la salle de mariage et de la salle de fête. Chacune a son décor et ses sources de lumière dans l'aperçu écran.
- **ISO** jusqu'à 409 600, vidéo PAL 25p et filtre ND8 par défaut, interface en français.
- **Préréglages** adaptés : 24-105 à 24 / 50 / 105 mm, A7S II + EF 24-105 adapté, 35 mm f/1.4 sur gimbal, Super 35 + Sigma 18-35, etc.

## Mise en ligne sur GitHub Pages

1. Crée un dépôt vide sur GitHub (par ex. `a7s-depth-of-field`).
2. Depuis ce dossier :
   ```bash
   git remote add origin https://github.com/<ton-pseudo>/a7s-depth-of-field.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
4. Le workflow `.github/workflows/deploy.yml` compile et publie le site à chaque push sur `main`.
   Adresse : `https://<ton-pseudo>.github.io/a7s-depth-of-field/`

Le site utilise des chemins relatifs, donc le nom du dépôt n'a pas d'importance. Le lien « Contribuer sur GitHub » pointe automatiquement vers ton dépôt.

## Développement local

```bash
npm install
npm run dev      # serveur local avec rechargement à chaud
npm run build    # vérification TypeScript + build dans dist/
npm test         # tests unitaires
```

## Ajouter un objectif

Tout se passe dans `src/gear.ts`, tableau `RAW` :

```ts
["Sony", "FE 24-105mm F4 G OSS", 24, 105, 4],
//  fabricant, nom, focale mini, focale maxi, ouverture grand-angle, [ouverture télé]
```

- `E` : objectifs plein format monture E
- `EF` : objectifs reflex adaptés (MC-11, Metabones…)
- `E-APSC` : objectifs APS-C (bascule en Super 35)

## Calculs

- Cercle de confusion : 0,029 mm en plein format, 0,026 mm en recadrage ×1,1, 0,019 mm en Super 35.
- Hyperfocale : `H = f + f² / (N × c)`
- Limites de netteté : `Dproche = H·s / (H + (s − f))`, `Dlointaine = H·s / (H − (s − f))`
- Diffraction signalée quand la tache d'Airy (≈ 0,001342 × N mm) dépasse le cercle de confusion.

## Licence

MIT. Voir `LICENSE.txt`.
