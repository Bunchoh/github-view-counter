const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function parseColor(raw) {
  if (!raw) return null;
  if (decodeURIComponent(raw).startsWith('rgba') || decodeURIComponent(raw).startsWith('rgb')) return decodeURIComponent(raw);
  return '#' + raw.replace('#', '');
}

function abbreviate(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)         return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function tw(str, fontSize) {
  return str.length * fontSize * 0.601;
}

module.exports = async (req, res) => {
  const q = req.query;

  // ─── Username (required) ──────────────────────────────────────
  const username = (q.username || '').trim().toLowerCase();
  if (!username) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(400).send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="30">
        <text x="5" y="20" font-family="monospace" font-size="13" fill="#f78166">
          ⚠ username param required
        </text>
      </svg>
    `);
  }

  // ─── Increment counter for this username ──────────────────────
  const { data, error } = await supabase.rpc('increment_counter', { uname: username });
  if (error) return res.status(500).send('Error');

  // ─── Params ──────────────────────────────────────────────────────
  const base         = parseInt(q.base)           || 0;
  const abbreviated  = q.abbreviated              === 'true';

  const showIcon     = q.icon                     !== 'false';
  const iconSize     = parseInt(q.iconSize)       || 16;
  const iconColor    = parseColor(q.iconColor)    || parseColor(q.color) || '#cccccc';

  const showLabel    = q.label                    !== 'false';
  const labelText    = (q.label && q.label !== 'false') ? q.label : 'Profile views:';
  const labelColor   = parseColor(q.labelColor)   || parseColor(q.color) || '#cccccc';

  const countColor   = parseColor(q.color)        || '#cccccc';
  const fontSize     = parseInt(q.size)           || 13;

  const style        = q.style                    || 'rounded'; // square | rounded | nobg | invisible
  const layout       = q.layout                   || 'horizontal'; // horizontal | vertical | split

  const bgColor      = parseColor(q.bgColor)      || 'rgba(0, 156, 255, 0.8)';
  const labelBgColor = parseColor(q.labelBgColor) || 'rgba(120, 120, 120, 0.8)';

  // ─── Count ───────────────────────────────────────────────────────
  const rawCount = (data || 0) + base;
  const countStr = abbreviated ? abbreviate(rawCount) : String(rawCount);

  // ─── Invisible ───────────────────────────────────────────────────
  if (style === 'invisible') {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(`<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>`);
  }

  // ─── Shared ──────────────────────────────────────────────────────
  const isNobg     = style === 'nobg';
  const isSplit    = layout === 'split';
  const isVertical = layout === 'vertical';
  const r          = (style === 'square' || isNobg) ? 0 : 5;
  const padX       = isNobg ? 0 : 10;
  const padY       = isNobg ? 0 : 7;
  const iconGap    = showIcon ? 5 : 0;

  const eyePath = `M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z`;

  const labelTW  = showLabel ? labelText : '';
  const fullText = labelTW + countStr;
  const fullTextW = tw(fullText, fontSize);
  const iconW     = showIcon ? iconSize : 0;

  let svgContent = '';
  let totalW, totalH;

  // ── VERTICAL ─────────────────────────────────────────────────
  if (isVertical) {
    const contentW = Math.max(iconW, fullTextW);
    totalW = contentW + padX * 2;

    let curY = padY;
    const iconY_v = curY;
    if (showIcon) curY += iconSize + 4;
    const textY_v = curY + fontSize * 0.85;
    curY += fontSize;
    totalH = curY + padY;

    const bgLayer = isNobg ? '' :
      `<rect x="0" y="0" width="${totalW}" height="${totalH}" rx="${r}" ry="${r}" fill="${bgColor}"/>`;

    svgContent = `
      ${bgLayer}
      ${showIcon ? `<svg x="${(totalW - iconSize) / 2}" y="${iconY_v}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="${eyePath}"/></svg>` : ''}
      <text x="${totalW / 2}" y="${textY_v}" text-anchor="middle" font-family="monospace" font-size="${fontSize}">
        ${showLabel ? `<tspan fill="${labelColor}">${labelText} </tspan>` : ''}
        <tspan fill="${countColor}" font-weight="bold">${countStr}</tspan>
      </text>`;

  // ── SPLIT ────────────────────────────────────────────────────
  } else if (isSplit) {
    const labelOnlyW    = showLabel ? tw(labelText, fontSize) : 0;
    const countOnlyW    = tw(countStr, fontSize);
    const labelSectionW = padX + iconW + iconGap + labelOnlyW;
    const countSectionW = padX + countOnlyW + padX;
    totalW = labelSectionW + countSectionW;
    totalH = Math.max(iconSize, fontSize) + padY * 2;
    const midY  = totalH / 2;
    const textY = midY + fontSize * 0.35;
    const iconY = midY - iconSize / 2;

    const leftBg  = `M${r},0 H${labelSectionW} V${totalH} H${r} Q0,${totalH} 0,${totalH - r} V${r} Q0,0 ${r},0 Z`;
    const rightBg = `M${labelSectionW},0 H${totalW - r} Q${totalW},0 ${totalW},${r} V${totalH - r} Q${totalW},${totalH} ${totalW - r},${totalH} H${labelSectionW} Z`;

    svgContent = `
      <path d="${leftBg}" fill="${labelBgColor}"/>
      <path d="${rightBg}" fill="${bgColor}"/>
      ${showIcon ? `<svg x="${padX}" y="${iconY}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="${eyePath}"/></svg>` : ''}
      ${showLabel ? `<text x="${padX + iconW + iconGap}" y="${textY}" font-family="monospace" font-size="${fontSize}" fill="${labelColor}">${labelText}</text>` : ''}
      <text x="${labelSectionW + padX}" y="${textY}" font-family="monospace" font-size="${fontSize}" font-weight="bold" fill="${countColor}">${countStr}</text>`;

  // ── HORIZONTAL (default) ──────────────────────────────────────
  } else {
    totalW = iconW + iconGap + fullTextW + padX * 2;
    totalH = Math.max(iconSize, fontSize) + padY * 2;
    const midY  = totalH / 2;
    const textY = midY + fontSize * 0.35;
    const iconY = midY - iconSize / 2;
    const textX = padX + iconW + iconGap;

    const bgLayer = isNobg ? '' :
      `<rect x="0" y="0" width="${totalW}" height="${totalH}" rx="${r}" ry="${r}" fill="${bgColor}"/>`;

    svgContent = `
      ${bgLayer}
      ${showIcon ? `<svg x="${padX}" y="${iconY}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="${eyePath}"/></svg>` : ''}
      <text x="${textX}" y="${textY}" font-family="monospace" font-size="${fontSize}">
        ${showLabel ? `<tspan fill="${labelColor}">${labelText} </tspan>` : ''}
        <tspan fill="${countColor}" font-weight="bold">${countStr}</tspan>
      </text>`;
  }

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(`<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">${svgContent}</svg>`);
};