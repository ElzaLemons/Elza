# 🌐 Portal Nea Onnim & Espaço Vozes Negras

![Versão|74](https://img.shields.io/badge/Vers%C3%A3o-2.0-blue)
![Status](https://img.shields.io/badge/Status-Fase_1%3A_MVP-brightgreen)
![Conformidade Legal](https://img.shields.io/badge/Lei_Eleitoral-100%25_Neutra-green)
![Privacidade](https://img.shields.io/badge/LGPD-Conforme-informational)
![Ano](https://img.shields.io/badge/Ano-2026-orange)

> **Documento Oficial de Requisitos, Arquitetura e Governança do Projeto**  
> *Coordenação de Produção:* Estudantes da 3ª Série (Ensino Médio)  
> *Supervisão:* Dir.ª Kelly & Direção Escolar  
>
> *"Nea Onnim No Sua A, Ohu"* — Símbolo Adinkra para *"Aquele que não sabe pode aprender através do conhecimento"*.

---

## 📌 1. Visão Geral e Objetivos

O **Portal Nea Onnim** é um canal digital de comunicação escolar livre, independente e totalmente gerenciado pelos estudantes. O projeto visa centralizar as notícias da escola, divulgar eventos, facilitar o acesso a serviços escolares e abrigar, como destaque permanente, o **Coletivo Vozes Negras**.

### 🎯 Pilares Estratégicos
* **Centralização da Comunicação:** Publicação dinâmica de notícias, eventos, avisos rápidos da direção e hub de formulários.
* **Espaço Vozes Negras:** Sub-home editorial permanente dedicada a artigos, ensaios, entrevistas e projetos de conscientização antirracista.
* **Protagonismo Estudantil:** Processo de escrita, curadoria e publicação realizado diretamente pelos alunos sob mediação pedagógica.
* **Sustentabilidade & Legado:** Estruturação documentada para garantir a continuidade do portal entre as gerações de estudantes.

---

## ⚖️ 2. Restrições e Conformidade Legal

Por ser um portal desenvolvido no ambiente escolar durante um **ano eleitoral**, a plataforma adota critérios rígidos de neutralidade institucional e proteção de dados:

### 2.1. Identidade Visual Neutra (Lei nº 9.504/97)
* **Desvinculação Governamental:** É proibido o uso de logotipos, slogans ou identidade visual de órgãos públicos (Prefeitura, Secretaria de Educação ou Governo Estadual).
* **Isenção Política:** Veta-se qualquer veiculação de conteúdos, menções ou mídias ligadas a candidatos, partidos políticos ou campanhas públicas.
* **Nome Fantasia Estudantil:** Adoção do nome neutro e independente **Nea Onnim**.

### 2.2. Privacidade e Proteção de Dados (LGPD)
* **Direito de Imagem:** Publicações de fotos ou vídeos de menores exigem autorização expressa e assinada pelos pais/responsáveis.
* **Coleta Mínima:** O portal não armazena dados pessoais dos visitantes. Todos os formulários operam via links institucionais seguros.

---

## 🗺️ 3. Arquitetura da Informação & Central de Links

A estrutura do site utiliza um padrão moderno de **portal de notícias**, projetado para navegação fluida em dispositivos móveis e desktops.

```text
┌─────────────────────────────────────────────────────────────┐
│                       CABEÇALHO (Menu)                      │
│ [Logo] Home | Notícias | Vozes Negras | Eletivas & Links    │
├─────────────────────────────────────────────────────────────┤
│   DESTAQUE PRINCIPAL (Matéria em Alta / Aviso Urgente)      │
├──────────────────────────────┬──────────────────────────────┤
│  FEED DE NOTÍCIAS GERAIS     │  ESPAÇO VOZES NEGRAS         │
│  - Eventos & Projetos        │  - Artigos & Opinião         │
│  - Avisos da Direção         │  - Entrevistas & Cultura     │
├──────────────────────────────┴──────────────────────────────┤
│  🔗 CENTRAL DE LINKS ÚTEIS E FORMULÁRIOS (Eletivas, etc.)    │
├─────────────────────────────────────────────────────────────┤
│                      RODAPÉ DO SITE                         │
│   Expediente | Manual do Redator | Acessibilidade | Redes   │
└─────────────────────────────────────────────────────────────┘
```

### 📋 Central de Links Úteis e Formulários
Espaço de utilidade pública para integração de processos escolares:
* **Inscrição de Eletivas:** Botões e páginas dedicadas para escolha das matérias eletivas do semestre (Google/Microsoft Forms).
* **Pesquisas e Enquetes:** Votações do Grêmio Estudantil e pesquisas de opinião pedagógicas.
* **Inscrições em Eventos:** Formulários para campeonatos esportivos, feiras de ciências e oficinas.
* **Caixa de Pautas:** Canal contínuo para envio de sugestões de matérias pela comunidade.

---

## 🛠️ 4. Especificações Técnicas & Acessibilidade

* **Mobile-First:** Design totalmente otimizado para navegação via smartphones.
* **Acessibilidade Universal:** Integração com **VLibras**, modo de alto contraste e descrições textuais (`alt`) em todas as imagens.
* **Otimização de Mídias:** Imagens no formato WebP para baixo consumo de dados móveis.
* **Incorporação de Serviços:** Suporte a links diretos e iFrames para preenchimento simples de formulários.

---

## 🔄 5. Governança & Fluxo Editorial

Para manter a qualidade textual e a segurança jurídica, as postagens obedecem à esteira de aprovação em 5 etapas:

```text
[1.Redação]──►[2.Coordenação]──►[3. Revisão]──► [4. Validação] ──► [5. Publicação]
 (Estudantes) (Coord. Alunos)   (Professores)     (Dirª Kelly)       (No Site)
```

1. **Redação:** Elaboração de textos e cobertura de mídias pelos alunos redatores.
2. **Coordenação:** Organização da pauta, formatação e alinhamento visual.
3. **Revisão Pedagógica:** Correção gramatical e revisão de conteúdo por professores colaboradores.
4. **Validação Legal:** Avaliação de conformidade eleitoral e institucional realizada pela Dirª Kelly / Direção.
5. **Publicação:** Disponibilização pública da matéria no portal.

---

## 🗝️ 6. Plano de Transição, Documentação e Sucessão

Como a coordenação atual é gerida por estudantes formandos do 3º Ano, este repositório estabelece as diretrizes de transferência de gestão:

* **Co-Coordenação de Sucessão:** No 2º semestre, estudantes do 1º e 2º ano ingressam como co-coordenadores, acompanhando todo o processo prático por 3 a 4 meses.
* **Custódia Institucional de Credenciais:** As contas principais, domínio e senhas do portal são mantidas sob custódia da **Dir.ª Kelly e da Direção**.
* **Gestão via GitHub & E-mail Neutro:** O repositório armazena o código e documentação. O portal é associado a um e-mail neutro institucional (ex: `portalescolar.contato@gmail.com`).
* **Manual do Redator & Onboarding:** Documentação detalhada e tutoriais rápidos em vídeo instruindo sobre formatação e fluxo de postagem.

---

````
# 🗺️ 7. Roadmap do Projeto (2026 – 2027)

```text
2026 (1º Semestre)         2026 (2º Semestre - Atual)    2027 (Ano Seguinte)
 Fase 1: Planejamento        Fase 2: MVP & Lançamento      Fase 3: Autonomia
┌──────────────────┐       ┌──────────────────┐          ┌──────────────────┐
│ - Ideação & Req. │       │ - Construção     │          │ - Nova equipe    │
│ - Regras Legais  │ ────► │ - Seção Vozes N. │ ───────► │ - assume 100%    │
│ - Documentação   │       │ - Lançamento     │          │ - Continuidade   │
└──────────────────┘       └──────────────────┘          └──────────────────┘
````

### 🎯 Fase 1: Planejamento & Requisitos (2026 / 1º Semestre)

- Levantamento das necessidades da escola e definição do escopo do portal.
    
- Estudo de conformidade legal (Lei Eleitoral e LGPD) e definição do nome neutro **Nea Onnim**.
    
- Elaboração da documentação técnica e arquitetura de informação do projeto.
    

### 🚀 Fase 2: MVP, Lançamento & Início da Transição (2026 / 2º Semestre - Atual)

- Construção da estrutura do portal, sub-home do Coletivo Vozes Negras e Central de Links/Eletivas.
    
- Validação final da versão inicial com a Dir.ª Kelly e a Direção.
    
- Lançamento oficial do portal de notícias para toda a comunidade escolar.
    
- Ingressamento dos alunos do 1º e 2º ano para acompanhamento prático das postagens.
    

### 🗝️ Fase 3: Autonomia & Gestão Contínua (2027 / Próximo Ano Letivo)

- Passagem definitiva de bastão: nova equipe (alunos do 2º e 3º ano) assume 100% da gestão do portal.
    
- Manutenção do fluxo editorial e envio do relatório anual para a supervisão pedagógica.

---

## 🤝 8. Expediente & Equipe

* **Gestão e Coordenação de Produção:** Estudantes da 3ª Série do Ensino Médio
* **Co-Coordenação e Redação:** Estudantes da 1ª e 2ª Séries do Ensino Médio
* **Parceria Editorial:** Coletivo Vozes Negras
* **Supervisão Pedagógica e Institucional:** Dir.ª Kelly & Direção Escolar