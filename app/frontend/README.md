# PUF Frontend

Welcome to the frontend repository for the PUF project. This project is built using [Next.js](https://nextjs.org/) (App Router).

## 🚀 Getting Started

First, install the dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## 📁 Project Structure

We follow a modular, scalable folder structure based on battle-tested best practices to keep the codebase consistent and easy to navigate.

- `src/app/` - Next.js App Router pages, layouts, and API routes.
- `src/components/` - Reusable, UI-level shared components. (We will be using **shadcn/ui** for the design system).
- `src/features/` - Feature-based modules (e.g., debts, user profile) containing their own components, hooks, services, and types.
- `src/lib/` - Utility functions, API clients, and third-party library configurations.
- `src/hooks/` - Shared custom React hooks.
- `src/config/` - Global configuration and constants.
- `src/types/` - Global TypeScript interfaces and types. Note: API types are currently drafted but might change once the backend models and required fields are finalized.
- `src/stores/` - Redux Toolkit global state management (e.g., `userSlice`).
- `src/providers/` - React context providers (like Redux Provider).

## 🛠️ Development Guidelines

Please adhere strictly to the following rules when contributing to this project to maintain code quality and consistency:

### Git & Branching Strategy
1. **Base Branch:** Always create your new branches from the `frontend` branch.
2. **Branch Naming:** Use descriptive prefixes for branch names based on the work you are doing:
   - `feature/task-name` - for new features
   - `fix/task-name` - for bug fixes
3. **Pull Requests (PRs):**
   - Open a PR when your task is done.
   - **DO NOT merge your own PR!** Leave a comment explaining your work and wait for someone else to review and approve it.
4. **Task Distribution:** Follow the assignments defined in the project `.docx` file, or communicate with the team before picking up unassigned tasks. We need to organize so everybody gets their points!

### Commit Messages
Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to keep the git history readable. Start your commit messages with:
- `feat:` (e.g., `feat: add debt creation form`)
- `fix:` (e.g., `fix: resolve crash on missing summary`)
- `chore:` (e.g., `chore: update dependencies`)
- `docs:`, `style:`, `refactor:`, etc.

### Coding Best Practices
- **Clean Code:** Remove all `console.log` statements and debugging code before committing your work once the APIs are ready.
- **State Management:** We use **Redux Toolkit** for global state. Check out the `userSlice` to see an example of how the global store is structured and added to `store.ts`. To access the state, use the custom typed hooks found in `src/hooks/redux.ts`.
- **API Status:** The backend API is currently under development. Until it is fully functional, there is no need to make real API requests.
- **Styling:** The design is intended to be simple and consistent. We will be integrating **shadcn/ui** soon.
- **Translations:** We need to implement `i18next` for localization. Currently, strings are hardcoded (like in the footer), but this needs to be transitioned to the translation system. If you pick up this task, start mapping out the translation dictionaries!

## 🤝 Questions or Issues?
If you are unsure how to use a specific tool (like Redux), or don't want to do a specific task, feel free to ask in the chat or contact the team lead for help. We are working together!
