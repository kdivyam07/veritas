# Prompt Wars submission draft

[Documentation index](index.md)

Repository: [kdivyam07/veritas](https://github.com/kdivyam07/veritas)

Hosted demo: [Veritas](https://veritas-by-divyam.vercel.app/) (public demo with isolated guest workspaces).

## Problem

Enterprise assistants pull from inconsistent wikis, SQL datasets and unverified APIs. They may answer without sufficient evidence or reveal restricted information.

## Solution

Veritas puts a visible evidence pipeline between knowledge and answers. Users can inspect sources, review trust, exclude data, ask questions, and see citations and recorded refusals. Every request is checked on the server. The demo prioritizes inspectable behavior over unsupported claims of perfect accuracy.

## 90-second pitch

Start with a messy knowledge library: an approved 90-day retention policy, an archived 365-day policy, an unverified API and restricted HR records. Ask the retention question. Show the correct source excerpt and explain why the others were excluded. Ask for salaries and demonstrate the refusal. Open the audit trail. Finish by importing and reviewing a synthetic source, showing how knowledge becomes eligible through an explicit decision.

## LinkedIn draft

I’m building Veritas for Prompt Wars: an evidence-first enterprise knowledge assistant.

The problem I’m exploring: internal wikis, databases and APIs can disagree, and an assistant should not quietly turn that uncertainty into a confident answer.

My first full-stack prototype includes cited source excerpts, source review, server-side access filtering, sensitive-pattern redaction, and a persistent audit trail.

This version uses synthetic data and an extractive engine. Next, I’ll evaluate stronger retrieval and carefully scoped integrations.

I’m documenting the build on GitHub, including what works and where the safeguards still need improvement.

Explore the code and setup guide: https://github.com/kdivyam07/veritas

#PromptWars #BuildInPublic #FullStackDevelopment #ResponsibleAI #GitHub

Verify the competition's submission rules, deadline, required technologies and AI-use policy before submission; only the problem statement was provided for this build. The demo is public and uses isolated guest sessions; provide local setup instructions as an alternative.
