# Full Stack E-Commerce + Dashboard & CMS

This is a repository for a Full Stack E-Commerce + Dashboard & CMS: Next.js 13 App Router, React, Tailwind, Prisma, MySQL and ReactQuery


### Install packages

```shell
pnpm i
```

### Setup .env file

Set the environment variables: Create a .env file in the root directory and add the variables from the local .env.example file


```bash
cp .env.example .env
```


### Connect to PlanetScale and Push Prisma
```shell
pnpm prisma generate
pnpm prisma db push
```


### Start the app

```shell
pnpm dev
```