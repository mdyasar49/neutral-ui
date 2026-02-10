# 💻 Neutral UI - Frontend

This is the interactive client for the Neutral UI platform. Built with **React** and **Material UI**, it focuses on delivering a high-performance, accessible, and visually stunning user interface.

## 🎨 Design System

The frontend follows a strictly defined theme located in `src/theme/`.

- **Colors**: Uses a custom primary palette (`#2065D1`) and a system of neutral shades for dark/light mode compatibility.
- **Typography**: Optimized with the `Public Sans` font family for readability.
- **Shadows**: Premium custom shadow tokens (`z1`, `z8`, `z12`, `z24`) for depth.

## 🏗️ Folder Structure

- `src/components/`: Reusable primitive components (Charts, Dialogs, Tables).
- `src/Pages/`: Higher-level page components organized by module (exam, user, etc.).
- `src/Sections/`: Modular page sections to keep code manageable.
- `src/context/`: Global states (Notifications, Auth logic).
- `src/services/`: Abstracted axios instances for backend communication.

## ⚡ Technical Highlights

- **Form Management**: Powered by `react-hook-form` for performance and `fieldArray` for dynamic exam questions.
- **Theme Switching**: Seamless Light/Dark mode transitions using MUI `ThemeProvider`.
- **Navigation**: Client-side routing with `react-router-dom` v6.
- **SEO**: Meta tags and titles managed via `react-helmet-async`.

## 🛠️ Setup Instructions

1.  Verify Node.js version is 16+.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure `.env` if necessary (API base URL).
4.  Launch dev server:
    ```bash
    npm start
    ```

## 🧪 Clean Code Policies

- **No Hardcoded Colors**: Use `theme.palette` tokens.
- **Accessibility**: All interactive elements must have unique IDs and ARIA labels.
- **Modular Components**: If a piece of JSX exceeds 200 lines, extract it into a section or component.
