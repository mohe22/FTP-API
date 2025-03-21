
import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Upload, Download, FileText, FolderTree, Lock, Shield } from "lucide-react"

export function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const features = [
    {
      icon: <Upload className="h-10 w-10 text-blue-600" />,
      title: "Fast File Uploads",
      description: "Upload files of any size with our optimized transfer protocol for maximum speed and reliability.",
    },
    {
      icon: <Download className="h-10 w-10 text-blue-600" />,
      title: "Secure Downloads",
      description: "Download your files securely with encrypted connections and verified file integrity.",
    },
    {
      icon: <FileText className="h-10 w-10 text-blue-600" />,
      title: "Table View",
      description: "View your files in a detailed table format with sorting and filtering capabilities.",
    },
    {
      icon: <FolderTree className="h-10 w-10 text-blue-600" />,
      title: "Tree Structure",
      description: "Navigate through your files with an intuitive tree structure for easy folder management.",
    },
    {
      icon: <Lock className="h-10 w-10 text-blue-600" />,
      title: "Permission Controls",
      description: "Set granular permissions for users and groups to control access to files and folders.",
    },
    {
      icon: <Shield className="h-10 w-10 text-blue-600" />,
      title: "Anti-Virus Scanning",
      description: "Automatic virus scanning for all uploaded files to ensure your server remains secure.",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Modern File Management</h2>
            <p className="text-lg text-muted-foreground">
              Our FTP server comes packed with features designed to make file management secure, efficient, and
              user-friendly.
            </p>
          </motion.div>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-background border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="mb-4 p-3 rounded-lg inline-block bg-blue-100 dark:bg-blue-900/30">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

