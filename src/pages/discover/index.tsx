import { motion } from "framer-motion";

export default function DiscoverPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 pt-24 pb-12"
    >
      <h1 className="mb-6 font-poppins text-3xl font-bold">Discover</h1>
      <div className="grid gap-6">
        <p className="text-muted-foreground">
          Explore new content from Overseerr/Jellyseerr.
        </p>
        {/* We will implement the actual discover content here later */}
      </div>
    </motion.div>
  );
}
