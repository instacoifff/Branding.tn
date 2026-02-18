import { motion } from "framer-motion";

const Files = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Files</h1>
            <p className="text-muted-foreground">File browser implementation coming soon.</p>
        </motion.div>
    );
};

export default Files;
