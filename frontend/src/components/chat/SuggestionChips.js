const suggestions = [
  { text: "Why is my risk high?", icon: "fas fa-question-circle" },
  { text: "What should I eat?", icon: "fas fa-utensils" },
  { text: "Can I reverse this?", icon: "fas fa-heart" },
  { text: "What exercises are safe?", icon: "fas fa-running" }
];

export default function SuggestionChips({ onSelect, disabled }) {
  return (
    <div className="suggestion-chips-container">
      <p className="chips-label">Quick questions:</p>
      <div className="chips">
        {suggestions.map((s, i) => (
          <button 
            key={i} 
            className="chip-btn"
            onClick={() => onSelect(s.text)}
            disabled={disabled}
            title={s.text}
          >
            <i className={s.icon}></i>
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
