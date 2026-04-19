# Gangetester

Webapp for trening på gangetabellen med adaptiv seleksjon. Ingen backend — all
progresjon lagres i nettleseren (localStorage).

## Funksjonalitet

- Ett gangestykke av gangen, standard tabellene 1–10 (konfigurerbart).
- Stort tall-tastatur med én knapp per siffer. Svaret sendes automatisk når
  riktig antall siffer er tastet.
- Umiddelbar tilbakemelding: riktig / galt + svartid ved riktig.
- Feil svar krever at fasit tastes inn før man går videre.
- Adaptiv algoritme som vekter neste oppgave på feilrate siste 5 svar, beste
  svartid, tid siden sist sett og gjennomsnittlig svartid siste 5 svar.
  Samme regnestykke kommer aldri to ganger på rad.
- 10×10 heatmap farget etter beste svartid per stykke.
- Øktstatistikk: antall besvart, riktig-andel, median svartid, streak.
- Mørk modus, mobile-first, store knapper.

## Kom i gang

### GitHub Codespaces

Åpne repoet i en Codespace — `npm install` kjøres automatisk, og `npm run dev`
starter ved hver attach. Port 5173 åpnes i preview-panelet når Vite er klar.

### Lokalt

```bash
npm install
npm run dev
```

Produksjonsbygg:

```bash
npm run build
npm run preview
```

## Deploy til GitHub Pages

Workflow ligger i `.github/workflows/deploy.yml`. Ved push til `main` bygges
appen med `VITE_BASE` satt til `/<repo-navn>/` og publiseres via GitHub Pages.
Aktiver Pages under **Settings → Pages → Source: GitHub Actions** på repoet.

## Stack

React 18, Vite 5, TypeScript, Tailwind CSS 3.
