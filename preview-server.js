import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/vendor/phosphor", express.static(path.join(__dirname, "node_modules/@phosphor-icons/web")));

app.get("/", (_req, res) => res.render("login"));
app.get("/cadastro", (_req, res) => res.render("cadastro"));
app.get("/usuario", (_req, res) => res.render("usuario"));
app.get("/receita", (_req, res) => res.render("receita"));
app.get("/receita/temperatura/criar/:id", (_req, res) => res.render("adicionarTemperatura"));
app.get("/receita/temperatura/editar/:id", (_req, res) => res.render("editarTemperatura"));
app.get("/receita/iodo/criar/:id", (_req, res) => res.render("adicionarIodo"));
app.get("/receita/iodo/editar/:id", (_req, res) => res.render("editarIodo"));

app.listen(port, () => console.log(`Preview EJS disponível em http://localhost:${port}`));
