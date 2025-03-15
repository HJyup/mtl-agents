# MTL-Agents

MTL-Agents is a web application that allows you to interact with multiple agents at once.

<img width="1512" alt="Screenshot 2025-03-15 at 12 08 56" src="https://github.com/user-attachments/assets/5f52e605-3f64-4ef3-91b5-7e7206cf7131" />

## Idea

I was really inspired by the idea that we can use agents as ai assistants in our daily lives. I wanted to try to create loads of new projects using them but instead of creating a new one for each idea, I made a single project that can act as a sandbox for all my agent ideas.

## Available Agents

- [X] Google Calendar
- [ ] Google Mail
- [ ] Notion
- [X] Things
- [ ] University
- [ ] *FST Agent (planned) (I have a project where I recreated Git from strach and I want to make an agent that can help you navigating through this)*

You can choose them using shortcut that indetifies agent (for example for google calendar it's `cl`)

<img width="1219" alt="Screenshot 2025-03-15 at 12 02 34" src="https://github.com/user-attachments/assets/3218291c-067f-4ae5-8417-8b55d73ede1b" />

## Context
All agents share the same conversational context. For example, if you’re chatting with ChatGPT and then decide to create a new to-do list via the Things agent, it can automatically reference your previous messages for improved context and understanding.

## Exmaple
Small example how it works

<img width="1263" alt="Screenshot 2025-03-15 at 12 18 02" src="https://github.com/user-attachments/assets/c8b5d5ea-023a-4fc4-8d87-e3122d3b1f31" />


## Installation


First, set up the environment variables:

```bash
cp .env.example .env
```


Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
