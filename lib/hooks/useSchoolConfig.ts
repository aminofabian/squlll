import { useQuery } from '@tanstack/react-query';
import { useSchoolConfigStore } from '../stores/useSchoolConfigStore';
import { SchoolConfiguration } from '../types/school-config';
import { useState } from 'react';
import {
  getGraphqlFailureMessage,
  handleAuthenticationError,
  isAuthenticationError,
} from '@/lib/utils/auth-redirect';

function shouldRedirectToSchoolSetup(pathname: string): boolean {
  return (
    !pathname.includes('/setup') &&
    !pathname.includes('/onboarding') &&
    !pathname.includes('/login') &&
    !pathname.includes('/signup')
  );
}

function isMissingSchoolConfigMessage(message: string): boolean {
  return (
    message.includes('School configuration not found') ||
    message.includes('Complete school setup') ||
    message.includes('School setup is not complete')
  );
}

export function useSchoolConfig(enabled: boolean = true) {
  const [config, setConfig] = useState<SchoolConfiguration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setConfig: setStoreConfig } = useSchoolConfigStore();

  const query = useQuery({
    queryKey: ['schoolConfig'],
    queryFn: async () => {
      if (typeof window === 'undefined') {
        throw new Error('useSchoolConfig can only be used on the client side');
      }

      setLoading(true);
      setError(null);

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        const accessToken = window.localStorage.getItem('accessToken');
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch('/api/graphql', {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify({
            query: `
              query GetSchoolConfiguration {
                getSchoolConfiguration {
                  id
                  selectedLevels {
                    id
                    name
                    description
                    subjects {
                      id
                      name
                      code
                      subjectType
                      category
                      department
                      shortName
                      isCompulsory
                      totalMarks
                      passingMarks
                      creditHours
                      curriculum
                    }
                    gradeLevels {
                      id
                      name
                      age
                      streams {
                        id
                        name
                      }
                    }
                  }
                  tenant {
                    id
                    schoolName
                    subdomain
                  }
                }
              }
            `,
          }),
        });

        let payload: {
          data?: { getSchoolConfiguration?: SchoolConfiguration };
          errors?: Array<{ message?: string }>;
          error?: string;
        };

        try {
          payload = await response.json();
        } catch {
          throw {
            response: {
              status: response.status,
              errors: [{ message: 'Invalid response from server' }],
            },
          };
        }

        if (!response.ok) {
          const firstError = payload.errors?.[0];
          const message =
            firstError?.message?.trim() ||
            payload.error ||
            `Request failed (${response.status})`;

          if (
            (response.status === 404 ||
              isMissingSchoolConfigMessage(message)) &&
            shouldRedirectToSchoolSetup(window.location.pathname)
          ) {
            window.location.href = '/setup';
            return null;
          }

          throw {
            response: {
              status: response.status,
              errors: payload.errors ?? [{ message }],
            },
          };
        }

        if (payload.errors?.length) {
          const message =
            payload.errors[0]?.message?.trim() ||
            'Could not load school configuration';

          if (
            isMissingSchoolConfigMessage(message) &&
            shouldRedirectToSchoolSetup(window.location.pathname)
          ) {
            window.location.href = '/setup';
            return null;
          }

          throw {
            response: {
              status: 500,
              errors: payload.errors,
            },
          };
        }

        const schoolConfig = payload.data?.getSchoolConfiguration;
        if (!schoolConfig) {
          const message = 'School configuration not found';
          if (shouldRedirectToSchoolSetup(window.location.pathname)) {
            window.location.href = '/setup';
            return null;
          }
          throw {
            response: {
              status: 404,
              errors: [{ message }],
            },
          };
        }

        setConfig(schoolConfig);
        setStoreConfig(schoolConfig);
        return schoolConfig;
      } catch (err) {
        const message = getGraphqlFailureMessage(
          err,
          'Could not load school configuration',
        );
        console.error('useSchoolConfig error:', message);

        if (
          isMissingSchoolConfigMessage(message) &&
          shouldRedirectToSchoolSetup(window.location.pathname)
        ) {
          window.location.href = '/setup';
          return null;
        }

        if (isAuthenticationError(err)) {
          handleAuthenticationError(err);
          return null;
        }

        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    retry: (failureCount, err) => {
      if (isAuthenticationError(err)) return false;
      const message = getGraphqlFailureMessage(err, '');
      if (isMissingSchoolConfigMessage(message)) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: false,
    enabled,
  });

  return query;
}
