import { motion } from "framer-motion";

function GoalCard({ goal, onSelect, selected }) {
  return (
    <motion.button
      onClick={() => onSelect(goal.id)}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative w-full overflow-hidden rounded-3xl border p-6 text-left shadow-sm transition-all duration-300 ${
        selected
          ? "border-green-700 bg-green-50 shadow-xl shadow-green-900/10"
          : "border-white/70 bg-white/75 hover:shadow-xl"
      }`}
    >
      {/* Background glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${goal.color} opacity-50 transition-opacity group-hover:opacity-80`}
      />

      <div className="relative">
        {/* Icon */}
        <motion.div
          animate={selected ? { rotate: [0, -8, 8, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm"
        >
          {goal.icon}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-green-950">
          {goal.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {goal.description}
        </p>

        {/* Selected state */}
        <div className="mt-5 flex items-center justify-between">
          <span
            className={`text-sm font-medium ${
              selected ? "text-green-800" : "text-gray-500"
            }`}
          >
            {selected ? "Selected ✓" : "Explore"}
          </span>

          <motion.span
            animate={selected ? { x: [0, 5, 0] } : {}}
            transition={{ duration: 0.8, repeat: selected ? Infinity : 0 }}
            className="text-lg text-green-800"
          >
            →
          </motion.span>
        </div>
      </div>
    </motion.button>
  );
}

export default GoalCard;