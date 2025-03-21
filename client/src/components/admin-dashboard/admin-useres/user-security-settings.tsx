import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import BoxContainer from "@/components/box-container";
import { SecuritySettingsFormValues, SecuritySettingsSchema } from "@/lib/definition";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import axiosInstance from "@/lib/axios";

interface UserSecuritySettingsProps {
  userId: string;
  data: SecuritySettingsFormValues;
}

export function UserSecuritySettings({ userId, data }: UserSecuritySettingsProps) {
  const form = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(SecuritySettingsSchema),
    defaultValues: {
      twoFactorEnabled: data.twoFactorEnabled || false,
      passwordExpiry: data.passwordExpiry || 90,
      loginAttempts: data.loginAttempts || 5,
      sessionTimeout: data.sessionTimeout || 30,
      allowedIPs: data.allowedIPs || "",
      ipRestriction: data.ipRestriction || false,
    },
  });

  
  const [newPassword, setNewPassword] = React.useState({
    current: "",
    password: "",
    confirm: "",
  });

  const onSubmit = async (values: SecuritySettingsFormValues) => {
    try {
      await axiosInstance.patch(`/admin/users/update-security-settings/${userId}`, values);
      toast("The user security settings have been updated successfully.");
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Unexpected Error";
      toast(msg);
    }
  };

  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.password !== newPassword.confirm) {
      toast("Passwords do not match.");
      return;
    }

    try {
      await axiosInstance.patch(`/admin/users/update-password/${userId}`, {
        old: newPassword.current,
        new: newPassword.password,
      });

      setNewPassword({
        current: "",
        password: "",
        confirm: "",
      });

      toast("The user password has been updated successfully.");
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Unexpected Error";
      toast(msg);
    }
  };

  return (
    <div className="space-y-6">
      <BoxContainer>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Manage user security and access settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="twoFactorEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require a verification code in addition to password.</p>
                    </div>
                    <FormControl>
                      <Switch
                        id="two-factor"
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="passwordExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                      <FormControl>
                        <Input
                          id="password-expiry"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="loginAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="login-attempts">Max Failed Login Attempts</Label>
                      <FormControl>
                        <Input
                          id="login-attempts"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sessionTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <FormControl>
                        <Input
                          id="session-timeout"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ipRestriction"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ip-restriction">IP Restriction</Label>
                      <FormControl>
                        <Switch
                          id="ip-restriction"
                          checked={Boolean(field.value)}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    {field.value && (
                      <FormField
                        control={form.control}
                        name="allowedIPs"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                            <FormControl>
                              <Input
                                id="allowed-ips"
                                type="text"
                                placeholder="e.g. 192.168.1.1, 10.0.0.1"
                                {...field}
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Enter comma-separated IP addresses or CIDR ranges.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-end p-0 gap-x-2">
                <Button type="button" variant={"outline"} onClick={() => form.reset()}>
                  Reset
                </Button>
                <Button type="submit">Save Settings</Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </BoxContainer>

      <BoxContainer>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Change the user's password. They will be required to log in again.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onPasswordSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={newPassword.current}
                onChange={(e) => setNewPassword({ ...newPassword, current: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword.password}
                onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={newPassword.confirm}
                onChange={(e) => setNewPassword({ ...newPassword, confirm: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="mt-2">
              Reset Password
            </Button>
          </form>
        </CardContent>
      </BoxContainer>
    </div>
  );
}