## IGNORE GIT

```bash
git update-index --assume-unchanged backend/.env
git update-index --assume-unchanged backend/.env.devel
git update-index --assume-unchanged .env
```

## UPDATE package.json

```bash
npx npm-check-updates -u
npx npm-check-updates -u --target minor
npm install
```

## copy frontend to server
```bash
scp -r -P 22 ./dist/* sicerdas@202.155.94.190:/var/www/sicerdas.com/frontend
```

## copy backend to server

```bash
scp -r -P 22 ./backend/dist sicerdas@202.155.94.190:/var/www/sicerdas.com/backend/
```