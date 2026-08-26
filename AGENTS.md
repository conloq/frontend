# AGENTS.md

## Project shape

- Node.js ES modules (`"type": "module"`) using Express 5, EJS, Sequelize 6, MySQL2, `express-session`, bcrypt, Multer, Tailwind CSS v4, and Phosphor Icons.
- `index.js` is the runtime entrypoint and listens on port `8080`; it creates/syncs the `cervejaria` MySQL database, serves `public/`, and mounts `routes/route.js`, `routes/usuarioRoutes.js`, and `routes/receitaRoutes.js` at `/`.
- Request flow is route → middleware → controller → Sequelize model/association → EJS view. Keep associations in `config/associations.js`; do not define them in routes or controllers.
- `views/` contains EJS pages and partials; browser CSS/JS/images belong in `public/`. Tailwind source is `public/css/tailwind.css`; `public/css/style.css` is generated output and must not be edited manually.

## Commands and prerequisites

- Install: `npm install`
- Start development server: `npm start` (`npx nodemon index.js`)
- Build CSS: `npm run build:css`
- Watch CSS: `npm run watch:css`
- The app requires a local MySQL server and the configured database credentials before routes can be exercised end to end.
- `npm test` is intentionally only the default placeholder and exits with an error; there is no implemented test, lint, formatter, or typecheck suite.
- For focused checks, use `node --check <file>.js`, compile affected EJS templates with the installed `ejs` package, and rebuild Tailwind after changing classes or `@source` directives.

## Runtime constraints

- Database and session settings are hardcoded in `config/sequelize-config.js` and `config/session.js`; there is no verified `.env` loading or migration workflow.
- Startup uses Sequelize `sync({ force: false })`; preserve existing models and database behavior unless schema work is explicitly requested.
- Protected routes use session middleware from `middleware/guestMiddleware.js`; `middleware/globalInfoUserMiddleware.js` exposes session data to EJS as `res.locals.usuario`.
- Login stores `userId`, `userEmail`, `nome`, and `url_imagem` in the session. Logout destroys the session and clears its cookie.
- User uploads use Multer disk storage under `public/uploads`, with a 20 MB limit and extension validation in `config/multer.js`; preserve these boundaries.
- Phosphor assets are served from `/vendor/phosphor` by `index.js`; do not add a second icon delivery mechanism without a reason.

## UI changes

- Bootstrap has been removed. Use Tailwind utility classes and the existing vanilla JavaScript in `public/js/script.js`; do not reintroduce Bootstrap CDNs, `data-bs-*` attributes, or Bootstrap classes.
- Preserve the existing EJS partial composition, session/auth behavior, route URLs, form methods, and field names when changing visual code.
- Responsive shell behavior is split: desktop uses the collapsible sidebar, while mobile uses the top-bar drawer/overlay. Keep keyboard and touch targets accessible when modifying navigation or modals.
- The compiled CSS and uploaded files are generated/runtime artifacts; avoid editing or committing them unless the task explicitly requires it.

## Verification

- Before claiming a change works, run the narrowest relevant syntax/template/build checks; use `npm start` and a browser check only when MySQL is available.
- Stop any development server started for verification.
- Do not run destructive Git commands, edit `node_modules/`, or change credentials/configuration outside the requested scope.

## Source of truth

- Treat `package.json` scripts, executable configuration, and current route/controller code as authoritative over stale README claims. In particular, the app runs on port `8080`, not the README's older `localhost:3000` example.
- `README.md` describes the product as a brewery-production system for recording iodine tests, recipes, temperatures, and user activity; verify implementation details in source before relying on README structure lists.

## Repository Map

A full codemap is available at `codemap.md` in the project root.

Before working on any task, read `codemap.md` to understand:
- Project architecture and entry points
- Directory responsibilities and design patterns
- Data flow and integration points between modules

For deep work on a specific folder, also read that folder's `codemap.md`.
