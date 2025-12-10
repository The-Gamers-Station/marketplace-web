import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ShoppingBag, Truck, Shield, CreditCard, RotateCcw, PhoneCall, User } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useTranslation } from 'react-i18next';
import './FAQPage.css';

const FAQPage = () => {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState('general');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (itemId) => {
    setOpenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const faqSections = {
    general: {
      title: t('pages.faq.general'),
      icon: <HelpCircle size={20} />,
      questions: [
        {
          id: 'g1',
          question: i18n.language === 'ar' ? 'ما هو GamersStation؟' : 'What is GamersStation?',
          answer: i18n.language === 'ar' ? 'GamersStation هو أكبر منصة للألعاب في المنطقة، حيث يمكنك شراء وبيع الألعاب والأجهزة والإكسسوارات الخاصة بالألعاب. نحن نوفر بيئة آمنة وموثوقة للاعبين والتجار على حد سواء.' : 'GamersStation is the largest gaming platform in the region, where you can buy and sell games, devices, and gaming accessories. We provide a safe and reliable environment for both gamers and merchants.'
        },
        {
          id: 'g2',
          question: i18n.language === 'ar' ? 'كيف يمكنني التسجيل في الموقع؟' : 'How can I register on the site?',
          answer: i18n.language === 'ar' ? 'يمكنك التسجيل بسهولة عن طريق النقر على زر "تسجيل" في أعلى الصفحة. ستحتاج فقط إلى إدخال رقم هاتفك المحمول وسنرسل لك رمز التحقق عبر رسالة نصية.' : 'You can easily register by clicking the "Register" button at the top of the page. You will only need to enter your mobile number and we will send you a verification code via SMS.'
        },
        {
          id: 'g3',
          question: i18n.language === 'ar' ? 'هل الموقع آمن؟' : 'Is the site secure?',
          answer: i18n.language === 'ar' ? 'نعم، نحن نستخدم أحدث تقنيات الأمان والتشفير لحماية بياناتك الشخصية ومعاملاتك المالية. جميع المعاملات محمية وندقق في جميع التجار قبل السماح لهم بالبيع على المنصة.' : 'Yes, we use the latest security and encryption technologies to protect your personal data and financial transactions. All transactions are protected and we verify all merchants before allowing them to sell on the platform.'
        },
        {
          id: 'g4',
          question: i18n.language === 'ar' ? 'ما هي المناطق التي تغطونها؟' : 'What areas do you cover?',
          answer: i18n.language === 'ar' ? 'نحن نغطي جميع محافظات مصر، مع توفر خدمات التوصيل في معظم المدن الرئيسية. يمكنك التحقق من توفر الخدمة في منطقتك عند إدخال عنوانك.' : 'We cover all governorates of Egypt, with delivery services available in most major cities. You can check service availability in your area when entering your address.'
        }
      ]
    },
    shopping: {
      title: t('pages.faq.shopping'),
      icon: <ShoppingBag size={20} />,
      questions: [
        {
          id: 's1',
          question: i18n.language === 'ar' ? 'كيف يمكنني البحث عن منتج معين؟' : 'How can I search for a specific product?',
          answer: i18n.language === 'ar' ? 'استخدم شريط البحث في أعلى الصفحة للبحث عن أي لعبة أو منتج. يمكنك أيضًا استخدام الفلاتر لتحديد الفئة، السعر، الحالة، والمنطقة.' : 'Use the search bar at the top of the page to search for any game or product. You can also use filters to specify category, price, condition, and region.'
        },
        {
          id: 's2',
          question: i18n.language === 'ar' ? 'كيف أعرف أن المنتج أصلي؟' : 'How do I know the product is authentic?',
          answer: i18n.language === 'ar' ? 'جميع التجار على منصتنا موثقون ونطلب منهم تقديم ضمانات الأصالة. كما يمكنك قراءة تقييمات المشترين السابقين والتواصل مع البائع مباشرة للحصول على المزيد من المعلومات.' : 'All merchants on our platform are verified and we require them to provide authenticity guarantees. You can also read reviews from previous buyers and contact the seller directly for more information.'
        },
        {
          id: 's3',
          question: i18n.language === 'ar' ? 'هل يمكنني حجز المنتج قبل الشراء؟' : 'Can I reserve a product before purchasing?',
          answer: i18n.language === 'ar' ? 'نعم، يمكنك التواصل مع البائع لحجز المنتج لفترة محددة. بعض البائعين يقبلون الحجز مع دفع عربون صغير.' : 'Yes, you can contact the seller to reserve the product for a specific period. Some sellers accept reservations with a small deposit.'
        },
        {
          id: 's4',
          question: i18n.language === 'ar' ? 'ماذا لو وجدت سعرًا أفضل في مكان آخر؟' : 'What if I find a better price elsewhere?',
          answer: i18n.language === 'ar' ? 'أسعارنا تنافسية ونشجع البائعين على تقديم أفضل الأسعار. يمكنك التفاوض مع البائع مباشرة أو البحث عن عروض أخرى على المنصة.' : 'Our prices are competitive and we encourage sellers to offer the best prices. You can negotiate with the seller directly or search for other offers on the platform.'
        }
      ]
    },
    payment: {
      title: t('pages.faq.payment'),
      icon: <CreditCard size={20} />,
      questions: [
        {
          id: 'p1',
          question: i18n.language === 'ar' ? 'ما هي طرق الدفع المتاحة؟' : 'What payment methods are available?',
          answer: i18n.language === 'ar' ? 'نقبل الدفع نقدًا عند الاستلام، البطاقات الائتمانية (فيزا وماستركارد)، المحافظ الإلكترونية (فودافون كاش، اورانج كاش، اتصالات كاش)، والتحويل البنكي.' : 'We accept cash on delivery, credit cards (Visa and Mastercard), e-wallets (Vodafone Cash, Orange Cash, Etisalat Cash), and bank transfers.'
        },
        {
          id: 'p2',
          question: i18n.language === 'ar' ? 'هل الدفع عند الاستلام متاح؟' : 'Is cash on delivery available?',
          answer: i18n.language === 'ar' ? 'نعم، الدفع عند الاستلام متاح في معظم المناطق. قد تطبق رسوم إضافية بسيطة على هذه الخدمة حسب موقعك.' : 'Yes, cash on delivery is available in most areas. Small additional fees may apply for this service depending on your location.'
        },
        {
          id: 'p3',
          question: i18n.language === 'ar' ? 'هل معلومات بطاقتي الائتمانية آمنة؟' : 'Is my credit card information secure?',
          answer: i18n.language === 'ar' ? 'نعم، نحن نستخدم تشفير SSL ونتبع معايير PCI DSS لضمان أمان معلومات الدفع. لا نحتفظ بتفاصيل بطاقتك الائتمانية على خوادمنا.' : 'Yes, we use SSL encryption and follow PCI DSS standards to ensure payment information security. We do not store your credit card details on our servers.'
        },
        {
          id: 'p4',
          question: i18n.language === 'ar' ? 'هل يمكنني الدفع بالتقسيط؟' : 'Can I pay in installments?',
          answer: i18n.language === 'ar' ? 'نعم، نوفر خيارات التقسيط من خلال شراكاتنا مع البنوك المختلفة. يمكنك اختيار خطة التقسيط المناسبة لك عند الدفع.' : 'Yes, we provide installment options through our partnerships with various banks. You can choose the installment plan that suits you at checkout.'
        }
      ]
    },
    shipping: {
      title: t('pages.faq.shipping'),
      icon: <Truck size={20} />,
      questions: [
        {
          id: 'sh1',
          question: i18n.language === 'ar' ? 'كم تستغرق عملية التوصيل؟' : 'How long does delivery take?',
          answer: i18n.language === 'ar' ? 'عادة ما يتم التوصيل خلال 2-5 أيام عمل حسب موقعك. للمنتجات الموجودة في نفس المدينة، قد يتم التوصيل في نفس اليوم أو اليوم التالي.' : 'Delivery usually takes 2-5 business days depending on your location. For products in the same city, delivery may be same day or next day.'
        },
        {
          id: 'sh2',
          question: i18n.language === 'ar' ? 'كم تكلفة الشحن؟' : 'How much is shipping?',
          answer: i18n.language === 'ar' ? 'تختلف تكلفة الشحن حسب حجم ووزن المنتج والمسافة. ستظهر لك التكلفة الدقيقة قبل إتمام عملية الشراء. كما نوفر شحن مجاني للطلبات فوق مبلغ معين.' : 'Shipping costs vary depending on product size, weight, and distance. The exact cost will be shown before completing your purchase. We also offer free shipping on orders above a certain amount.'
        },
        {
          id: 'sh3',
          question: i18n.language === 'ar' ? 'هل يمكنني تتبع طلبي؟' : 'Can I track my order?',
          answer: i18n.language === 'ar' ? 'نعم، بمجرد شحن طلبك، سنرسل لك رقم التتبع عبر رسالة نصية والبريد الإلكتروني. يمكنك استخدامه لتتبع طلبك في أي وقت.' : 'Yes, once your order is shipped, we will send you a tracking number via SMS and email. You can use it to track your order at any time.'
        },
        {
          id: 'sh4',
          question: i18n.language === 'ar' ? 'ماذا لو لم أكن موجودًا عند التوصيل؟' : 'What if I am not available at delivery?',
          answer: i18n.language === 'ar' ? 'سيحاول مندوب التوصيل الاتصال بك. إذا لم تكن متاحًا، سيتم إعادة محاولة التوصيل في اليوم التالي أو يمكنك الترتيب لاستلام الطرد من أقرب نقطة تجميع.' : 'The delivery representative will try to contact you. If you are not available, delivery will be reattempted the next day or you can arrange to pick up the package from the nearest collection point.'
        }
      ]
    },
    returns: {
      title: t('pages.faq.returns'),
      icon: <RotateCcw size={20} />,
      questions: [
        {
          id: 'r1',
          question: i18n.language === 'ar' ? 'ما هي سياسة الإرجاع؟' : 'What is the return policy?',
          answer: i18n.language === 'ar' ? 'يمكنك إرجاع المنتج خلال 14 يومًا من تاريخ الاستلام بشرط أن يكون في حالته الأصلية مع جميع الملحقات والعبوة. بعض المنتجات مثل الألعاب الرقمية غير قابلة للإرجاع.' : 'You can return the product within 14 days of receipt provided it is in its original condition with all accessories and packaging. Some products such as digital games are non-returnable.'
        },
        {
          id: 'r2',
          question: i18n.language === 'ar' ? 'كيف أطلب إرجاع منتج؟' : 'How do I request a return?',
          answer: i18n.language === 'ar' ? 'يمكنك طلب الإرجاع من خلال حسابك في قسم "طلباتي" أو التواصل مع خدمة العملاء. سنرسل لك تعليمات الإرجاع ورقم الشحنة المرتجعة.' : 'You can request a return through your account in the "My Orders" section or contact customer service. We will send you return instructions and a return shipping number.'
        },
        {
          id: 'r3',
          question: i18n.language === 'ar' ? 'متى سأحصل على المبلغ المسترد؟' : 'When will I get my refund?',
          answer: i18n.language === 'ar' ? 'بمجرد استلامنا للمنتج المرتجع والتحقق من حالته، سيتم رد المبلغ خلال 5-10 أيام عمل حسب طريقة الدفع الأصلية.' : 'Once we receive the returned product and verify its condition, the refund will be processed within 5-10 business days depending on the original payment method.'
        },
        {
          id: 'r4',
          question: i18n.language === 'ar' ? 'هل يمكنني استبدال المنتج بدلاً من إرجاعه؟' : 'Can I exchange the product instead of returning it?',
          answer: i18n.language === 'ar' ? 'نعم، يمكنك طلب استبدال المنتج بآخر من نفس القيمة أو دفع الفرق. يخضع الاستبدال لتوفر المنتج البديل.' : 'Yes, you can request to exchange the product for another of the same value or pay the difference. Exchange is subject to availability of the replacement product.'
        }
      ]
    },
    sellers: {
      title: t('pages.faq.sellers'),
      icon: <User size={20} />,
      questions: [
        {
          id: 'se1',
          question: i18n.language === 'ar' ? 'كيف أصبح بائعًا على GamersStation؟' : 'How do I become a seller on GamersStation?',
          answer: i18n.language === 'ar' ? 'يمكنك التسجيل كبائع بسهولة من خلال النقر على "كن بائعًا" وملء النموذج المطلوب. سنراجع طلبك خلال 24-48 ساعة وسنبلغك بالموافقة.' : 'You can easily register as a seller by clicking "Become a Seller" and filling out the required form. We will review your application within 24-48 hours and notify you of approval.'
        },
        {
          id: 'se2',
          question: i18n.language === 'ar' ? 'ما هي العمولة المطلوبة؟' : 'What is the commission fee?',
          answer: i18n.language === 'ar' ? 'نحتسب عمولة بسيطة تتراوح بين 5-10% حسب فئة المنتج وحجم المبيعات. ستحصل على تفاصيل كاملة عند التسجيل كبائع.' : 'We charge a simple commission ranging from 5-10% depending on product category and sales volume. You will get full details when registering as a seller.'
        },
        {
          id: 'se3',
          question: i18n.language === 'ar' ? 'كيف أحصل على أموالي من المبيعات؟' : 'How do I get my money from sales?',
          answer: i18n.language === 'ar' ? 'يمكنك سحب أرباحك أسبوعيًا عبر التحويل البنكي أو المحافظ الإلكترونية. الحد الأدنى للسحب هو 500 جنيه.' : 'You can withdraw your earnings weekly via bank transfer or e-wallets. The minimum withdrawal amount is 500 EGP.'
        },
        {
          id: 'se4',
          question: i18n.language === 'ar' ? 'هل توفرون دعمًا للبائعين؟' : 'Do you provide support for sellers?',
          answer: i18n.language === 'ar' ? 'نعم، لدينا فريق دعم مخصص للبائعين لمساعدتك في إدارة متجرك، تحسين مبيعاتك، وحل أي مشاكل قد تواجهها.' : 'Yes, we have a dedicated seller support team to help you manage your store, improve your sales, and solve any problems you may face.'
        }
      ]
    },
    support: {
      title: i18n.language === 'ar' ? 'الدعم الفني' : 'Technical Support',
      icon: <PhoneCall size={20} />,
      questions: [
        {
          id: 'su1',
          question: i18n.language === 'ar' ? 'كيف يمكنني التواصل مع خدمة العملاء؟' : 'How can I contact customer service?',
          answer: i18n.language === 'ar' ? 'يمكنك التواصل معنا عبر الدردشة المباشرة على الموقع أو البريد الإلكتروني contact@thegamersstation.com.' : 'You can contact us via live chat on the website or email contact@thegamersstation.com.'
        },
        {
          id: 'su2',
          question: i18n.language === 'ar' ? 'لدي مشكلة في حسابي، ماذا أفعل؟' : 'I have a problem with my account, what should I do?',
          answer: i18n.language === 'ar' ? 'يمكنك إعادة تعيين كلمة المرور من صفحة تسجيل الدخول، أو التواصل مع فريق الدعم مع ذكر رقم هاتفك المسجل وسنساعدك في استعادة حسابك.' : 'You can reset your password from the login page, or contact the support team with your registered phone number and we will help you recover your account.'
        },
        {
          id: 'su3',
          question: i18n.language === 'ar' ? 'كيف أبلغ عن منتج مخالف أو بائع محتال؟' : 'How do I report a violating product or fraudulent seller?',
          answer: i18n.language === 'ar' ? 'يمكنك الإبلاغ مباشرة من صفحة المنتج أو البائع بالنقر على "إبلاغ". سنراجع البلاغ خلال 24 ساعة ونتخذ الإجراء المناسب.' : 'You can report directly from the product or seller page by clicking "Report". We will review the report within 24 hours and take appropriate action.'
        },
        {
          id: 'su4',
          question: i18n.language === 'ar' ? 'هل يمكنني تقديم اقتراح لتحسين الموقع؟' : 'Can I submit a suggestion to improve the site?',
          answer: i18n.language === 'ar' ? 'بالتأكيد! نرحب بجميع الاقتراحات والآراء. يمكنك إرسالها عبر البريد الإلكتروني feedback@gamersstation.com أو من خلال نموذج "اتصل بنا".' : 'Absolutely! We welcome all suggestions and feedback. You can send them via email to feedback@gamersstation.com or through the "Contact Us" form.'
        }
      ]
    },
    warranty: {
      title: i18n.language === 'ar' ? 'الضمان والحماية' : 'Warranty and Protection',
      icon: <Shield size={20} />,
      questions: [
        {
          id: 'w1',
          question: i18n.language === 'ar' ? 'هل المنتجات مضمونة؟' : 'Are products guaranteed?',
          answer: i18n.language === 'ar' ? 'نعم، جميع المنتجات الجديدة تأتي مع ضمان المصنع. المنتجات المستعملة قد تأتي مع ضمان محدود من البائع. تأكد من قراءة تفاصيل الضمان قبل الشراء.' : 'Yes, all new products come with manufacturer warranty. Used products may come with limited warranty from the seller. Make sure to read warranty details before purchasing.'
        },
        {
          id: 'w2',
          question: i18n.language === 'ar' ? 'ماذا يغطي الضمان؟' : 'What does the warranty cover?',
          answer: i18n.language === 'ar' ? 'الضمان يغطي عيوب الصناعة والأعطال غير الناتجة عن سوء الاستخدام. لا يغطي الضمان الأضرار الناتجة عن السقوط، السوائل، أو التعديلات غير المصرح بها.' : 'The warranty covers manufacturing defects and malfunctions not caused by misuse. The warranty does not cover damage from drops, liquids, or unauthorized modifications.'
        },
        {
          id: 'w3',
          question: i18n.language === 'ar' ? 'كيف أطالب بالضمان؟' : 'How do I claim warranty?',
          answer: i18n.language === 'ar' ? 'احتفظ بالفاتورة وتواصل مع خدمة العملاء أو البائع مباشرة. سنرشدك خلال عملية المطالبة بالضمان وإرسال المنتج للصيانة أو الاستبدال.' : 'Keep your invoice and contact customer service or the seller directly. We will guide you through the warranty claim process and sending the product for repair or replacement.'
        },
        {
          id: 'w4',
          question: i18n.language === 'ar' ? 'هل يمكنني شراء ضمان إضافي؟' : 'Can I purchase extended warranty?',
          answer: i18n.language === 'ar' ? 'نعم، نوفر خطط حماية إضافية لتمديد فترة الضمان وتغطية المزيد من الحوادث. يمكنك إضافتها عند الشراء.' : 'Yes, we offer additional protection plans to extend warranty period and cover more incidents. You can add them at checkout.'
        }
      ]
    }
  };

  const FAQItem = ({ question, answer, isOpen, onToggle }) => (
    <div className="faq-item">
      <button className="faq-question" onClick={onToggle}>
        <span>{question}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="faq-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="faq-page">
      <Header />
      
      <div className="faq-hero">
        <div className="hero-content">
          <h1>{t('pages.faq.title')}</h1>
          <p>{i18n.language === 'ar' ? 'إجابات على جميع استفساراتك حول GamersStation' : 'Answers to all your questions about GamersStation'}</p>
          <div className="search-box">
            <input 
              type="text" 
              placeholder={t('pages.faq.searchPlaceholder')}
              className="faq-search-input"
            />
            <button className="search-btn">{i18n.language === 'ar' ? 'بحث' : 'Search'}</button>
          </div>
        </div>
      </div>

      <div className="faq-container">
        <aside className="faq-sidebar">
          <h3>{i18n.language === 'ar' ? 'الأقسام' : 'Sections'}</h3>
          <nav className="faq-nav">
            {Object.entries(faqSections).map(([key, section]) => (
              <button
                key={key}
                className={`faq-nav-item ${activeSection === key ? 'active' : ''}`}
                onClick={() => setActiveSection(key)}
              >
                {section.icon}
                <span>{section.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="faq-content">
          <div className="section-header">
            <h2>{faqSections[activeSection].title}</h2>
          </div>
          
          <div className="faq-list">
            {faqSections[activeSection].questions.map(item => (
              <FAQItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                isOpen={openItems[item.id]}
                onToggle={() => toggleItem(item.id)}
              />
            ))}
          </div>
        </main>
      </div>

      <section className="contact-section">
        <div className="contact-container">
          <h2>{t('pages.faq.needMoreHelp')}</h2>
          <p>{i18n.language === 'ar' ? 'فريق الدعم جاهز لمساعدتك في أي وقت' : 'Our support team is ready to help you anytime'}</p>
          <div className="contact-options">
            <div className="contact-card">
              <Shield size={32} />
              <h3>{t('pages.contact.email')}</h3>
              <p>contact@thegamersstation.com</p>
              <small>{i18n.language === 'ar' ? 'تواصل معنا في أي وقت' : 'Contact us anytime'}</small>
            </div>
            <div className="contact-card">
              <HelpCircle size={32} />
              <h3>{i18n.language === 'ar' ? 'الدردشة المباشرة' : 'Live Chat'}</h3>
              <p>{i18n.language === 'ar' ? 'دردشة فورية' : 'Instant chat'}</p>
              <small>{i18n.language === 'ar' ? 'متاح 24/7' : 'Available 24/7'}</small>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default FAQPage;