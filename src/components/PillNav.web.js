// src/components/PillNav.web.js
import React, { useEffect, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { gsap } from 'gsap';
import { useApp } from '../context/AppContext';
import './PillNav.css';
import AnimatedLogo from './AnimatedLogo';

const TABS_METADATA = [
  { name: 'Home',    icon: '🏠', label: 'Home' },
  { name: 'Menu',    icon: '🍔', label: 'Menu' },
  { name: 'Cart',    icon: '🛒', label: 'Cart' },
  { name: 'History', icon: '📋', label: 'Orders' },
  { name: 'Profile', icon: '👤', label: 'Profile' },
];

const PillNav = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cart, orderHistory, notifications, accentColor } = useApp();

  const baseColor = '#000000';
  const pillColor = '#ffffff';
  const pillTextColor = '#000000';
  const hoveredPillTextColor = '#ffffff';
  const ease = 'power3.easeOut';

  const circleRefs = useRef([]);
  const tlRefs = useRef([]);

  // Calculate badges
  const badges = {
    Cart: cart.length,
    History: orderHistory.filter(o => o.status === 'Pending').length,
    Profile: notifications.filter(n => !n.read).length,
  };

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, i) => {
        if (!circle?.parentElement) return;
        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 2;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

        const icon = pill.querySelector('.pill-icon');
        const label = pill.querySelector('.pill-label');
        
        if (icon) gsap.set(icon, { y: 0 });
        if (label) gsap.set(label, { y: 0 });

        tlRefs.current[i]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.25, xPercent: -50, duration: 0.6, ease, overwrite: 'auto' }, 0);
        if (icon) tl.to(icon, { y: -2, color: hoveredPillTextColor, duration: 0.5, ease, overwrite: 'auto' }, 0);
        if (label) tl.to(label, { color: hoveredPillTextColor, duration: 0.5, ease, overwrite: 'auto' }, 0);
        tlRefs.current[i] = tl;

        // Check active state
        const isFocused = route.name === TABS_METADATA[i].name || (route.name === 'MenuStack' && TABS_METADATA[i].name === 'Menu');
        if (isFocused) tl.play(); else tl.reverse();
      });
    };

    layout();
    setTimeout(layout, 100);
    window.addEventListener('resize', layout);
    return () => window.removeEventListener('resize', layout);
  }, [route.name]);

  const handleEnter = (i) => {
    const isFocused = route.name === TABS_METADATA[i].name;
    if (!isFocused) tlRefs.current[i]?.play();
  };

  const handleLeave = (i) => {
    const isFocused = route.name === TABS_METADATA[i].name;
    if (!isFocused) tlRefs.current[i]?.reverse();
  };

  return (
    <div className="pill-nav-container" style={{ '--base': baseColor, '--pill-bg': pillColor, '--pill-text': pillTextColor, '--hover-text': hoveredPillTextColor }}>
      <nav className="pill-nav">
        <div className="pill-logo"><AnimatedLogo size={22} /></div>
        <div className="pill-nav-items">
          <ul className="pill-list">
            {TABS_METADATA.map((item, i) => {
              const badge = badges[item.name] || 0;
              const isFocused = route.name === item.name;
              return (
                <li key={item.name}>
                  <div className={`pill${isFocused ? ' is-active' : ''}`} 
                       onClick={() => navigation.navigate(item.name)}
                       onMouseEnter={() => handleEnter(i)} 
                       onMouseLeave={() => handleLeave(i)}>
                    <span className="hover-circle" ref={el => { circleRefs.current[i] = el; }} />
                    <div className="label-stack">
                      <span className="pill-icon">{item.icon}</span>
                      <span className="pill-label">{item.label}</span>
                    </div>
                    {badge > 0 && <div className="nav-badge" style={{ backgroundColor: accentColor }}>{badge > 9 ? '9+' : badge}</div>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default PillNav;
