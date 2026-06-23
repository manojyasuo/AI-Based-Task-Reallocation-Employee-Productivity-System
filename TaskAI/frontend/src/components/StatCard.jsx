import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, delay = 0 }) => {
    return (
        <motion.div 
            className="glass-panel"
            style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
        >
            <div style={{ padding: '15px', background: 'rgba(102, 252, 241, 0.1)', borderRadius: '12px', color: 'var(--accent-color)' }}>
                {icon}
            </div>
            <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '5px' }}>{title}</p>
                <h3 style={{ fontSize: '1.8rem' }}>{value}</h3>
            </div>
        </motion.div>
    );
};

export default StatCard;
