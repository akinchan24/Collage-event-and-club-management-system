import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Calendar, Users, Award, Star } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string(), // Any password is accepted
});

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string(), // Any password is accepted
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { username, password } = data;
    registerMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Auth Forms */}
      <div className="w-full md:w-1/2 px-6 py-12 md:px-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.996.002 1.069c0 .655-.532 1.19-1.18 1.187H6.5c-.648 0-1.18.533-1.18 1.187v1.802c0 .653.532 1.187 1.18 1.187h.396c-.149.382-.229.8-.229 1.229v.039c0 .858.672 1.542 1.5 1.542.828 0 1.5-.684 1.5-1.542v-.039c0-.429-.08-.847-.228-1.229h2.462c-.149.382-.229.8-.229 1.229v.039c0 .858.672 1.542 1.5 1.542.828 0 1.5-.684 1.5-1.542v-.039c0-.429-.08-.847-.228-1.229h.228c.648 0 1.179-.534 1.179-1.187v-1.685c0-.194-.273-.807-.273-.807 0-.48.39-.88.87-.881h.002l1.188-.005c.468-.002.846-.377.846-.843l.003-1.178 3.044-1.292a1 1 0 000-1.84l-7-3z" />
              </svg>
            </div>
            <h1 className="font-poppins font-bold text-2xl">CampusConnect</h1>
            <p className="text-muted-foreground mt-2">Your campus events and clubs platform</p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Log in"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-primary to-accent hidden md:flex flex-col justify-center items-center p-12 text-white">
        <div className="max-w-lg">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">
            Connect with your campus community
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Discover events, join clubs, and track your campus involvement all in one place.
          </p>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Discover Events</h3>
                <p className="opacity-80">
                  Browse and register for campus events that match your interests
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Join Clubs</h3>
                <p className="opacity-80">
                  Explore and become a member of various student clubs and organizations
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Track Activities</h3>
                <p className="opacity-80">
                  Keep track of your involvement and earn recognition for your participation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
