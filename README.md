# Databricks DE Associate — Banco de Questões

Plataforma de estudo interativa para o exame Databricks Certified Data Engineer Associate.

## Estrutura do Projeto

```
databricks_data_engineer_associate/
├── index.html           # Página principal (HTML limpo)
├── README.md            # Este arquivo
├── css/
│   └── style.css        # Estilos e design
├── js/
│   └── app.js           # Lógica da aplicação
└── data/
    └── questions.json   # Banco de questões (JSON)
```

## Como Usar

1. Abra `index.html` no navegador
2. Selecione filtros de domínio (Desenvolvimento, Governança, Plataforma, Processamento)
3. Clique nas opções para responder
4. Use os botões para embaralhar, revelar todas ou reiniciar

## Como Adicionar Questões

Edite `data/questions.json` e adicione objetos com a seguinte estrutura:

```json
{
  "dom": "dev",
  "stem": "Texto da pergunta em HTML",
  "opts": [
    "Opção A",
    "Opção B",
    "Opção C",
    "Opção D"
  ],
  "c": 1,
  "expl": "Explicação da resposta correta",
  "src": "Fonte: Documentação ou Exam Guide"
}
```

### Campos:
- **dom**: Domínio — `dev`, `gov`, `plat`, `proc`
- **stem**: Enunciado da questão (aceita HTML)
- **opts**: Array com 4 alternativas
- **c**: Índice da resposta correta (0-3)
- **expl**: Explicação detalhada da resposta
- **src**: Referência de fonte

## Personalizações

### Cores
Edite as variáveis CSS em `css/style.css`:
```css
:root {
  --brand: #ff3621;      /* Cor principal */
  --ok: #0b8a5a;         /* Cor de acerto */
  --bad: #c0362c;        /* Cor de erro */
  /* ... mais cores */
}
```

### Domínios
Para adicionar novos domínios, modifique `DOMAIN_LABELS` em `js/app.js`:
```javascript
const DOMAIN_LABELS = {
  dev: 'Desenvolvimento',
  gov: 'Governança',
  plat: 'Plataforma',
  proc: 'Processamento'
  // Adicione novos aqui
};
```

## Recursos

- Filtro por domínio
- Contadores de acurácia em tempo real
- Explicações detalhadas
- Embaralhamento de questões
- Revelar todas as respostas
- Resetar progresso
- Responsivo para mobile

## Dados

Respostas são armazenadas localmente na sessão do navegador e não persistem após recarregar a página. Para persistência permanente, considere integrar com localStorage ou um backend.

## Notas

- Questões são autorais e baseadas no exam guide oficial
- Nomeados atualizados: DLT → LDP, Databricks Repos → Git Folders
- Sempre confirme com a documentação vigente antes da prova
