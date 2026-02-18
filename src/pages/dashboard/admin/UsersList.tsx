import { motion } from "framer-motion";

const UsersList = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Users</h1>
            <p className="text-muted-foreground">User management coming soon.</p>
        </motion.div>
    );
};

export default UsersList;
