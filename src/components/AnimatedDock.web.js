// src/components/AnimatedDock.web.js
// macOS-style dock dengan magnification effect pakai motion/react
// Hanya berjalan di web — native pakai AnimatedDock.native.js

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect } from 'react';

const TABS = [
  { name: 'Home',    icon: '🏠', label: 'Beranda' },
  { name: 'Menu',    icon: '🍔', label: 'Menu' },
  { name: 'Cart',    icon: '🛒', label: 'Keranjang' },
  { name: 'History', icon: '📋', label: 'Riwayat' },
  { name: 'Profile', icon: '👤', label: 'Profil' },
];

function DockItem({ tab, isActive, onClick, mouseX, badge }) {
  const ref           = useRef(null);
  const isHovered     = useMotionValue(0);
  const [hovered, setHovered] = useState(false);

  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 50 };
    return val - rect.x - 25;
  });

  // Magnification — item membesar saat mouse dekat
  const targetSize = useTransform(
    mouseDistance,
    [-150, 0, 150],
    [46, 68, 46]
  );
  const size = useSpring(targetSize, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Label tooltip muncul saat hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: -4 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: -32,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(10,10,10,0.9)',
              border: '1px solid rgba(255,99,71,0.3)',
              borderRadius: 8,
              padding: '3px 10px',
              fontSize: 11,
              color: '#fff',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
            {tab.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item utama */}
      <motion.div
        ref={ref}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 14,
          cursor: 'pointer',
          position: 'relative',
          backgroundColor: isActive
            ? 'rgba(255,99,71,0.25)'
            : 'rgba(255,255,255,0.06)',
          border: isActive
            ? '1.5px solid rgba(255,99,71,0.6)'
            : '1.5px solid rgba(255,255,255,0.1)',
          boxShadow: isActive
            ? '0 0 16px rgba(255,99,71,0.3)'
            : '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
        }}
        whileTap={{ scale: 0.88 }}
        onHoverStart={() => { isHovered.set(1); setHovered(true); }}
        onHoverEnd={() => { isHovered.set(0); setHovered(false); }}
        onClick={onClick}
      >
        {/* Emoji icon */}
        <motion.span style={{
          fontSize: 22,
          filter: isActive ? 'none' : 'grayscale(20%)',
          transition: 'filter 0.2s',
        }}>
          {tab.icon}
        </motion.span>

        {/* Badge notifikasi */}
        {badge > 0 && (
          <div style={{
            position: 'absolute',
            top: -4, right: -4,
            width: 16, height: 16,
            borderRadius: 8,
            backgroundColor: '#FF6347',
            border: '1.5px solid #0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: '800',
            color: '#fff',
          }}>
            {badge > 9 ? '9+' : badge}
          </div>
        )}
      </motion.div>

      {/* Dot aktif di bawah */}
      <motion.div
        initial={false}
        animate={{
          width:           isActive ? 16 : 4,
          opacity:         isActive ? 1  : 0.3,
          backgroundColor: isActive ? '#FF6347' : '#666',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          height: 3,
          borderRadius: 2,
          marginTop: 5,
        }}
      />
    </div>
  );
}

export default function AnimatedDock({ state, descriptors, navigation, badges = {} }) {
  const mouseX  = useMotionValue(Infinity);
  const isHov   = useMotionValue(0);

  // Height dock — mengembang saat hover
  const heightRow = useTransform(isHov, [0, 1], [80, 110]);
  const height    = useSpring(heightRow, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.div
      style={{
        height,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 10,
        zIndex: 999,
        pointerEvents: 'none',
      }}
    >
      <motion.div
        onMouseMove={({ pageX }) => { isHov.set(1); mouseX.set(pageX); }}
        onMouseLeave={() => { isHov.set(0); mouseX.set(Infinity); }}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 10,
          backgroundColor: 'rgba(10,10,10,0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 22,
          padding: '10px 14px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,99,71,0.1)',
          pointerEvents: 'all',
        }}
      >
        {state.routes.map((route, index) => {
          const tab      = TABS.find(t => t.name === route.name) || TABS[0];
          const isActive = state.index === index;
          const badge    = badges[route.name] || 0;

          return (
            <DockItem
              key={route.key}
              tab={tab}
              isActive={isActive}
              mouseX={mouseX}
              badge={badge}
              onClick={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isActive && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </motion.div>
    </motion.div>
  );
}