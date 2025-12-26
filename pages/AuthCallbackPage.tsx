/**
 * AuthCallbackPage.tsx - OAuth Callback Handler
 *
 * This page handles the OAuth callback from Supabase after Google sign-in.
 * It reads tokens from sessionStorage (set by the pre-boot script in index.html)
 * and completes the authentication.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { handleUserSignIn } from '../lib/admin';
import { useAuth } from '../hooks/useAuth';

interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expires_in?: string;
  token_type?: string;
  provider_token?: string;
}

interface StoredError {
  error: string;
  error_description?: string;
}

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshAppUser } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        // Check for error in sessionStorage (set by index.html pre-boot script)
        const storedError = sessionStorage.getItem('supabase_auth_error');
        if (storedError) {
          sessionStorage.removeItem('supabase_auth_error');
          const errorData: StoredError = JSON.parse(storedError);
          throw new Error(errorData.error_description || errorData.error);
        }

        // Check for tokens in sessionStorage (set by index.html pre-boot script)
        const storedTokens = sessionStorage.getItem('supabase_auth_tokens');
        if (storedTokens) {
          sessionStorage.removeItem('supabase_auth_tokens');
          const tokens: StoredTokens = JSON.parse(storedTokens);

          // Set the session with Supabase using the stored tokens
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          });

          if (setSessionError) {
            throw setSessionError;
          }

          if (data.session?.user) {
            // Capture user data
            handleUserSignIn(
              data.session.user.id,
              data.session.user.email || '',
              data.session.user.user_metadata?.full_name,
              data.session.user.user_metadata?.avatar_url
            );

            // Refresh app user state
            refreshAppUser();

            setStatus('success');

            // Redirect to dashboard after brief success display
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 1000);
            return;
          }
        }

        // No stored tokens - check if there's already a session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user) {
          // Already have a session
          handleUserSignIn(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.full_name,
            session.user.user_metadata?.avatar_url
          );

          refreshAppUser();
          setStatus('success');

          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
        } else {
          // No session and no tokens - redirect to home
          navigate('/', { replace: true });
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Authentication failed');

        // Redirect to home after showing error
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, refreshAppUser]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center p-8">
        {status === 'processing' && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Completing sign in...
            </h1>
            <p className="text-muted-foreground">
              Please wait while we authenticate your account.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Sign in successful!
            </h1>
            <p className="text-muted-foreground">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Sign in failed
            </h1>
            <p className="text-muted-foreground mb-2">
              {errorMessage}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to home page...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
