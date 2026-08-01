# mpesa-stk

A lightweight, fully typed TypeScript library for Safaricom M-Pesa STK Push (Lipa na M-Pesa Online) integrations. Works across Node.js, Next.js, Express, Fastify, NestJS, and edge environments.

## Features

- ⚡ **Framework Agnostic**: Works seamlessly with Next.js App Router, Express, Fastify, NestJS, and Koa.
- 🔒 **Type-Safe**: Complete TypeScript interfaces for requests, responses, errors, and callbacks.
- 💾 **Pluggable Persistence**: Includes built-in `MemoryAdapter` and `PostgresAdapter`.
- 📡 **Event-Driven**: Built-in `EventBus` to respond asynchronously to callback payments.
- ⏱️ **Automatic Status Polling**: Resolves transaction states with exponential backoff retries.

## Installation

```bash
npm install mpesa-stk