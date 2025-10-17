import {SubmitHandler, useForm} from "react-hook-form";
import {Form} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {LoginFormValues} from "@/types/auth";
import {FormInput, FormPassword} from "@/components/custom/forms";
import {APP_CONFIG} from "@/constants/config";
import {Loader2, Mail, Lock, LogIn} from "lucide-react";

const loginFormSchema = z.object({
  email: z.string().email({message: "Invalid email address"}),
  password: z.string().min(1, {message: "Password is required"}),
})

type Props = {
  onFormSubmit: SubmitHandler<LoginFormValues>
  loading?: boolean
}

const LoginForm = ({onFormSubmit, loading}: Props) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: APP_CONFIG.demoUser.email,
      password: APP_CONFIG.demoUser.password,
    },
  });

  const formList = {
    email: {
      name: "email",
      label: "Email Address",
      placeholder: "student@example.com",
    },
    password: {
      name: "password",
      label: "Password",
      placeholder: "Enter your secure password",
    },
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-5">
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-9.5 h-4 w-4 text-muted-foreground" />
            <FormInput 
              form={form} 
              item={formList.email} 
              className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background/70 transition-all duration-200"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-9.5 h-4 w-4 text-muted-foreground" />
            <FormPassword 
              form={form} 
              item={formList.password} 
              className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background/70 transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2 text-muted-foreground cursor-pointer">
            <input type="checkbox" className="rounded border-border" />
            <span>Remember me</span>
          </label>
          <a href="#" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Forgot password?
          </a>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-lg hover:shadow-xl" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            New to SiCerdas?{" "}
            <a href="#" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Create an account
            </a>
          </p>
        </div>
      </form>
    </Form>
  )
}
export default LoginForm;