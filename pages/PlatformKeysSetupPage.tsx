import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Key, Database, Server, Settings, TestTube, Shield } from 'lucide-react';

const PlatformKeysSetupPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <Link to="/account" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Account Settings
        </Link>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h1>Platform Keys Setup Guide</h1>
        <p className="lead">
          This guide explains how to set up platform-managed API keys so users can run skills without providing their own keys.
        </p>

        <div className="not-prose bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Key className="h-5 w-5" />
            Overview
          </h3>
          <p className="text-sm text-muted-foreground mb-2">With Platform Keys enabled:</p>
          <ul className="text-sm space-y-1">
            <li>Users choose "Platform Key" mode in Account Settings</li>
            <li>API calls are routed through your Supabase Edge Function</li>
            <li>Usage is tracked and deducted from user credits</li>
            <li>You manage a single API key per provider</li>
          </ul>
        </div>

        <h2>Prerequisites</h2>
        <ol>
          <li><strong>Supabase Project</strong> - Create one at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
          <li><strong>Supabase CLI</strong> - Install: <code>npm install -g supabase</code></li>
          <li><strong>API Keys</strong> from providers you want to support:
            <ul>
              <li><a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">Google AI Studio</a> - Get Gemini key</li>
              <li><a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">Anthropic Console</a> - Get Claude key</li>
              <li><a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer">OpenAI Platform</a> - Get ChatGPT key</li>
            </ul>
          </li>
        </ol>

        <hr />

        <h2 className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          Step 1: Set Up Database Tables
        </h2>
        <p>Run this SQL in your Supabase SQL Editor:</p>
        <pre className="text-xs overflow-x-auto"><code>{`-- User credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,  -- Balance in cents
  tier TEXT DEFAULT 'free',
  monthly_allocation INTEGER DEFAULT 0,
  used_this_month INTEGER DEFAULT 0,
  reset_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE user_credits
  SET
    balance = balance - p_amount,
    used_this_month = used_this_month + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = user_credits.balance + p_amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own credits
CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own usage
CREATE POLICY "Users can view own usage"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);`}</code></pre>

        <hr />

        <h2 className="flex items-center gap-2">
          <Key className="h-6 w-6" />
          Step 2: Store API Keys as Secrets
        </h2>
        <p>In your terminal, run these commands (replace with your actual keys):</p>
        <pre><code>{`# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Set API keys as secrets
supabase secrets set GEMINI_API_KEY=AIzaSy...your-key
supabase secrets set CLAUDE_API_KEY=sk-ant-...your-key
supabase secrets set OPENAI_API_KEY=sk-...your-key`}</code></pre>
        <div className="not-prose bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 my-4">
          <p className="text-sm"><strong>Security Note:</strong> These keys are stored encrypted and only accessible to Edge Functions. They are never exposed to the client.</p>
        </div>

        <hr />

        <h2 className="flex items-center gap-2">
          <Server className="h-6 w-6" />
          Step 3: Deploy the Edge Functions
        </h2>
        <p>The Edge Functions are already created in <code>supabase/functions/</code>. Deploy them:</p>
        <pre><code>{`# Deploy the AI proxy function
supabase functions deploy ai-proxy

# Deploy the status check function
supabase functions deploy platform-status

# Verify they're running
supabase functions list`}</code></pre>

        <hr />

        <h2 className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Step 4: Configure Environment Variables
        </h2>
        <p>In your hosting platform (Netlify, Vercel, etc.), set these environment variables:</p>
        <pre><code>{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PLATFORM_KEYS_ENABLED=true`}</code></pre>
        <p>Then trigger a redeploy for the changes to take effect.</p>

        <hr />

        <h2 className="flex items-center gap-2">
          <TestTube className="h-6 w-6" />
          Step 5: Test the Setup
        </h2>
        <h3>Test Platform Status</h3>
        <pre><code>{`curl https://your-project.supabase.co/functions/v1/platform-status`}</code></pre>
        <p>Expected response:</p>
        <pre><code>{`{
  "available": true,
  "providers": {
    "gemini": true,
    "claude": true,
    "openai": false
  }
}`}</code></pre>

        <hr />

        <h2>Cost Reference</h2>
        <div className="not-prose overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Model</th>
                <th className="text-right py-2 px-4">Input (per 1M)</th>
                <th className="text-right py-2 px-4">Output (per 1M)</th>
                <th className="text-right py-2 pl-4">~Cost/Skill</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4">Gemini Flash</td>
                <td className="text-right py-2 px-4">$0.075</td>
                <td className="text-right py-2 px-4">$0.30</td>
                <td className="text-right py-2 pl-4">$0.0006</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Claude Haiku</td>
                <td className="text-right py-2 px-4">$0.25</td>
                <td className="text-right py-2 px-4">$1.25</td>
                <td className="text-right py-2 pl-4">$0.002</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Claude Sonnet</td>
                <td className="text-right py-2 px-4">$3.00</td>
                <td className="text-right py-2 px-4">$15.00</td>
                <td className="text-right py-2 pl-4">$0.03</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">GPT-4o Mini</td>
                <td className="text-right py-2 px-4">$0.15</td>
                <td className="text-right py-2 px-4">$0.60</td>
                <td className="text-right py-2 pl-4">$0.001</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">GPT-4o</td>
                <td className="text-right py-2 px-4">$2.50</td>
                <td className="text-right py-2 px-4">$10.00</td>
                <td className="text-right py-2 pl-4">$0.02</td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr />

        <h2>Troubleshooting</h2>
        <h3>"Platform key not configured"</h3>
        <ul>
          <li>Check secrets: <code>supabase secrets list</code></li>
          <li>Redeploy functions after adding secrets</li>
        </ul>

        <h3>"Insufficient credits"</h3>
        <ul>
          <li>Add credits: <code>SELECT add_credits('user-uuid', 1000);</code></li>
          <li>Check balance: <code>SELECT * FROM user_credits WHERE user_id = 'user-uuid';</code></li>
        </ul>

        <h3>"Invalid authentication"</h3>
        <ul>
          <li>Ensure user is logged in</li>
          <li>Check JWT is being passed in Authorization header</li>
        </ul>

        <hr />

        <h2 className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Security Checklist
        </h2>
        <ul>
          <li>API keys stored as encrypted secrets (not in code)</li>
          <li>Row Level Security enabled on all tables</li>
          <li>User can only access their own data</li>
          <li>Credits checked before making API calls</li>
          <li>All usage is logged for auditing</li>
        </ul>
      </div>
    </div>
  );
};

export default PlatformKeysSetupPage;
