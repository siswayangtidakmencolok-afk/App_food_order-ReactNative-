import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Auth
  const [session, setSession]       = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App state
  const [cart, setCart]             = useState([]);
  const [menuItems, setMenuItems]   = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const [favorites, setFavorites]   = useState([]); // array of menu_item_id
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // ── AUTH LISTENER ──────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── FETCH DATA SAAT SESSION BERUBAH ───────────────────
  useEffect(() => {
    fetchMenu();
    if (session?.user) {
      fetchProfile();
      fetchOrders();
      fetchFavorites();
    } else {
      // Reset state saat logout
      setOrderHistory([]);
      setFavorites([]);
      setUserProfile(null);
      setCart([]);
    }
  }, [session]);

  // ── MENU ──────────────────────────────────────────────
  const fetchMenu = async () => {
    setMenuLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('id');
    if (!error && data) setMenuItems(data);
    setMenuLoading(false);
  };

  // ── PROFILE ───────────────────────────────────────────
  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (!error && data) {
      setUserProfile({
        ...data,
        memberSince: data.created_at,
        totalOrders: 0,
        totalSpent: 0,
      });
    }
  };

  const updateProfile = async (updates) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id);
    if (!error) {
      setUserProfile(prev => ({ ...prev, ...updates }));
      addNotification('Profile diperbarui!', 'success');
    }
    return { error };
  };

  // ── ORDERS ────────────────────────────────────────────
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items(*)`)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      const formatted = data.map(o => ({
        ...o,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        phoneNumber: o.phone_number,
        deliveryAddress: o.delivery_address,
        orderNotes: o.order_notes,
        paymentMethod: o.payment_method,
        estimatedDelivery: o.estimated_delivery,
        items: o.order_items || [],
        createdAt: o.created_at,
      }));
      setOrderHistory(formatted);
    }
  };

  const saveOrder = async (orderData) => {
    if (!session?.user) return { error: 'Not logged in' };

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        order_number: orderData.orderNumber,
        status: 'Pending',
        total: orderData.total,
        customer_name: orderData.customerName,
        phone_number: orderData.phoneNumber,
        delivery_address: orderData.deliveryAddress,
        order_notes: orderData.orderNotes,
        payment_method: orderData.paymentMethod,
        estimated_delivery: orderData.estimatedDelivery,
      })
      .select()
      .single();

    if (orderError) return { error: orderError };

    // Insert order items
    const items = orderData.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(items);

    if (itemsError) return { error: itemsError };

    // Update local state
    const newOrder = {
      ...order,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      phoneNumber: order.phone_number,
      deliveryAddress: order.delivery_address,
      orderNotes: order.order_notes,
      paymentMethod: order.payment_method,
      estimatedDelivery: order.estimated_delivery,
      items: orderData.items,
      createdAt: order.created_at,
    };
    setOrderHistory(prev => [newOrder, ...prev]);
    setCart([]);
    addNotification('Pesanan berhasil dibuat!', 'success');
    return { data: newOrder, error: null };
  };

  // ── FAVORITES ─────────────────────────────────────────
  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('menu_item_id')
      .eq('user_id', session.user.id);
    if (!error && data) setFavorites(data.map(f => f.menu_item_id));
  };

  const toggleFavorite = async (menuItemId) => {
    if (!session?.user) { addNotification('Login dulu untuk menyimpan favorit', 'warning'); return; }

    const isFav = favorites.includes(menuItemId);
    if (isFav) {
      await supabase.from('favorites').delete()
        .eq('user_id', session.user.id)
        .eq('menu_item_id', menuItemId);
      setFavorites(prev => prev.filter(id => id !== menuItemId));
      addNotification('Dihapus dari favorit', 'info');
    } else {
      await supabase.from('favorites').insert({
        user_id: session.user.id,
        menu_item_id: menuItemId,
      });
      setFavorites(prev => [...prev, menuItemId]);
      addNotification('Ditambahkan ke favorit ❤️', 'success');
    }
  };

  // ── CART ──────────────────────────────────────────────
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
    addNotification(`${item.name} ditambahkan ke keranjang`, 'success');
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = () => setCart([]);

  const reorder = (order) => {
    setCart(order.items.map(i => ({ ...i, quantity: i.quantity })));
    addNotification('Pesanan ditambahkan ke keranjang', 'success');
  };

  // ── REVIEWS ───────────────────────────────────────────
  const saveReview = async ({ menuItemId, rating, text }) => {
    if (!session?.user) return { error: 'Not logged in' };
    const { error } = await supabase.from('reviews').insert({
      user_id: session.user.id,
      menu_item_id: menuItemId,
      rating,
      text,
      user_name: userProfile?.name || 'User',
    });
    return { error };
  };

  // ── AUTH ACTIONS ──────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // ── NOTIFICATIONS ─────────────────────────────────────
  const addNotification = (message, type = 'info') => {
    const n = { id: Date.now(), message, type, timestamp: new Date().toISOString(), read: false };
    setNotifications(prev => [n, ...prev]);
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // ── COMPUTED ──────────────────────────────────────────
  const profileWithStats = userProfile ? {
    ...userProfile,
    totalOrders: orderHistory.length,
    totalSpent: orderHistory.reduce((s, o) => s + o.total, 0),
  } : null;

  return (
    <AppContext.Provider value={{
      // Auth
      session, authLoading, signOut,
      // Menu
      menuItems, menuLoading, fetchMenu,
      // Cart
      cart, setCart, addToCart, removeFromCart, clearCart, reorder,
      // Orders
      orderHistory, setOrderHistory, saveOrder, fetchOrders,
      // Favorites
      favorites, toggleFavorite,
      // Profile
      userProfile: profileWithStats, updateProfile, setUserProfile,
      // Reviews
      saveReview,
      // UI
      isDarkMode, toggleDarkMode,
      notifications, addNotification, clearNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};