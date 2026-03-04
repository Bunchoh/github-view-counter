# 👁️ GitHub Profile View Counter

A self-hosted, fully customizable SVG view counter for your GitHub profile README. Built with **Vercel** + **Supabase** — free, fast, and supports multiple users.

---

## ✨ Features

- 👤 **Per-username counters** — each GitHub user gets their own count
- 🎨 **Fully customizable** — colors, styles, layout, font size, icon
- 📐 **Multiple layouts** — horizontal, vertical, split
- 🔲 **Multiple styles** — rounded, square, no background, invisible
- 🔢 **Abbreviated counts** — 12345 → 12.3K
- ➕ **Base count** — add an offset to your counter
- 🫥 **Invisible mode** — count silently without showing anything
- ⚡ **No signup required** — just add your username to the URL

---

## 🚀 Quick Start

Add this to your GitHub profile `README.md`:

```markdown
![](https://view-counter-livid.vercel.app/api?username=your-github-username)
```

Replace `your-github-username` with your actual GitHub username. That's it — your counter starts tracking immediately!

---

## 🛠️ Self Hosting

Want to run your own instance? Follow these steps.

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open **SQL Editor** and run:

```sql
CREATE TABLE counters (
  username TEXT PRIMARY KEY,
  count    INTEGER DEFAULT 0
);

CREATE OR REPLACE FUNCTION increment_counter(uname TEXT)
RETURNS INTEGER AS $$
  INSERT INTO counters (username, count)
  VALUES (uname, 1)
  ON CONFLICT (username)
  DO UPDATE SET count = counters.count + 1
  RETURNING count;
$$ LANGUAGE SQL;
```

3. Go to **Settings → API** and copy your **Project URL** and **anon public key**

### 2. Project Setup

```bash
mkdir view-counter && cd view-counter
mkdir api
```

Create `api/index.js` with the source code from this repo, then create `package.json`:

```json
{
  "name": "view-counter",
  "version": "1.0.0",
  "dependencies": {
    "@supabase/supabase-js": "^2.0.0"
  }
}
```

```bash
npm install
```

### 3. Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

### 4. Add Environment Variables

In your Vercel dashboard → **Settings → Environment Variables**:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | `sb_publishable_xxxx...` |

Then redeploy:
```bash
vercel --prod
```

---

## 📖 Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `username` | *(required)* | Your GitHub username |
| `base` | `0` | Number added to the real count |
| `abbreviated` | `false` | `true` → shows `12.3K` instead of `12345` |
| `icon` | `true` | `false` to hide the eye icon |
| `iconSize` | `16` | Icon size in pixels |
| `iconColor` | same as `color` | Icon color (hex or rgba) |
| `label` | `Profile views:` | Label text. Set to `false` to hide |
| `labelColor` | same as `color` | Label text color |
| `color` | `#aaaaaa` | Count text color (fallback for all colors) |
| `size` | `13` | Font size in pixels |
| `style` | `rounded` | `rounded` · `square` · `nobg` · `invisible` |
| `layout` | `horizontal` | `horizontal` · `vertical` · `split` |
| `bgColor` | `rgba(255,255,255,0.08)` | Background color |
| `labelBgColor` | `rgba(255,255,255,0.05)` | Left section color in `split` layout |

> **Colors** accept hex (`ff0000`, `#ff0000`) or rgba (`rgba(255,0,0,0.5)`). When using rgba in a URL, encode parentheses and commas: `rgba%28255%2C0%2C0%2C0.5%29` — or just use hex.

---

## 🎨 Styles

### `style=rounded` *(default)*
Rounded corners background.
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane)
```

### `style=square`
Sharp corners background.
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&style=square)
```

### `style=nobg`
No background, no padding — text and icon only.
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&style=nobg)
```

### `style=invisible`
Returns a 1×1 transparent pixel. Counts silently without displaying anything.
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&style=invisible)
```

---

## 📐 Layouts

### `layout=horizontal` *(default)*
Icon → label → count all on one row.
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&layout=horizontal)
```

### `layout=vertical`
Icon on top, label and count below — stacked.
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&layout=vertical)
```

### `layout=split`
Two-section badge: label on the left with its own background, count on the right.
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&layout=split)
```

---

## 💡 Examples

### Default
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane)
```

### No icon
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&icon=false)
```

### No label (count only)
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&label=false)
```

### No icon, no label (bare count)
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&icon=false&label=false)
```

### Custom label
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&label=visitors)
```

### Abbreviated count
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&abbreviated=true)
```

### Base count offset
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&base=1000&abbreviated=true)
```

### GitHub blue theme
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&color=58a6ff&bgColor=rgba(56,139,253,0.1))
```

### Dark background
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&color=ffffff&bgColor=rgba(30,30,30,0.9))
```

### Green theme
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&color=3fb950&bgColor=rgba(0,50,0,0.4)&style=square)
```

### Split — dark theme
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&layout=split&color=ffffff&labelBgColor=rgba(30,80,160,0.9)&bgColor=rgba(30,30,30,0.9))
```

### Split — custom colors
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&layout=split&color=ffffff&labelBgColor=rgba(50,100,200,0.9)&bgColor=rgba(20,20,20,0.9))
```

### Vertical with custom color
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&layout=vertical&color=58a6ff&bgColor=rgba(0,0,0,0.4))
```

### Larger font
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&size=16&iconSize=18)
```

### Minimal — no bg, no icon
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&style=nobg&icon=false&color=58a6ff)
```

### Orange accent
```markdown
![](https://view-counter-livid.vercel.app/api?username=piyush-kokane&color=f78166&style=nobg&icon=false)
```

---

## 🔒 Privacy & Data

- Only the **username** and **view count** are stored — nothing else
- Usernames are stored in lowercase
- No authentication or signup is needed
- Counts are public — anyone can see the count by loading the image

---

## 🧰 Tech Stack

- **[Vercel](https://vercel.com)** — serverless API hosting (free tier)
- **[Supabase](https://supabase.com)** — PostgreSQL database (free tier)
- **SVG** — rendered inline as an image, no external dependencies

---

## 📄 License

MIT — free to use, fork, and self-host.

---

<div align="center">
  Made by <a href="https://github.com/piyush-kokane">piyush-kokane</a>
</div>