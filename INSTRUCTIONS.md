
# Project Setup Guide: How to Run Your Application

You have all the correct code! This guide will walk you through exactly how to set up and run the SkillEngine application.

### Step 1: Create Your Project Folder Structure

First, create a main folder called `skill-engine-app`. Inside it, create the sub-folders as shown below.

```
skill-engine-app/
├── components/
│   └── ui/
├── hooks/
├── lib/
└── pages/
```

### Step 2: Save All Your Files

Place each file you have into the correct folder, as detailed below.

*   **Inside `skill-engine-app/`:**
    *   `App.tsx`
    *   `index.html`
    *   `index.tsx`
    *   `metadata.json`
    *   `types.ts`
*   **Inside `skill-engine-app/components/`:**
    *   `FileUploader.tsx` (This is a new file)
    *   `Header.tsx`
    *   `icons.tsx`
    *   `SkillCard.tsx`
*   **Inside `skill-engine-app/components/ui/`:**
    *   `Button.tsx`, `Checkbox.tsx`, `Input.tsx`, `Progress.tsx`, `Select.tsx`, `Textarea.tsx`
*   **Inside `skill-engine-app/hooks/`:**
    *   `useAppContext.tsx`
    *   `useTheme.tsx`
    *   `useToast.tsx`
*   **Inside `skill-engine-app/lib/`:**
    *   `gemini.ts`
    *   `skills.ts`
*   **Inside `skill-engine-app/pages/`:**
    *   `HomePage.tsx`
    *   `SkillRunnerPage.tsx`

### Step 3: Run a Local Web Server (Final Step)

You cannot just open `index.html` in your browser due to modern web security policies. You must serve the files from a local server. This is very easy to do.

1.  **Open a terminal or command prompt.**
2.  **Navigate into your project folder** using the `cd` command.
    ```bash
    cd path/to/your/skill-engine-app
    ```
3.  **Run ONE of the following commands.** (If you have Python, the first one is easiest).

    *   **Option A: Using Python (Usually pre-installed on Mac/Linux)**
        ```bash
        python3 -m http.server
        ```
        (If that doesn't work, try `python -m SimpleHTTPServer`)

    *   **Option B: Using Node.js/npx (No installation needed)**
        ```bash
        npx serve
        ```

4.  Your terminal will show a local address, usually `http://localhost:8000` or `http://localhost:3000`.
5.  **Open that address in your web browser.**

### Step 4: Using the App

1.  On the home page, use the upload buttons to provide your **Resume** and a **Job Description**.
2.  Once uploaded, click "Launch" on any skill.
3.  On the skill page, the text from your uploaded files will be pre-filled.
4.  Select your AI Provider and **enter your API key**.
5.  Click "Run Skill".

---

## How to Add New Skills

The application is now designed to be easily extended.

**To add a new skill, you only need to do one thing: edit the `lib/skills.ts` file.**

1.  Open `lib/skills.ts`.
2.  Inside the `export const SKILLS = { ... };` block, add a new object for your skill.
3.  Copy the structure from an existing skill. You must define:
    *   `id`: A unique, URL-friendly ID (e.g., `'my-new-skill'`).
    *   `name`: The display name for the card (e.g., `'My New Skill'`).
    *   `description`: The short text on the card.
    *   `longDescription`: The text for the sidebar.
    *   `whatYouGet`: A list of benefits for the sidebar.
    *   `theme`: Colors for the card.
    *   `icon`: An icon from `components/icons.tsx`.
    *   `inputs`: The form fields the user will fill out.
    *   `systemPrompt`: The instructions for the AI.
    *   `useGoogleSearch`: (Optional) Set to `true` if the skill needs real-time web access.

Once you save the file, a new card for your skill will automatically appear on the home page.
