import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

const Logo = ({ size = "md", showTagline = false }: LogoProps) => {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <motion.div 
      className="flex flex-col items-start"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`${sizes[size]} font-extrabold tracking-tight flex items-center`}>
        <span className="text-foreground">More</span>
        <motion.span 
          className="text-primary"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          .
        </motion.span>
        <span className="text-foreground">ad</span>
      </div>
      {showTagline && (
        <motion.p 
          className="text-muted-foreground text-xs mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          More reach. More sales.
        </motion.p>
      )}
    </motion.div>
  );
};

export default Logo;
