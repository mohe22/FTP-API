import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import axios, { AxiosError } from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useWebSocket } from "@/context/web-socket-provider";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});


export default function Login() {
  const nav = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });



 

  async function onSubmit(values: z.infer<typeof formSchema>) {
    
    try {
      const res = await axiosInstance.post("/auth/login", values)
      if (res.data.status_code==307 && res.data.detials.includes("otp")) {
        toast.success("sending verification code"); 
      }else{
        nav("/")
      }
    } catch (error:any ) {      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response && axiosError.response.status === 401) {
          toast.error("Invalid username or password");  
        }
        else if (axiosError.response && axiosError.response.status === 403) {
          toast.error("Account is blocked. Please contact the admin.");  
        }
        else {
          toast.error("An error occurred. Please try again later.");
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
      
    }
   
  }


  

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">FTP Client</h1>
          <p className="mt-2 text-muted-foreground">
            Connect to your FTP server and manage your files
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
           
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting  ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}