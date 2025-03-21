import { z } from "zod";

export const UpdateForm = z.object({
  file: z.any(),
});



export const UserSchema = z.object({
  avatar: z.string().nullable(),
  bio: z.string(),
  email: z.string().email(),
  groups: z.array(z.string()),
  id: z.number(),
  is_admin: z.boolean(),
  last_active: z.string(),
  location: z.string(),
  phone: z.string(),
  status: z.string(),
  username: z.string(),
});




export const CreateUserSchema = z.object({
  username: z.string(), // Username is required
  password: z.string().min(8, "Password must be at least 8 characters long"), // Password is required and must be at least 8 characters
  email: z.string().email("Invalid email address"), // Email is required and must be a valid email
  location: z.string().optional(), // Location is optional
  phone: z.string().optional(), // Phone is optional
  bio: z.string().optional(), // Bio is optional
  is_admin: z.boolean().default(false), // is_admin is optional and defaults to false
  avatar:z.string().nullable(),
});





const isValidIPOrSubnet = (value: string): boolean => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
  const ipList = value.split(/[,-]/).map((ip) => ip.trim());
  return ipList.every((ip) => ipRegex.test(ip));
};

export const SecuritySettingsSchema = z.object({
  twoFactorEnabled: z.boolean(),
  passwordExpiry: z.number().min(1, "Password expiry must be at least 1 day"),
  loginAttempts: z.number().min(1, "Login attempts must be at least 1"),
  sessionTimeout: z.number().min(1, "Session timeout must be at least 1 minute"),
  ipRestriction: z.boolean().default(false),
  allowedIPs: z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      // Access the entire data object being validated
      const data = ctx as unknown as { ipRestriction: boolean };
      if (data.ipRestriction && !isValidIPOrSubnet(value || "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid IP address or subnet. Use commas (,) or hyphens (-) to separate multiple IPs.",
        });
      }
    }),
});

export const UpdateGroupDetails = z.object({
  group_name:z.string().min(1,"Group name is required"),
  description:z.string().max(200,"group description must be less than 200 characters"),
  created_at:z.string(),
});

export const CreateGroupSchema = z.object({
  name:z.string().min(1,"Group name is required"),
  description:z.string().max(200,"group description must be less than 200 characters"),
});

export type UpdateGroupDetailsType = z.infer<typeof UpdateGroupDetails>;
export type SecuritySettingsFormValues = z.infer<typeof SecuritySettingsSchema>;
export type UserFormType = z.infer<typeof CreateUserSchema>;
export type CreateGroupSchemaType = z.infer<typeof CreateGroupSchema>;
export type UploadFormType = z.infer<typeof UpdateForm>;


export type User = z.infer<typeof UserSchema>;
