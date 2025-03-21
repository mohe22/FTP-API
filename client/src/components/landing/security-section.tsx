

import { motion } from "framer-motion"
import { Shield, Lock, FileCheck, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function SecuritySection() {
  
  return (
    <section id="security" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Security</h2>
            <p className="text-lg text-muted-foreground">
              Keep your files and data secure with our comprehensive security features and anti-virus protection.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Anti-Virus Protection</h3>
                <p className="text-muted-foreground">
                  All uploaded files are automatically scanned for viruses and malware before being stored on the
                  server, ensuring your data remains secure.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Encrypted Transfers</h3>
                <p className="text-muted-foreground">
                  All file transfers are encrypted using industry-standard protocols to protect your data during
                  transmission.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">File Integrity Verification</h3>
                <p className="text-muted-foreground">
                  Automatic checksum verification ensures files are not corrupted or tampered with during transfer.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-background border rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="ml-2 text-sm font-medium">Anti-Virus Scanner</div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">File Upload Security Check</h3>
                <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
                  In Progress
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Scanning document.pdf</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <Card className="border-green-200 dark:border-green-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium">report.pdf</p>
                      <p className="text-xs text-muted-foreground">No threats detected</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-sm font-medium">suspicious.exe</p>
                      <p className="text-xs text-red-600 dark:text-red-400">Malware detected - Upload blocked</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Security Alert</p>
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        Potentially unsafe file detected. Administrator review required.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  Our anti-virus engine scans all files before they are stored on the server, protecting your data from
                  malware, viruses, and other threats.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

