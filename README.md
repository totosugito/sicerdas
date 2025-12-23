## IGNORE GIT
```bash
git update-index --assume-unchanged backend/.env
git update-index --assume-unchanged backend/.env.devel
git update-index --assume-unchanged .env
```

## UPDATE package.json
```bash
npx npm-check-updates -u
npm install
```