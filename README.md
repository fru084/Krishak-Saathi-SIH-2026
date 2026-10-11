# Krishak Saathi

Your crop doctor in your pocket. A farmer photographs an affected leaf and gets a disease diagnosis in seconds. The app adds an organic-first treatment plan, a live "safe to spray?" rain check, and everything translated and spoken aloud in the farmer's own language.

## Features

- Disease diagnosis from a leaf photo (Plant.id, 35,000+ species, 500+ conditions)
- Weather-linked spray advisory (Open-Meteo), with a changeable location
- Full-app translation and text-to-speech in 10 Indian languages plus English (Google Cloud)
- Farm log of past scans, with a curated fallback if a live API fails

## Stack

Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Next.js API routes

## Run locally

```bash
npm install
```

Copy `.env.local.example` to `.env.local` and fill it in, then:

```bash
npm run dev
```

## Roadmap

Persistent database and fully offline on-device diagnosis.

Team Byte Architects, Smart India Hackathon 2026 (PS SIH26131).
