# Databricks DA Associate — Banco de Questões

Plataforma de estudo para o exame Databricks Certified Data Analyst Associate,
com 231 questões e dois modos de treino.

## Modos

### Exercícios

Todas as questões na mesma página, com feedback imediato. Filtro por domínio,
embaralhar, revelar todas e reiniciar. Bom para estudar conteúdo específico.

### Simulado

Reproduz o formato da prova real:

- **45 questões** sorteadas a cada simulado
- **90 minutos** com cronômetro regressivo (amarelo aos 10 min, vermelho aos 5)
- Uma questão por tela, sem gabarito durante a prova
- Grid de navegação com marcação de respondidas e sinalizadas para revisão
- Resultado final com nota, corte de 70%, desempenho por domínio e revisão completa

A distribuição de domínios segue os pesos do exam guide oficial. As 45 questões
são repartidas pelo método de maior resto, somando exatamente 45:

| # | Domínio | Peso | Questões |
|---|---|---|---|
| 1 | Understanding of Databricks Data + AI Platform | 11% | 5 |
| 2 | Managing Data | 8% | 4 |
| 3 | Importing Data | 5% | 2 |
| 4 | Executing queries using Databricks SQL and SQL Warehouses | 20% | 9 |
| 5 | Analyzing Queries | 15% | 7 |
| 6 | Creating Dashboards and Visualizations in Databricks | 16% | 7 |
| 7 | Developing, Sharing, and Maintaining AI/BI Genie spaces | 12% | 5 |
| 8 | Data Modeling with Databricks SQL | 5% | 2 |
| 9 | Securing Data | 8% | 4 |

## Estrutura

```
.
├── index.html           # Marcação das duas abas
├── css/
│   └── style.css        # Estilos
├── js/
│   ├── app.js           # Entry point, troca de modo
│   ├── data.js          # Carga das questões, blueprint e sorteio do simulado
│   ├── practice.js      # Modo Exercícios
│   └── exam.js          # Modo Simulado
└── data/
    └── questions.json   # Banco de questões
```

## Rodando

O projeto usa ES modules, então precisa ser servido por HTTP — abrir o
`index.html` direto pelo sistema de arquivos não funciona.

```bash
npm run serve
# ou
python -m http.server 8000 --bind 127.0.0.1
```

Depois acesse http://127.0.0.1:8000

## Adicionando questões

Edite `data/questions.json` acrescentando objetos neste formato:

```json
{
  "dom": "sql",
  "stem": "Enunciado da questão (aceita HTML)",
  "opts": ["Opção A", "Opção B", "Opção C", "Opção D"],
  "c": 1,
  "expl": "Explicação da resposta correta",
  "src": "Fonte: documentação ou exam guide"
}
```

- `dom`: `plat`, `mng`, `imp`, `sql`, `anl`, `viz`, `gen`, `mdl` ou `sec`
- `c`: índice da alternativa correta (0 a 3)

Os rótulos e pesos dos domínios ficam em `js/data.js`, em `DOMAINS`. Ao mudar
os pesos, ajuste também `examCount` para que a soma continue 45.

## Observações

- As questões são autorais, não são itens reais do exame
- Nomenclatura atualizada: dashboards do DBSQL → AI/BI Dashboards, Genie → AI/BI Genie spaces
- A Databricks não publica a nota de corte oficial; 70% é a referência de mercado
- O progresso não persiste entre recarregamentos da página
