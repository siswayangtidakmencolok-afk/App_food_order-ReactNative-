import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Animated, Dimensions, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const MAX_LEVEL = 5;
const XP_THRESHOLDS = [0, 50, 150, 300, 500];

const MISSIONS = [
  { id: 'DAILY_LOGIN',   title: 'Login Harian',            xp: 20, icon: 'calendar-check', link: null },
  { id: 'BUY_MIN_25K',   title: 'Belanja Min. Rp 25.000',  xp: 40, icon: 'cart-check',     link: null },
  { id: 'FOLLOW_IG',     title: 'Follow Instagram',         xp: 25, icon: 'instagram',      link: 'https://www.instagram.com/f.zvvn_/' },
  { id: 'FOLLOW_TIKTOK', title: 'Follow TikTok',            xp: 25, icon: 'music-note',     link: 'https://www.tiktok.com/@eksrovertselalu' },
  { id: 'JOIN_DISCORD',  title: 'Join Discord',             xp: 25, icon: 'chat',            link: 'https://discord.com/channels/@zxyninety' },
  { id: 'VISIT_FRIEREN', title: 'Kunjungi Web Frieren',     xp: 30, icon: 'web',             link: 'https://siswayangtidakmencolok-afk.github.io/website-frieren/' },
  { id: 'VISIT_3D',      title: 'Lihat 3D Global',          xp: 30, icon: 'earth',           link: 'https://globe3d-byfhaz.netlify.app/' },
];

const REWARDS = [
  { type: 'voucher', name: 'Diskon 30%',       code: 'FS30TREE',     color: '#4D96FF', emoji: '🎫', description: 'Diskon 30% berkat panen pohon!' },
  { type: 'voucher', name: 'Gratis Ongkir',    code: 'FSTREEONGKIR', color: '#FF9F29', emoji: '🛵', description: 'Gratis ongkir untuk pesanan Anda!' },
  { type: 'voucher', name: 'Potongan Rp 15.000', code: 'FSTREE15K', color: '#FFD93D', emoji: '💵', description: 'Potongan langsung Rp 15.000.' },
  { type: 'food',    name: 'Ayam Goreng Kriuk', dbName: 'Ayam Goreng', color: '#FF6B6B', emoji: '🍗', description: 'Ayam Goreng gratis ditambahkan ke keranjang!' },
];

// ─── SVG tanaman level-based (mirip ilustrasi pot tanaman referensi) ───
const PlantSVG = ({ level, size = 200, waterAnim }) => {
  const cx = size / 2;
  // Pot dimensions
  const potH = size * 0.28, potW = size * 0.44, potTop = size * 0.5;
  const potX = cx - potW / 2;

  // Rope/string detail on pot
  const ropeY = potTop + potH * 0.32;

  // Stem heights per level
  const stemHeights = [0, size * 0.08, size * 0.15, size * 0.22, size * 0.28, size * 0.3];
  const stemH = stemHeights[Math.min(level, 5)];
  const stemX = cx;
  const stemY1 = potTop; // base
  const stemY0 = potTop - stemH; // top

  // Leaf configs per level
  const leafConfigs = {
    1: [],  // seed — no leaves
    2: [    // sprout — 2 small blades
      { x: cx - 10, y: stemY0 + 4, r: 14, angle: -40, color: '#6BCB77' },
      { x: cx + 10, y: stemY0 + 4, r: 14, angle: 40,  color: '#52B96A' },
    ],
    3: [    // young plant — 4 blades
      { x: cx - 16, y: stemY0 + 2, r: 20, angle: -50, color: '#4CAF50' },
      { x: cx + 16, y: stemY0 + 2, r: 20, angle: 50,  color: '#43A047' },
      { x: cx - 8,  y: stemY0 - 8, r: 16, angle: -30, color: '#66BB6A' },
      { x: cx + 8,  y: stemY0 - 8, r: 16, angle: 30,  color: '#4CAF50' },
    ],
    4: [    // mature plant — 6 long blades
      { x: cx - 24, y: stemY0 + 4, r: 28, angle: -60, color: '#2E7D32' },
      { x: cx + 24, y: stemY0 + 4, r: 28, angle: 60,  color: '#388E3C' },
      { x: cx - 16, y: stemY0 - 4, r: 22, angle: -40, color: '#43A047' },
      { x: cx + 16, y: stemY0 - 4, r: 22, angle: 40,  color: '#388E3C' },
      { x: cx - 8,  y: stemY0 -14, r: 18, angle: -20, color: '#4CAF50' },
      { x: cx + 8,  y: stemY0 -14, r: 18, angle: 20,  color: '#4CAF50' },
    ],
    5: [    // full grown — dense lush plant
      { x: cx - 30, y: stemY0 + 8, r: 34, angle: -65, color: '#1B5E20' },
      { x: cx + 30, y: stemY0 + 8, r: 34, angle: 65,  color: '#2E7D32' },
      { x: cx - 20, y: stemY0 - 2, r: 28, angle: -45, color: '#388E3C' },
      { x: cx + 20, y: stemY0 - 2, r: 28, angle: 45,  color: '#2E7D32' },
      { x: cx - 10, y: stemY0 -14, r: 22, angle: -25, color: '#43A047' },
      { x: cx + 10, y: stemY0 -14, r: 22, angle: 25,  color: '#43A047' },
      { x: cx,      y: stemY0 -22, r: 18, angle: 0,   color: '#4CAF50' },
    ],
  };

  const leaves = leafConfigs[Math.min(level, 5)] || [];

  // Water drop animation offset
  const dropY = waterAnim
    ? waterAnim.interpolate({ inputRange: [0, 1], outputRange: [stemY0 - 40, stemY0 + 20] })
    : null;
  const dropOpacity = waterAnim
    ? waterAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 1, 0] })
    : null;

  // Soil texture on top of pot
  const soilY = potTop + 6;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Wooden table plank */}
        <Rect x={0} y={potTop + potH - 4} width={size} height={size * 0.18}
          rx="4" fill="#8B6914" opacity="0.5" />
        <Line x1={0} y1={potTop + potH - 4} x2={size} y2={potTop + potH - 4}
          stroke="#6B4F0F" strokeWidth="2" opacity="0.6" />

        {/* Pot body — terracotta */}
        <Path
          d={`M ${potX + 10} ${potTop}
              L ${potX} ${potTop + potH * 0.85}
              Q ${cx} ${potTop + potH + 6} ${potX + potW} ${potTop + potH * 0.85}
              L ${potX + potW - 10} ${potTop} Z`}
          fill="#C16B3A"
        />
        {/* Pot highlight */}
        <Path
          d={`M ${potX + 10} ${potTop} L ${potX + 16} ${potTop + potH * 0.7}`}
          stroke="rgba(255,200,150,0.4)" strokeWidth="6" strokeLinecap="round"
        />
        {/* Pot rim */}
        <Ellipse cx={cx} cy={potTop} rx={potW / 2} ry={size * 0.04}
          fill="#D4845A" />
        <Ellipse cx={cx} cy={potTop} rx={potW / 2 - 3} ry={size * 0.03}
          fill="#B85C2A" />

        {/* Rope detail */}
        {level > 1 && (
          <Path
            d={`M ${potX + 6} ${ropeY} Q ${cx} ${ropeY + 6} ${potX + potW - 6} ${ropeY}`}
            stroke="#D4A574" strokeWidth="3" fill="none" strokeLinecap="round"
          />
        )}

        {/* Soil */}
        <Ellipse cx={cx} cy={soilY} rx={potW / 2 - 4} ry={size * 0.025}
          fill="#3E1F05" />
        {/* Pebbles in soil */}
        {level > 0 && [
          { x: cx - 14, y: soilY - 1, r: 3 },
          { x: cx + 10, y: soilY,     r: 2.5 },
          { x: cx - 2,  y: soilY + 1, r: 2 },
        ].map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#5C3310" opacity="0.7" />
        ))}

        {/* Water puddle on soil (when watering) */}
        {waterAnim && (
          <Ellipse cx={cx} cy={soilY + 2} rx={12} ry={4} fill="#4D96FF" opacity="0.5" />
        )}

        {/* Stem */}
        {level > 1 && (
          <Line
            x1={stemX} y1={stemY1}
            x2={stemX} y2={stemY0}
            stroke="#2E7D32" strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* Seed (level 1) */}
        {level === 1 && (
          <Ellipse cx={cx} cy={soilY - 2} rx={8} ry={5} fill="#8B6914" />
        )}

        {/* Leaves */}
        {leaves.map((leaf, i) => (
          <G key={i} transform={`rotate(${leaf.angle}, ${leaf.x}, ${leaf.y})`}>
            <Ellipse
              cx={leaf.x} cy={leaf.y - leaf.r * 0.3}
              rx={leaf.r * 0.28} ry={leaf.r * 0.72}
              fill={leaf.color}
            />
            {/* Leaf vein */}
            <Line
              x1={leaf.x} y1={leaf.y}
              x2={leaf.x} y2={leaf.y - leaf.r * 0.6}
              stroke="rgba(255,255,255,0.3)" strokeWidth="1"
              strokeLinecap="round"
            />
          </G>
        ))}

        {/* Level 5 — golden glow seeds/grain at top */}
        {level === 5 && (
          <>
            {[cx - 12, cx, cx + 12].map((gx, i) => (
              <G key={i}>
                <Ellipse cx={gx} cy={stemY0 - 8} rx={4} ry={8} fill="#FFD700" />
                <Ellipse cx={gx} cy={stemY0 - 14} rx={3} ry={5} fill="#FFC107" />
              </G>
            ))}
          </>
        )}

        {/* Small watering can (decorative, only level >= 2) */}
        {level >= 2 && (
          <G transform={`translate(${cx + potW / 2 + 8}, ${potTop + potH * 0.4})`}>
            <Ellipse cx={0} cy={0} rx={7} ry={5} fill="#D4A574" opacity="0.7" />
            <Path d="M 7 0 Q 14 -6 12 -10" stroke="#B8860B" strokeWidth="1.5" fill="none" />
          </G>
        )}
      </Svg>

      {/* Animated water drop (overlay, outside SVG for Animated.View) */}
      {waterAnim && dropY && (
        <Animated.View
          style={{
            position: 'absolute',
            left: cx - 12,
            opacity: dropOpacity,
            transform: [{ translateY: dropY }],
          }}
        >
          <MaterialCommunityIcons name="water" size={24} color="#4D96FF" />
        </Animated.View>
      )}
    </View>
  );
};

export default TreeGameModal;
