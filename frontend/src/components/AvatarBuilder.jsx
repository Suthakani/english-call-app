import { useState } from "react";
import { BigHead } from "@bigheads/core";

// Every value below was verified against @bigheads/core's internal
// component/color maps — using a value outside these lists throws
// "Cannot read properties of undefined (reading 'base')" or an
// "Element type is invalid" crash from inside the library.
const OPTIONS = {
  skinTone: ["light", "yellow", "brown", "dark", "red", "black"],
  body: ["chest", "breasts"],
  clothing: ["naked", "dress", "vneck", "tankTop", "dressShirt", "shirt"],
  clothingColor: ["blue", "black", "green", "red", "white"],
  hairColor: ["black", "blonde", "brown", "blue", "pink", "orange", "white"],
  hair: ["none", "afro", "balding", "bob", "bun", "buzz", "long", "pixie", "short"],
  facialHair: ["none", "stubble", "mediumBeard"],
  eyebrows: ["angry", "concerned", "leftLowered", "raised", "serious"],
  eyes: ["normal", "content", "dizzy", "happy", "heart", "leftTwitch", "simple", "squint", "wink"],
  mouth: ["grin", "lips", "openSmile", "sad", "serious", "open", "tongue"],
  faceMask: [false, true],
  lashes: [false, true],
  mask: [false, true],
  accessory: ["none", "roundGlasses", "tinyGlasses", "shades"],
  hat: ["none", "beanie", "turban"],
  hatColor: ["blue", "black", "green", "red", "white"],
};

// Which fields render as color swatches vs. readable text pills.
const COLOR_FIELDS = new Set(["skinTone", "hairColor", "clothingColor", "hatColor"]);

// Real hex values pulled straight from @bigheads/core's own color map,
// so every swatch shows the true rendered color instead of a 2-letter code.
const SWATCH_HEX = {
  skinTone: { light: "#fdd2b2", yellow: "#FBE8B3", brown: "#D8985D", dark: "#A56941", red: "#CC734C", black: "#754437" },
  hairColor: { black: "#592d3d", blonde: "#FEDC58", brown: "#A56941", blue: "#85c5e5", pink: "#D69AC7", orange: "#D96E27", white: "#ffffff" },
  clothingColor: { blue: "#85c5e5", black: "#633749", green: "#89D86F", red: "#D67070", white: "#FFFFFF" },
  hatColor: { blue: "#85c5e5", black: "#633749", green: "#89D86F", red: "#D67070", white: "#FFFFFF" },
};

const LABELS = {
  skinTone: "Skin Tone",
  body: "Body",
  clothing: "Outfit",
  clothingColor: "Outfit Color",
  hairColor: "Hair Color",
  hair: "Hair Style",
  facialHair: "Facial Hair",
  eyebrows: "Eyebrows",
  eyes: "Eyes",
  mouth: "Mouth",
  faceMask: "Face Mask",
  lashes: "Lashes",
  mask: "Mask",
  accessory: "Glasses",
  hat: "Hat",
  hatColor: "Hat Color",
};

// Human-readable text for the non-color option buttons (used instead of
// truncated 2-letter codes so the picker is actually legible).
const VALUE_LABELS = {
  chest: "Chest", breasts: "Curvy",
  naked: "Bare", dress: "Dress", vneck: "V-Neck", tankTop: "Tank Top", dressShirt: "Dress Shirt", shirt: "Shirt",
  none: "None", afro: "Afro", balding: "Balding", bob: "Bob", bun: "Bun", buzz: "Buzz Cut", long: "Long", pixie: "Pixie", short: "Short",
  stubble: "Stubble", mediumBeard: "Beard",
  angry: "Angry", concerned: "Concerned", leftLowered: "Raised (L)", raised: "Raised", serious: "Serious",
  normal: "Normal", content: "Content", dizzy: "Dizzy", happy: "Happy", heart: "Heart Eyes", leftTwitch: "Wink (L)", simple: "Simple", squint: "Squint", wink: "Wink",
  grin: "Grin", lips: "Lips", openSmile: "Open Smile", sad: "Sad", open: "Open", tongue: "Tongue",
  roundGlasses: "Round", tinyGlasses: "Tiny", shades: "Shades",
  beanie: "Beanie", turban: "Turban",
};

const DEFAULT_CONFIG = {
  accessory: "none",
  body: "chest",
  clothing: "shirt",
  clothingColor: "blue",
  eyebrows: "raised",
  eyes: "normal",
  faceMask: false,
  facialHair: "none",
  graphic: "none",
  hair: "short",
  hairColor: "black",
  hat: "none",
  hatColor: "black",
  lashes: false,
  mask: false,
  faceMaskColor: "white",
  mouth: "grin",
  skinTone: "light",
};

function randomConfig() {
  const cfg = { ...DEFAULT_CONFIG };
  Object.keys(OPTIONS).forEach((key) => {
    const values = OPTIONS[key];
    cfg[key] = values[Math.floor(Math.random() * values.length)];
  });
  return cfg;
}

// Guards against a stale/corrupted initialConfig (e.g. loaded from a
// user's saved profile before this fix) containing an old invalid value
// like "purple" or "moustache" — falls back to the safe default for any
// key whose stored value isn't in the current valid OPTIONS list.
function sanitizeConfig(cfg) {
  if (!cfg) return DEFAULT_CONFIG;
  const safe = { ...DEFAULT_CONFIG };
  Object.keys(OPTIONS).forEach((key) => {
    if (OPTIONS[key].includes(cfg[key])) safe[key] = cfg[key];
  });
  if (cfg.graphic !== undefined) safe.graphic = cfg.graphic;
  if (cfg.faceMaskColor !== undefined) safe.faceMaskColor = cfg.faceMaskColor;
  return safe;
}

// Fields shown together in a compact row of Yes/No toggles instead of
// each taking a full labeled row of their own.
const TOGGLE_FIELDS = ["faceMask", "lashes", "mask"];

export default function AvatarBuilder({ initialConfig, onSave, onCancel }) {
  const [config, setConfig] = useState(() => sanitizeConfig(initialConfig));

  const updateOption = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const mainFields = Object.keys(OPTIONS).filter((k) => !TOGGLE_FIELDS.includes(k));

  return (
    <div className="avatar-builder">
      <div className="avatar-builder-preview">
        <div style={{ width: 140, height: 140 }}>
          <BigHead {...config} />
        </div>
        <button className="avatar-builder-random" onClick={() => setConfig(randomConfig())}>
          🎲 Randomize
        </button>
      </div>

      <div className="avatar-builder-controls">
        {/* Compact toggle row for the three boolean extras */}
        <div className="avatar-builder-row">
          <span className="avatar-builder-label">Extras</span>
          <div className="avatar-builder-toggle-group">
            {TOGGLE_FIELDS.map((key) => (
              <div className="avatar-builder-toggle-item" key={key}>
                <span className="avatar-builder-toggle-name">{LABELS[key]}</span>
                <div className="avatar-builder-swatches">
                  {[false, true].map((val) => (
                    <button
                      key={String(val)}
                      className={`avatar-pill${config[key] === val ? " active" : ""}`}
                      onClick={() => updateOption(key, val)}
                    >
                      {val ? "On" : "Off"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {mainFields.map((key) => {
          const values = OPTIONS[key];
          const isColor = COLOR_FIELDS.has(key);
          return (
            <div className="avatar-builder-row" key={key}>
              <span className="avatar-builder-label">{LABELS[key]}</span>
              <div className="avatar-builder-swatches">
                {values.map((val) => {
                  const isActive = config[key] === val;
                  if (isColor) {
                    return (
                      <button
                        key={val}
                        className={`avatar-swatch avatar-swatch-color${isActive ? " active" : ""}`}
                        style={{ background: SWATCH_HEX[key][val] }}
                        onClick={() => updateOption(key, val)}
                        title={val}
                        aria-label={val}
                      />
                    );
                  }
                  return (
                    <button
                      key={val}
                      className={`avatar-pill${isActive ? " active" : ""}`}
                      onClick={() => updateOption(key, val)}
                    >
                      {VALUE_LABELS[val] || val}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="avatar-builder-actions">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={() => onSave(config)}>Save Avatar</button>
      </div>
    </div>
  );
}
/* ── Append to profile.css — supports the improved AvatarBuilder UI ── */
