# Site de Aniversário da Caroline

Site estático de homenagem para Caroline Paula Ribeiro Silvestre, pronto para publicar na Vercel.

## Rodar localmente

```bash
npm run dev
```

Depois abra:

```text
http://127.0.0.1:5501/
```

## Fotos

Coloque as fotos em:

```text
public/fotos-mae/
```

Se adicionar novas imagens, atualize também:

```text
public/fotos-mae/fotos.json
```

## Música

O player usa este arquivo:

```text
public/audio/the-climb.mp3
```

Para publicar em um site público, confirme se você tem autorização para usar a música.

## Publicar na Vercel

1. Suba o projeto para o GitHub.
2. Na Vercel, clique em `Add New Project`.
3. Importe este repositório.
4. Framework Preset: `Other`.
5. Build Command: deixe vazio ou use `npm run build`.
6. Output Directory: deixe vazio.
7. Clique em `Deploy`.
