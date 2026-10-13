import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

try {
  process.loadEnvFile();
} catch {
  // .env é opcional: as variáveis podem vir do ambiente
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Define o EJS como renderizador de páginas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// Endereço da API: o navegador (public/js/app.js) é quem chama
app.locals.apiUrl = process.env.API_URL ?? "http://localhost:8080";

// Arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/vendor/phosphor",
  express.static(path.join(__dirname, "node_modules/@phosphor-icons/web")),
);

// Telas: o index.js só entrega as páginas. Login, token, dados e erros
// ficam em public/js/app.js, que consome a API do Back-End.
const tela = (view) => (req, res) =>
  res.render(view, { receitaId: req.params.id });

app.get("/", (req, res) => res.redirect("/receitas"));
app.get("/login", tela("login"));
app.get("/cadastro", tela("cadastro"));
app.get("/logout", (req, res) => res.redirect("/login")); // o app.js limpa o token
app.get("/usuario", tela("usuario"));
app.get("/receitas", tela("receita"));
app.get("/receitas/temperatura/cadastrar/:id", tela("adicionarTemperatura"));
app.get("/receitas/temperatura/editar/:id", tela("editarTemperatura"));
app.get("/receitas/iodo/cadastrar/:id", tela("adicionarIodo"));
app.get("/receitas/iodo/editar/:id", tela("editarIodo"));

// Inicia o servidor
const port = Number(process.env.PORT) || 4000;
app.listen(port, (erro) => {
  if (erro) return console.log("Ocorreu um erro ao iniciar o servidor");
  console.log(`Servidor iniciado com sucesso em http://localhost:${port}`);
});
