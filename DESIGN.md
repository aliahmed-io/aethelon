# Aethelon Furniture Store - Design System

## 1. Brand Identity

**Brand Name:** Aethelon  
**Tagline:** Furniture for the Soul  
**Personality:** Warm, luxurious, artisanal, inviting, premium yet approachable

---

## 2. Color Palette - Creamy Luxury

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Cream White | `#FAF7F2` | Primary background |
| Warm Ivory | `#F5F0E6` | Secondary background |
| Soft Linen | `#EDE6D8` | Cards, containers |
| Sandy Beige | `#D6C9B6` | Borders, dividers |

### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| Burnished Gold | `#C9912B` | CTAs, highlights |
| Rich Amber | `#B8860B` | Hover states |
| Antique Bronze | `#8B7355` | Icons, accents |

### Text Colors
| Name | Hex | Usage |
|------|-----|-------|
| Deep Espresso | `#2C2416` | Primary text |
| Warm Charcoal | `#4A3F35` | Secondary text |
| Muted Taupe | `#8B7D6B` | Caption, muted text |

### Supporting Colors
| Name | Hex | Usage |
|------|-----|-------|
| Sage Green | `#8B9A77` | Success, nature |
| Dusty Rose | `#C4A4A4` | Soft accent |
| Slate Blue | `#6B7B8C` | Info, links |

---

## 3. Typography

### Font Families
- **Display:** Playfair Display (serif) - Headlines, hero text
- **Body:** Inter or DM Sans (sans-serif) - Body text, UI
- **Accent:** Cormorant Garamond (serif) - Quotes, special callouts

### Type Scale
| Level | Size | Weight | Use |
|-------|------|--------|-----|
| Hero | 80-120px | 400 | Landing page hero |
| Display | 56-72px | 400 | Section headers |
| H1 | 40-48px | 600 | Page titles |
| H2 | 32-36px | 600 | Section titles |
| H3 | 24-28px | 600 | Subsections |
| Body Large | 18-20px | 400 | Lead paragraphs |
| Body | 16px | 400 | Main content |
| Caption | 12-14px | 500 | Labels, metadata |

---

## 4. Visual Style

### Imagery
- Warm, natural lighting
- Lifestyle photography showing furniture in real homes
- Close-up texture shots (wood grain, fabric weave, leather patina)
- Earth tones and soft shadows
- Human presence (hands, silhouettes) to add warmth

### Shapes & Elements
- Soft, rounded corners (16-24px radius)
- Organic, flowing curves
- Subtle grain/noise texture overlays
- Gentle shadows (warm undertones, not black)

### Spacing
- 8pt grid system
- Generous whitespace
- Breathing room between sections (120-160px)
- Comfortable padding (24-48px)

---

## 5. Interactive States

### Buttons
- Primary: Gold background, cream text, subtle glow on hover
- Secondary: Transparent with gold border, fill on hover
- Rounded or pill-shaped

### Hover Effects
- Subtle scale (1.02-1.05)
- Gentle color transitions (300ms)
- Image zoom within containers
- Underline reveal for links

### Animations
- Smooth, elegant timing (400-600ms)
- Ease-out curves
- Fade + slide combinations
- Particle effects as per landing page

---

## 6. Design System Notes for Stitch Generation

**CRITICAL: Include this section in all Stitch prompts**

```
DESIGN SYSTEM:
- Background: Creamy white (#FAF7F2) with soft ivory (#F5F0E6) accents
- Text: Deep espresso (#2C2416) for headings, warm charcoal (#4A3F35) for body
- Accent: Burnished gold (#C9912B) for CTAs and highlights
- Typography: Playfair Display for headings (serif, elegant), Inter for body (clean, modern)
- Corners: Soft rounded (16-24px radius)
- Shadows: Warm, subtle (rgba(44, 36, 22, 0.08))
- Spacing: Generous whitespace, 8pt grid
- Vibe: Warm, luxurious, inviting, premium furniture store
- Imagery: Lifestyle furniture photography with warm natural lighting
- Interactions: Subtle hover scales, gold glow effects
```

---

## 7. Component Patterns

### Navigation
- Transparent/glass on hero, solid cream after scroll
- Logo left, links center, cart/menu right
- Mega menu for categories

### Product Cards
- Rounded container with subtle shadow
- Image with hover zoom
- Product name in Playfair Display
- Price with gold accent
- Quick-add button

### Hero Sections
- Full viewport height
- Large display typography
- Subtle particle/texture animation
- Clear CTA with gold styling

### Footer
- Dark cream or soft espresso background
- Multi-column layout
- Newsletter signup with gold button
- Social icons

---

## 8. Responsive Behavior

- Desktop first, graceful mobile adaptation
- Stack layouts vertically on mobile
- Reduce type sizes proportionally
- Maintain touch-friendly tap targets (44px min)
- Simplify animations on mobile
