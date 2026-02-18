import { motion } from "framer-motion";

const FilesVault = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Files Vault</h1>
            <p className="text-muted-foreground">Global file management coming soon.</p>
        </motion.div>
    );
};

export default FilesVault;
