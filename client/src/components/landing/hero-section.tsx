
import { motion } from "framer-motion"
import { ArrowRight, Upload, Download, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium text-sm">
                Secure File Transfer Made Simple
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-blue-600">Modern FTP Server</span> for Seamless File Management
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                A powerful, secure, and user-friendly FTP solution with advanced features for both users and
                administrators.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
              <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-xl" />
              <div className="relative bg-background rounded-xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="ml-2 text-sm font-medium">SecureShare FTP</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="text-sm font-medium">Upload Files</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="text-sm font-medium">Download Files</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="text-sm font-medium">Secure Access</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="text-sm font-medium">User Management</span>
                    </div>
                  </div>
                    <img
                        className="w-full min-h-[300px] h-full"
                        src="./table.png"
                    />
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -top-6 -right-6 w-20 h-20 bg-blue-500 rounded-full opacity-10 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
            <motion.div
              className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500 rounded-full opacity-10 blur-xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

