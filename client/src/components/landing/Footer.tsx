
import type React from "react"

import { motion } from "framer-motion"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <a href="/" className="flex items-center space-x-2 mb-4">
              <motion.div
                className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="text-white font-bold text-sm">FTP</span>
              </motion.div>
              <span className="text-lg font-bold text-blue-600">SecureShare</span>
            </a>
            <p className="text-muted-foreground mb-4 max-w-md">
              A modern, secure FTP server solution with advanced features for file management, user control, and
              security.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={<Github className="h-5 w-5" />} label="GitHub" />
              <SocialLink href="#" icon={<Twitter className="h-5 w-5" />} label="Twitter" />
              <SocialLink href="#" icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" />
              <SocialLink href="#" icon={<Mail className="h-5 w-5" />} label="Email" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <FooterLink href="#features">Features</FooterLink>
              <FooterLink href="#interface">Interface</FooterLink>
              <FooterLink href="#admin">Admin Tools</FooterLink>
              <FooterLink href="#security">Security</FooterLink>
              <FooterLink href="#">Pricing</FooterLink>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <FooterLink href="#">About Us</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
              <FooterLink href="#">Contact</FooterLink>
              <FooterLink href="#">Legal</FooterLink>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SecureShare FTP. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={href} aria-label={label}>
      <motion.div
        className="w-10 h-10 rounded-full border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>
    </a>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a href={href} className="text-muted-foreground hover:text-foreground transition-colors">
        {children}
      </a>
    </li>
  )
}

