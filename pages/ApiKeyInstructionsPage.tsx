
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ApiKeyInstructionsPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        <h1>How to Get Your API Key</h1>
        <p>To use the skills in this application, you need an API key from your chosen AI provider. Follow the instructions below for your selected provider.</p>

        <hr />

        <section id="gemini">
          <h2>Google Gemini</h2>
          <p>You can get a free Gemini API key from Google AI Studio. It includes a generous free tier for development.</p>
          <ol>
            <li>Go to the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio API Key page</a>.</li>
            <li>You may be asked to sign in with your Google account.</li>
            <li>Click the <strong>"Create API key"</strong> button.</li>
            <li>A new API key will be generated for you. Click the copy icon next to the key to copy it to your clipboard.</li>
            <li>Paste this key into the "API Key" field on the skill page in this application.</li>
          </ol>
        </section>

        <hr />

        <section id="claude">
          <h2>Anthropic Claude (Coming Soon)</h2>
          <p>You can get a Claude API key from the Anthropic Console.</p>
          <ol>
            <li>Go to the <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">Anthropic Console</a> and sign up or log in.</li>
            <li>Navigate to the <strong>"API Keys"</strong> section in your account settings.</li>
            <li>Click the <strong>"Create Key"</strong> button.</li>
            <li>Give your key a descriptive name (e.g., "AICareerSkills") and click "Create Key".</li>
            <li>Your API key will be displayed. Copy it immediately and store it somewhere safe, as you will not be able to see it again.</li>
            <li>Paste this key into the "API Key" field in this application when Claude is selected.</li>
          </ol>
        </section>

        <hr />

        <section id="chatgpt">
          <h2>OpenAI ChatGPT (Coming Soon)</h2>
          <p>You can get an OpenAI API key from the OpenAI Platform dashboard. Note that using the API may incur costs.</p>
          <ol>
            <li>Go to the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI API Keys page</a> and sign up or log in.</li>
            <li>Click the <strong>"Create new secret key"</strong> button.</li>
            <li>Give your key a name (e.g., "AICareerSkills") and click "Create secret key".</li>
            <li>Your API key will be displayed. Copy it immediately and store it somewhere safe, as you will not be able to see it again.</li>
            <li>Paste this key into the "API Key" field in this application when ChatGPT is selected.</li>
          </ol>
        </section>
      </div>
    </div>
  );
};

export default ApiKeyInstructionsPage;
