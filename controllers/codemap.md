# controllers/

## Responsibility

`pageController.js` owns frontend page routes and presentation flow: it reads the session, calls the separate Back-End API, supplies EJS locals, and receives same-origin form POSTs before redirecting back to EJS pages.

## Files

- `pageController.js`: login/signup/logout, protected page routes, user lookup, server-side API helper, form mutations, and session flash.

## Boundaries

- Business rules, persistence, and JWT issuance stay in `conloq/Back-End`.
- Views render data passed by `res.render`; browser code never receives the API URL or JWT.
- Form handlers adapt input and API responses for presentation; business rules remain in the Back-End.
- `express-session` persists records in the existing MySQL database's `sessions` table, created by the Back-End migration. The frontend database account should have DML access to that table only.
