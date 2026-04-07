// src/components/PillNav.js
import { Platform } from 'react-native';
import PillNavWeb from './PillNav.web';
import PillNavNative from './PillNav.native';

const PillNav = Platform.OS === 'web' ? PillNavWeb : PillNavNative;

export default PillNav;
