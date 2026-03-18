import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Send, Package, CreditCard, ShoppingBag, HelpCircle, Phone, MessageSquare, ChevronRight, ArrowLeft, RotateCcw, Truck, Eye, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import useScrollToTop from '@/hooks/useScrollToTop';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: ChatOption[];
  orderCard?: OrderCardData;
}

interface ChatOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface OrderCardData {
  id: string;
  order_number: string;
  status: string;
  items: any;
  total_amount: number;
}

const SupportChat = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentFlow, setCurrentFlow] = useState<string>('init');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const orderId = searchParams.get('orderId');

  const t = language === 'te' ? {
    welcome: 'హలో 👋 మా సపోర్ట్‌కు స్వాగతం!',
    detectedUser: '✅ వినియోగదారు వివరాలు గుర్తించబడ్డాయి:',
    name: 'పేరు',
    mobile: 'మొబైల్',
    selectLang: '🌐 దయచేసి మీ భాషను ఎంచుకోండి:',
    helpWith: 'మీకు సహాయం కావాల్సినది ఎంచుకోండి:',
    orderDetails: '📦 ఆర్డర్ వివరాలు',
    paymentIssues: '💳 చెల్లింపు సమస్యలు',
    productInfo: '🛍️ ఉత్పత్తి సమాచారం',
    faqHelp: '❓ తరచుగా అడిగే ప్రశ్నలు',
    recentOrders: '📦 మీ ఇటీవలి ఆర్డర్లు:',
    selectOrder: '👉 ఆర్డర్‌ను ఎంచుకోండి',
    trackOrder: 'ఆర్డర్ ట్రాక్ చేయండి',
    cancelOrder: 'ఆర్డర్ రద్దు చేయండి',
    returnReplace: 'రిటర్న్ / రీప్లేస్',
    viewDetails: 'వివరాలు చూడండి',
    paymentFailed: 'చెల్లింపు విఫలమైంది',
    amountDebited: 'మొత్తం డెబిట్ అయింది కానీ ఆర్డర్ నిర్ధారించబడలేదు',
    refundStatus: 'రీఫండ్ స్థితి',
    paymentHelp: 'చెల్లింపు విధానాలు సహాయం',
    needMoreHelp: '📲 మరింత సహాయం కావాలా?',
    whatsapp: 'WhatsApp సపోర్ట్ 📲',
    callSupport: 'కాల్ సపోర్ట్ ☎️',
    liveAgent: 'లైవ్ ఏజెంట్ 💬',
    faqWhere: 'నా ఆర్డర్ ఎక్కడ ఉంది?',
    faqCancel: 'ఆర్డర్ ఎలా రద్దు చేయాలి?',
    faqRefund: 'రీఫండ్ స్థితి?',
    faqPayment: 'చెల్లింపు విఫలమైన పరిష్కారం?',
    resolved: '🙏 మమ్మల్ని సంప్రదించినందుకు ధన్యవాదాలు 😊\nమంచి రోజు కావాలని కోరుకుంటున్నాము 🚀',
    escalation: '👉 మీ సమస్యకు టికెట్ సృష్టించబడింది. మా సపోర్ట్ టీమ్ త్వరలో సంప్రదిస్తారు.',
    writeMessage: 'సందేశం రాయండి...',
    orderStatus: 'ఆర్డర్ స్థితి',
    actions: 'అందుబాటులో ఉన్న చర్యలు:',
    backToMenu: '🔙 మెయిన్ మెనూకు తిరిగి వెళ్ళండి',
    paymentSupport: '💳 చెల్లింపు సపోర్ట్:',
    chooseIssue: 'మీ సమస్యను ఎంచుకోండి:',
    noOrders: 'ఆర్డర్లు కనుగొనబడలేదు.',
    disclaimer: 'దయచేసి తప్పులను క్షమించండి. ఈ చాట్‌లో వ్యక్తిగత సమాచారం ఇవ్వకండి.',
  } : {
    welcome: 'Hello 👋 Welcome to our support!',
    detectedUser: '✅ User Details Detected:',
    name: 'Name',
    mobile: 'Mobile',
    selectLang: '🌐 Please select your language:',
    helpWith: 'I can help you with:',
    orderDetails: '📦 Order Details',
    paymentIssues: '💳 Payment Issues',
    productInfo: '🛍️ Product Information',
    faqHelp: '❓ FAQs / Quick Help',
    recentOrders: '📦 Your Recent Orders:',
    selectOrder: '👉 Select an order or type Order ID',
    trackOrder: 'Track Order',
    cancelOrder: 'Cancel Order',
    returnReplace: 'Return / Replace',
    viewDetails: 'View Details',
    paymentFailed: 'Payment Failed',
    amountDebited: 'Amount Debited but Order Not Confirmed',
    refundStatus: 'Refund Status',
    paymentHelp: 'Payment Methods Help',
    needMoreHelp: '📲 Need More Help?',
    whatsapp: 'WhatsApp Support 📲',
    callSupport: 'Call Support ☎️',
    liveAgent: 'Live Agent 💬',
    faqWhere: 'Where is my order?',
    faqCancel: 'How to cancel order?',
    faqRefund: 'Refund status?',
    faqPayment: 'Payment failed solution?',
    resolved: '🙏 Thank you for contacting us 😊\nHave a great day 🚀',
    escalation: '👉 A ticket has been created for your issue. Our support team will contact you shortly.',
    writeMessage: 'Write a message...',
    orderStatus: 'Order Status',
    actions: 'Available Actions:',
    backToMenu: '🔙 Back to Main Menu',
    paymentSupport: '💳 Payment Support:',
    chooseIssue: 'Choose your issue:',
    noOrders: 'No orders found.',
    disclaimer: 'Please excuse any mistakes as we work to better answer your questions.\nDo not give personal information in this chat.',
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', user.id)
        .single();
      if (profile) {
        setUserName(profile.name || 'User');
        setUserPhone(profile.phone || '');
      }
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (orderData) setOrders(orderData);
    };
    fetchUserAndOrders();
  }, [user]);

  useEffect(() => {
    if (userName || !user) {
      initChat();
    }
  }, [userName, language]);

  const addBotMessage = (content: string, options?: ChatOption[], orderCard?: OrderCardData) => {
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      type: 'bot',
      content,
      timestamp: new Date(),
      options,
      orderCard,
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  const addUserMessage = (content: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
  };

  const initChat = () => {
    setMessages([]);
    setCurrentFlow('lang_select');

    setTimeout(() => {
      addBotMessage(t.disclaimer);
    }, 300);

    setTimeout(() => {
      const greeting = `${t.welcome}\n\n${t.detectedUser}\n- ${t.name}: ${userName || 'User'}\n- ${t.mobile}: ${userPhone || 'N/A'}`;
      addBotMessage(greeting);
    }, 600);

    setTimeout(() => {
      addBotMessage(t.selectLang, [
        { label: 'English', value: 'en' },
        { label: 'తెలుగు', value: 'te' },
      ]);
    }, 900);
  };

  const showMainMenu = () => {
    setCurrentFlow('main_menu');
    addBotMessage(t.helpWith, [
      { label: t.orderDetails, value: 'orders', icon: <Package className="h-4 w-4" /> },
      { label: t.paymentIssues, value: 'payments', icon: <CreditCard className="h-4 w-4" /> },
      { label: t.productInfo, value: 'products', icon: <ShoppingBag className="h-4 w-4" /> },
      { label: t.faqHelp, value: 'faq', icon: <HelpCircle className="h-4 w-4" /> },
    ]);
  };

  const showOrders = () => {
    setCurrentFlow('orders');
    if (orders.length === 0) {
      addBotMessage(t.noOrders);
      showMainMenuOption();
      return;
    }

    addBotMessage(t.recentOrders);
    orders.forEach((order, i) => {
      const items = Array.isArray(order.items) ? order.items : [];
      const firstItem = items[0] as any;
      const name = firstItem?.name || firstItem?.product_name || `Order ${i + 1}`;
      addBotMessage('', undefined, {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        items: order.items,
        total_amount: order.total_amount,
      });
    });

    setTimeout(() => {
      addBotMessage(t.selectOrder);
    }, 300);
  };

  const showOrderActions = (order: any) => {
    setSelectedOrder(order);
    setCurrentFlow('order_actions');
    const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ');
    addBotMessage(`${t.orderStatus}: ${statusLabel}\n\n${t.actions}`, [
      { label: t.trackOrder, value: 'track', icon: <Truck className="h-4 w-4" /> },
      { label: t.cancelOrder, value: 'cancel', icon: <XCircle className="h-4 w-4" /> },
      { label: t.returnReplace, value: 'return', icon: <RotateCcw className="h-4 w-4" /> },
      { label: t.viewDetails, value: 'view', icon: <Eye className="h-4 w-4" /> },
    ]);
  };

  const showPaymentMenu = () => {
    setCurrentFlow('payments');
    addBotMessage(`${t.paymentSupport}\n${t.chooseIssue}`, [
      { label: t.paymentFailed, value: 'pay_failed' },
      { label: t.amountDebited, value: 'pay_debited' },
      { label: t.refundStatus, value: 'pay_refund' },
      { label: t.paymentHelp, value: 'pay_methods' },
    ]);
  };

  const showFAQ = () => {
    setCurrentFlow('faq');
    addBotMessage('❓ FAQ Quick Help:', [
      { label: t.faqWhere, value: 'faq_where' },
      { label: t.faqCancel, value: 'faq_cancel' },
      { label: t.faqRefund, value: 'faq_refund' },
      { label: t.faqPayment, value: 'faq_payment' },
    ]);
  };

  const showMoreHelp = () => {
    setCurrentFlow('more_help');
    addBotMessage(t.needMoreHelp, [
      { label: t.whatsapp, value: 'whatsapp' },
      { label: t.callSupport, value: 'call' },
      { label: t.liveAgent, value: 'live_agent' },
    ]);
  };

  const showMainMenuOption = () => {
    setTimeout(() => {
      addBotMessage('', [
        { label: t.backToMenu, value: 'main_menu' },
      ]);
    }, 500);
  };

  const handleFAQAnswer = (faqKey: string) => {
    const answers: Record<string, string> = {
      faq_where: language === 'te' 
        ? 'మీ ఆర్డర్‌ను ట్రాక్ చేయడానికి, ఆర్డర్ వివరాలు > ఆర్డర్ ట్రాక్ చేయండి ఎంచుకోండి. మీరు ట్రాకింగ్ అప్‌డేట్‌లను ఆర్డర్ వివరాల పేజీలో చూడవచ్చు.'
        : 'To track your order, go to Order Details > Track Order. You can see tracking updates on the order details page.',
      faq_cancel: language === 'te'
        ? 'ఆర్డర్ రద్దు చేయడానికి: ఆర్డర్ వివరాలు > ఆర్డర్ రద్దు చేయండి. షిప్ కాకముందే రద్దు చేయవచ్చు.'
        : 'To cancel: Go to Order Details > Cancel Order. You can cancel before it is shipped.',
      faq_refund: language === 'te'
        ? 'రీఫండ్ సాధారణంగా 2-3 నిమిషాల్లో ప్రాసెస్ అవుతుంది. మీ రీఫండ్ స్థితిని ఆర్డర్ వివరాలలో చూడవచ్చు.'
        : 'Refunds are typically processed within 2-3 minutes. You can check your refund status in Order Details.',
      faq_payment: language === 'te'
        ? 'చెల్లింపు విఫలమైతే: 1) ఇంటర్నెట్ కనెక్షన్ చెక్ చేయండి 2) వేరే చెల్లింపు విధానం ప్రయత్నించండి 3) బ్యాంకును సంప్రదించండి'
        : 'If payment failed: 1) Check internet connection 2) Try a different payment method 3) Contact your bank',
    };
    addBotMessage(answers[faqKey] || 'Please contact our support team for more details.');
    showMainMenuOption();
  };

  const handleOptionClick = (value: string) => {
    // Add user selection as message
    const option = messages.flatMap(m => m.options || []).find(o => o.value === value);
    if (option) addUserMessage(option.label);

    switch (value) {
      case 'en':
      case 'te':
        showMainMenu();
        break;
      case 'orders':
        showOrders();
        break;
      case 'payments':
        showPaymentMenu();
        break;
      case 'products':
        addBotMessage(language === 'te' 
          ? '🛍️ ఉత్పత్తి సమాచారం కోసం, దయచేసి మా ప్రొడక్ట్ పేజీని సందర్శించండి.'
          : '🛍️ For product information, please visit our products page.');
        showMainMenuOption();
        break;
      case 'faq':
        showFAQ();
        break;
      case 'track':
        if (selectedOrder) {
          navigate(`/orders/${selectedOrder.id}`);
        }
        break;
      case 'cancel':
        if (selectedOrder) {
          if (['shipped', 'delivered', 'cancelled', 'returned'].includes(selectedOrder.status)) {
            addBotMessage(language === 'te' 
              ? '❌ ఈ ఆర్డర్‌ను ఇప్పుడు రద్దు చేయడం సాధ్యం కాదు.'
              : '❌ This order cannot be cancelled at this stage.');
          } else {
            navigate(`/orders/${selectedOrder.id}`);
          }
          showMainMenuOption();
        }
        break;
      case 'return':
        if (selectedOrder) {
          if (selectedOrder.status === 'delivered') {
            navigate(`/orders/${selectedOrder.id}`);
          } else {
            addBotMessage(language === 'te'
              ? '❌ డెలివరీ తర్వాత మాత్రమే రిటర్న్ చేయవచ్చు.'
              : '❌ Returns are only available after delivery.');
            showMainMenuOption();
          }
        }
        break;
      case 'view':
        if (selectedOrder) navigate(`/orders/${selectedOrder.id}`);
        break;
      case 'pay_failed':
      case 'pay_debited':
      case 'pay_refund':
      case 'pay_methods':
        handlePaymentAnswer(value);
        break;
      case 'faq_where':
      case 'faq_cancel':
      case 'faq_refund':
      case 'faq_payment':
        handleFAQAnswer(value);
        break;
      case 'whatsapp':
        window.open('https://wa.me/911234567890', '_blank');
        break;
      case 'call':
        window.open('tel:+911234567890');
        break;
      case 'live_agent':
        addBotMessage(t.escalation);
        showMainMenuOption();
        break;
      case 'main_menu':
        showMainMenu();
        break;
      case 'more_help':
        showMoreHelp();
        break;
      default:
        // Order selection
        if (value.startsWith('order_')) {
          const oid = value.replace('order_', '');
          const ord = orders.find(o => o.id === oid);
          if (ord) showOrderActions(ord);
        }
        break;
    }
  };

  const handlePaymentAnswer = (key: string) => {
    const answers: Record<string, string> = {
      pay_failed: language === 'te'
        ? '💳 చెల్లింపు విఫలమైతే, మొత్తం ఆటోమేటిక్‌గా 24-48 గంటల్లో రీఫండ్ అవుతుంది. ఇంకా సమస్య ఉంటే, "Need Help" టైప్ చేయండి.'
        : '💳 If payment failed, the amount will be automatically refunded within 24-48 hours. If issue persists, type "Need Help".',
      pay_debited: language === 'te'
        ? '💳 మొత్తం డెబిట్ అయి ఆర్డర్ కన్ఫర్మ్ కాకపోతే, 24 గంటల్లో ఆటోమేటిక్ రీఫండ్ అవుతుంది.'
        : '💳 If amount was debited but order not confirmed, an automatic refund will be initiated within 24 hours.',
      pay_refund: language === 'te'
        ? '💳 రీఫండ్ సాధారణంగా 2-3 నిమిషాల్లో ప్రాసెస్ అవుతుంది. ఆర్డర్ వివరాలలో రీఫండ్ స్థితి చూడవచ్చు.'
        : '💳 Refunds are processed within 2-3 minutes. Check refund status in Order Details.',
      pay_methods: language === 'te'
        ? '💳 మేము UPI, క్రెడిట్/డెబిట్ కార్డ్, నెట్ బ్యాంకింగ్, కాష్ ఆన్ డెలివరీ సపోర్ట్ చేస్తాము.'
        : '💳 We support UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery.',
    };
    addBotMessage(answers[key] || 'Please contact support.');
    showMainMenuOption();
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    addUserMessage(text);
    setInputText('');

    const lower = text.toLowerCase();
    if (lower === 'resolved' || lower === 'thanks' || lower === 'thank you') {
      setTimeout(() => addBotMessage(t.resolved), 500);
      return;
    }
    if (lower === 'need help' || lower === 'help') {
      setTimeout(() => {
        addBotMessage(t.escalation);
        showMainMenuOption();
      }, 500);
      return;
    }
    if (lower === 'menu' || lower === 'back') {
      setTimeout(() => showMainMenu(), 300);
      return;
    }

    // Check if user typed an order number
    const matchOrder = orders.find(o => 
      o.order_number.toLowerCase() === lower || o.id === text
    );
    if (matchOrder) {
      setTimeout(() => showOrderActions(matchOrder), 300);
      return;
    }

    setTimeout(() => {
      addBotMessage(language === 'te'
        ? 'క్షమించండి, నాకు అర్థం కాలేదు. దయచేసి ఒక ఆప్షన్ ఎంచుకోండి లేదా "menu" టైప్ చేయండి.'
        : 'Sorry, I didn\'t understand that. Please select an option or type "menu" to go back.');
      showMoreHelp();
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'shipped': case 'out_for_delivery': return 'text-blue-600 bg-blue-50';
      case 'cancelled': case 'returned': return 'text-red-600 bg-red-50';
      default: return 'text-orange-600 bg-orange-50';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <X className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Agrizin Support</h1>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center px-4 py-2 text-xs text-muted-foreground">
        {t.disclaimer}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.type === 'user' ? '' : ''}`}>
              {/* Order Card */}
              {msg.orderCard && (
                <button
                  onClick={() => handleOptionClick(`order_${msg.orderCard!.id}`)}
                  className="w-full bg-white border border-border rounded-xl p-3 mb-1 text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {(() => {
                          const items = Array.isArray(msg.orderCard!.items) ? msg.orderCard!.items : [];
                          const first = items[0] as any;
                          return first?.name || first?.product_name || msg.orderCard!.order_number;
                        })()}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(msg.orderCard!.status)}`}>
                          {msg.orderCard!.status.charAt(0).toUpperCase() + msg.orderCard!.status.slice(1).replace('_', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">₹{msg.orderCard!.total_amount}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              )}

              {/* Text bubble */}
              {msg.content && (
                <div className={`rounded-2xl px-4 py-2.5 ${
                  msg.type === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-white border border-border text-foreground rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              )}

              {/* Options */}
              {msg.options && msg.options.length > 0 && (
                <div className={`mt-2 space-y-2 ${msg.content ? '' : ''}`}>
                  {!msg.content && !msg.orderCard && (
                    <div className="bg-white border border-border rounded-2xl rounded-bl-md px-4 py-3 space-y-2">
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(opt.value)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border hover:bg-accent/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            {opt.icon}
                            <span className="text-sm font-medium text-primary">{opt.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.content && msg.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionClick(opt.value)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border bg-white hover:bg-accent/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        <span className="text-sm font-medium text-primary">{opt.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <p className={`text-[10px] text-muted-foreground mt-1 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-16 lg:bottom-0 bg-white border-t border-border px-3 py-3">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t.writeMessage}
              className="rounded-full border-border pr-10 bg-muted/30"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="rounded-full h-10 w-10 flex-shrink-0"
            disabled={!inputText.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="h-16 lg:hidden" />
    </div>
  );
};

export default SupportChat;
