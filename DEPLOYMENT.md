
# How to Deploy Your SkillEngine App (Make it Live on the Internet)

This guide will show you how to publish your application so anyone can use it. Because your project is a "static site," this process is very easy and free.

We will use a service called **Netlify**, which is perfect for this.

### The Easiest Method: Netlify Drag-and-Drop

This method takes less than 5 minutes and requires no technical setup.

**Step 1: Sign Up for Netlify**

1.  Go to [https://www.netlify.com/](https://www.netlify.com/).
2.  Click "Sign up" and create a free account.

**Step 2: Prepare Your Project Folder**

-   Make sure your entire project is in a single folder (e.g., `skill-engine-app`).
-   **Crucially, ensure you have added your API key** to the `lib/gemini.ts` file as instructed previously.

**Step 3: Deploy the Site**

1.  Log in to your Netlify account. You will see a dashboard.
2.  Go to the **"Sites"** section.
3.  You will see a box that says: **"Want to deploy a new site without connecting to Git? Drag and drop your site folder here."**

    

4.  **Drag your entire `skill-engine-app` folder** from your computer and drop it onto that box in your browser.

**Step 4: You're Live!**

That's it! Netlify will take a few moments to upload and deploy your files.

-   It will automatically give you a random, public URL (like `https://random-adjective-noun-12345.netlify.app`).
-   You can click on this URL to see your live SkillEngine application.
-   You can customize this URL for free in the site's settings (e.g., `skill-engine.netlify.app`).

### Other Options (More Traditional)

-   **Vercel:** Another excellent, free hosting service very similar to Netlify. It also offers drag-and-drop deployment.
-   **Traditional Web Hosts (GoDaddy, Bluehost, etc.):** If you have a traditional hosting plan, you would use their "File Manager" tool. You would open the `public_html` or `www` directory and upload all the files and folders from your `skill-engine-app` folder into it.
