import {useMutation, useQuery} from "@tanstack/react-query";
import {useAuth} from "@/hooks/use-auth";
import {useNavigate, useRouter} from "@tanstack/react-router";
import {fetchApi} from "@/lib/fetch-api";
import {AppApi} from "@/constants/app-api";
import {authClient} from "@/lib/auth-client";
import {AuthProps} from "@/types/auth";

export const getSession = async () => {
  try {
  const response = await fetchApi({ method: "GET", url: AppApi.auth.getSession });
  return response;
  } catch (error) {
    return({token: null, user: null})
  }
};

export const useLoginMutation = () => {
  const auth = useAuth();

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async ({body}: { body: Record<string, any> }) => {
      const response = await fetchApi({method: "POST", url: AppApi.auth.signIn, body: body, headers: {'Content-Type': 'multipart/form-data'}});

      let userData: AuthProps = {token: null, user: null};
      if (response?.token) {
        userData = {
          token: response.token,
          user: response.user
        }
      } else {
        throw new Error("Error get session");
      }

      await (auth.login(userData));
      return(userData);
    },
  });
}

export const useSignUpMutation = () => {
  return useMutation({
    mutationKey: ['signUp'],
    mutationFn: async ({body}: { body: Record<string, any> }) => {
      const response = await fetchApi({method: "POST", url: AppApi.auth.signUp, body: body});
      return(response);
    },
  });
}

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationKey: ['forgotPassword'],
    mutationFn: async ({body}: { body: Record<string, any> }) => {
      const response = await fetchApi({method: "POST", url: AppApi.auth.forgotPassword, body: body, headers: {'Content-Type': 'application/json'}});
      return(response);
    },
  });
}

export const useEmailOtpForgetPasswordMutation = () => {
  return useMutation({
    mutationKey: ['emailOtpForgetPassword'],
    mutationFn: async ({body}: { body: Record<string, any> }) => {
      const response = await fetchApi({method: "POST", url: AppApi.auth.emailOtpForgetPassword, body: body, headers: {'Content-Type': 'application/json'}});
      return(response);
    },
  });
}

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationKey: ['resetPassword'],
    mutationFn: async ({body}: { body: Record<string, any> }) => {
      const response = await fetchApi({method: "POST", url: AppApi.auth.resetPassword, body: body, headers: {'Content-Type': 'application/json'}});
      return(response);
    },
  });
}

export const useCheckResetTokenQuery = (token: string | undefined) => {
  return useQuery({
    queryKey: ['checkResetToken', token],
    queryFn: async () => {
      if (!token) {
        throw new Error("Token is required");
      }
      
      const response = await fetchApi({method: "POST", url: AppApi.auth.checkResetToken, body: { token }, headers: {'Content-Type': 'application/json'}});
      return response;
    },
    enabled: !!token, // Only run the query if token exists
    retry: false, // Don't retry on failure
  });
}

export const useEmailOtpVerifyForgetPasswordMutation = () => {
  return useMutation({
    mutationKey: ['emailOtpVerifyForgetPassword'],
    mutationFn: async ({body}: { body: Record<string, any> }) => {
      const response = await fetchApi({method: "POST", url: AppApi.auth.emailOtpVerifyForgetPassword, body: body, headers: {'Content-Type': 'application/json'}});
      return(response);
    },
  });
}

export const useEmailOtpResetPasswordMutation = () => {
  return useMutation({
    mutationKey: ['emailOtpResetPassword'],
    mutationFn: async ({body}: { body: Record<string, any> }) => {
      const response = await fetchApi({method: "POST", url: AppApi.auth.emailOtpResetPassword, body: body, headers: {'Content-Type': 'application/json'}});
      return(response);
    },
  });
}

export const useEmailHasOtpQuery = (email: string | undefined) => {
  return useQuery({
    queryKey: ['emailHasOtp', email],
    queryFn: async () => {
      if (!email) {
        throw new Error("Email is required");
      }
      
      const response = await fetchApi({method: "POST", url: AppApi.auth.emailHasOtp, body: { email }, headers: {'Content-Type': 'application/json'}});
      return response;
    },
    enabled: !!email, // Only run the query if email exists
    retry: false, // Don't retry on failure
  });
}

export const useLogoutMutation = () => {
  const auth = useAuth();
  const router = useRouter()
  const navigate = useNavigate()

  return (
    useMutation({
      mutationKey: ['logout'],
      mutationFn: async () => {
        auth.logout().then(() => {
          router.invalidate().finally(() => {
          })
        })

        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
            },
            onError: () => {
            },
          },
        });
        navigate({to: '/'}).then(() => {});
      },
    })
  )
}