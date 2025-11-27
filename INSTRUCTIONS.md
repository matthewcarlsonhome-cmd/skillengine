
# Project Setup Guide: How to Run Your Application

This guide has been updated to use a professional development and deployment workflow.

### Step 1: Install Node.js

If you don't have it, install Node.js (which includes npm) from [nodejs.org](https://nodejs.org/).

### Step 2: Create Your Project Folder Structure

Create a main folder called `aicareerskills-app`. Inside it, create the sub-folders as shown below.

```
aicareerskills-app/
├── components/
│   └── ui/
├── hooks/
├── lib/
└── pages/
```

### Step 3: Save All Your Files

Place each file you have into the correct folder. **Crucially, make sure to add the new `package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, and `index.css` files to the root of your `aicareerskills-app` folder.**

*   **Inside `aicareerskills-app/`:**
    *   `package.json` (new)
    *   `vite.config.ts` (new)
    *   `tailwind.config.js` (new)
    *   `postcss.config.js` (new)
    *   `index.css` (new)
    *   `App.tsx`
    *   `index.html` (updated)
    *   `index.tsx` (updated)
    *   `metadata.json`
    *   `types.ts`
*   **Inside `aicareerskills-app/components/`:**
    *   `FileUploader.tsx`, `Header.tsx`, `icons.tsx`, `SkillCard.tsx`
*   **Inside `aicareerskills-app/components/ui/`:**
    *   `Button.tsx`, `Checkbox.tsx`, `Input.tsx`, `Progress.tsx`, `Select.tsx`, `Textarea.tsx`
*   **Inside `aicareerskills-app/hooks/`:**
    *   `useAppContext.tsx`, `useTheme.tsx`, `useToast.tsx`
*   **Inside `aicareerskills-app/lib/`:**
    *   `gemini.ts`, `skills.ts`
*   **Inside `aicareerskills-app/pages/`:**
    *   `HomePage.tsx`, `SkillRunnerPage.tsx`

### Step 4: Run the Local Development Server

1.  **Open a terminal or command prompt.**
2.  **Navigate into your project folder** using the `cd` command.
    ```bash
    cd path/to/your/aicareerskills-app
    ```
3.  **Install all the necessary packages.** This command reads your `package.json` file and downloads everything needed to run the app.
    ```bash
    npm install
    ```
4.  **Start the development server.**
    ```bash
    npm run dev
    ```
5.  Your terminal will show a local address, usually `http://localhost:5173/`.
6.  **Open that address in your web browser.** The application will now load and be fully functional.

### Step 5: Using the App

1.  On the home page, use the upload buttons to provide your **Resume** and a **Job Description**.
2.  Click "Launch" on any skill.
3.  On the skill page, **enter your API key** in the designated field.
4.  Click "Run Skill".
