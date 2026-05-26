import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Platform, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import SpinWheelModal from './games/SpinWheelModal';
import TreeGameModal from './games/TreeGameModal';

const GameCenter = () => {
  const { isDarkMode } = useApp();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [spinVisible, setSpinVisible] = useState(false);
  const [treeVisible, setTreeVisible] = useState(false);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;

  // Floating animation for bubble
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
      ])
    ).start();
  }, []);

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(menuAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setMenuOpen(false));
    } else {
      setMenuOpen(true);
      Animated.spring(menuAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    }
  };

  const openSpin = () => {
    toggleMenu();
    setSpinVisible(true);
  };

  const openTree = () => {
    toggleMenu();
    setTreeVisible(true);
  };

  const menuScale = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const menuOpacity = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={styles.root}>
      {/* Modals */}
      {spinVisible && <SpinWheelModal visible={spinVisible} onClose={() => setSpinVisible(false)} />}
      {treeVisible && <TreeGameModal visible={treeVisible} onClose={() => setTreeVisible(false)} />}

      {/* Mini Launcher Menu */}
      {menuOpen && (
        <Animated.View style={[
          styles.menuContainer,
          {
            opacity: menuOpacity,
            transform: [{ scale: menuScale }, { translateY: -60 }],
            backgroundColor: isDarkMode ? '#222' : '#FFF'
          }
        ]}>
          <TouchableOpacity style={styles.menuItem} onPress={openSpin}>
            <MaterialCommunityIcons name="star-circle" size={24} color="#FFD700" />
            <Text style={[styles.menuItemText, { color: isDarkMode ? '#FFF' : '#333' }]}>Lucky Spin</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.menuItem} onPress={openTree}>
            <MaterialCommunityIcons name="pine-tree" size={24} color="#6BCB77" />
            <Text style={[styles.menuItemText, { color: isDarkMode ? '#FFF' : '#333' }]}>Pohon Berkah</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Floating Bubble Launcher */}
      <Animated.View style={[
        styles.floatingButtonWrap,
        { transform: [{ translateY: floatAnim }] }
      ]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleMenu}
          style={[styles.floatingButton, { backgroundColor: isDarkMode ? '#FFD700' : '#FF8C00' }]}
        >
          <MaterialCommunityIcons name={menuOpen ? "close" : "gamepad-variant"} size={26} color="#000" />
          {!menuOpen && (
            <View style={styles.badgeNotif}>
              <Text style={styles.badgeNotifText}>2</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 9998,
  },
  floatingButtonWrap: {
    position: 'absolute',
    bottom: 80,
    left: 15, // moved to left side as per user request
    zIndex: 9999,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  badgeNotif: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3D00',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  badgeNotifText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 80,
    left: 15,
    borderRadius: 15,
    padding: 10,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    minWidth: 140,
    zIndex: 9998,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    gap: 10,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 2,
  }
});

export default GameCenter;
