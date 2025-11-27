
# How to Deploy Your AICareerSkills App to Netlify

This guide provides the correct instructions for deploying your production-ready application to Netlify.

### Step 1: Push Your Project to GitHub

1.  Create a new repository on [GitHub](https://github.com).
2.  Follow the instructions to push your entire `aicareerskills-app` project folder to this new repository.

### Step 2: Deploy on Netlify

1.  **Sign Up/Log In:** Go to [https://www.netlify.com/](https://www.netlify.com/) and create a free account or log in.
2.  **New Site from Git:** From your Netlify dashboard, click "Add new site" -> "Import an existing project".
3.  **Connect to GitHub:** Connect to GitHub and authorize Netlify to access your repositories.
4.  **Select Your Repository:** Choose the GitHub repository you just created for your `aicareerskills-app`.
5.  **Configure Build Settings:** This is the most important step. Netlify will ask for your build settings. Enter the following:
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`

    These settings tell Netlify to run the Vite build process and to deploy the resulting `dist` folder.

6.  **Add Environment Variable (Crucial for API Key):**
    *   After selecting the repository and before deploying, go to your new site's settings.
    *   Navigate to **Site configuration > Environment variables**.
    *   Click **"Add a variable"**.
    *   **Key:** `VITE_GEMINI_API_KEY`
    *   **Value:** Paste your actual Google Gemini API key here.
    *   Click "Save".

    This securely stores your API key so your live application can use it without exposing it in the code. The app will use this key if the user doesn't provide one in the UI.

7.  **Deploy Site:** Go to the "Deploys" tab for your site and click "Trigger deploy" -> "Deploy site".

Netlify will now pull your code from GitHub, run the build command with your environment variable, and deploy the contents of your `dist` folder. After a minute or two, your site will be live on a public URL!
