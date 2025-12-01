import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ShoppingBag, Truck, Shield, CreditCard, RotateCcw, PhoneCall, User } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './FAQPage.css';

const FAQPage = () => {
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
      title: 'عام',
      icon: <HelpCircle size={20} />,
      questions: [
        {
          id: 'g1',
          question: 'ما هو GamersStation؟',
          answer: 'GamersStation هو أكبر منصة للألعاب في المنطقة، حيث يمكنك شراء وبيع الألعاب والأجهزة والإكسسوارات الخاصة بالألعاب. نحن نوفر بيئة آمنة وموثوقة للاعبين والتجار على حد سواء.'
        },
        {
          id: 'g2',
          question: 'كيف يمكنني التسجيل في الموقع؟',
          answer: 'يمكنك التسجيل بسهولة عن طريق النقر على زر "تسجيل" في أعلى الصفحة. ستحتاج فقط إلى إدخال رقم هاتفك المحمول وسنرسل لك رمز التحقق عبر رسالة نصية.'
        },
        {
          id: 'g3',
          question: 'هل الموقع آمن؟',
          answer: 'نعم، نحن نستخدم أحدث تقنيات الأمان والتشفير لحماية بياناتك الشخصية ومعاملاتك المالية. جميع المعاملات محمية وندقق في جميع التجار قبل السماح لهم بالبيع على المنصة.'
        },
        {
          id: 'g4',
          question: 'ما هي المناطق التي تغطونها؟',
          answer: 'نحن نغطي جميع محافظات مصر، مع توفر خدمات التوصيل في معظم المدن الرئيسية. يمكنك التحقق من توفر الخدمة في منطقتك عند إدخال عنوانك.'
        }
      ]
    },
    shopping: {
      title: 'الشراء',
      icon: <ShoppingBag size={20} />,
      questions: [
        {
          id: 's1',
          question: 'كيف يمكنني البحث عن منتج معين؟',
          answer: 'استخدم شريط البحث في أعلى الصفحة للبحث عن أي لعبة أو منتج. يمكنك أيضًا استخدام الفلاتر لتحديد الفئة، السعر، الحالة، والمنطقة.'
        },
        {
          id: 's2',
          question: 'كيف أعرف أن المنتج أصلي؟',
          answer: 'جميع التجار على منصتنا موثقون ونطلب منهم تقديم ضمانات الأصالة. كما يمكنك قراءة تقييمات المشترين السابقين والتواصل مع البائع مباشرة للحصول على المزيد من المعلومات.'
        },
        {
          id: 's3',
          question: 'هل يمكنني حجز المنتج قبل الشراء؟',
          answer: 'نعم، يمكنك التواصل مع البائع لحجز المنتج لفترة محددة. بعض البائعين يقبلون الحجز مع دفع عربون صغير.'
        },
        {
          id: 's4',
          question: 'ماذا لو وجدت سعرًا أفضل في مكان آخر؟',
          answer: 'أسعارنا تنافسية ونشجع البائعين على تقديم أفضل الأسعار. يمكنك التفاوض مع البائع مباشرة أو البحث عن عروض أخرى على المنصة.'
        }
      ]
    },
    payment: {
      title: 'الدفع',
      icon: <CreditCard size={20} />,
      questions: [
        {
          id: 'p1',
          question: 'ما هي طرق الدفع المتاحة؟',
          answer: 'نقبل الدفع نقدًا عند الاستلام، البطاقات الائتمانية (فيزا وماستركارد)، المحافظ الإلكترونية (فودافون كاش، اورانج كاش، اتصالات كاش)، والتحويل البنكي.'
        },
        {
          id: 'p2',
          question: 'هل الدفع عند الاستلام متاح؟',
          answer: 'نعم، الدفع عند الاستلام متاح في معظم المناطق. قد تطبق رسوم إضافية بسيطة على هذه الخدمة حسب موقعك.'
        },
        {
          id: 'p3',
          question: 'هل معلومات بطاقتي الائتمانية آمنة؟',
          answer: 'نعم، نحن نستخدم تشفير SSL ونتبع معايير PCI DSS لضمان أمان معلومات الدفع. لا نحتفظ بتفاصيل بطاقتك الائتمانية على خوادمنا.'
        },
        {
          id: 'p4',
          question: 'هل يمكنني الدفع بالتقسيط؟',
          answer: 'نعم، نوفر خيارات التقسيط من خلال شراكاتنا مع البنوك المختلفة. يمكنك اختيار خطة التقسيط المناسبة لك عند الدفع.'
        }
      ]
    },
    shipping: {
      title: 'الشحن والتوصيل',
      icon: <Truck size={20} />,
      questions: [
        {
          id: 'sh1',
          question: 'كم تستغرق عملية التوصيل؟',
          answer: 'عادة ما يتم التوصيل خلال 2-5 أيام عمل حسب موقعك. للمنتجات الموجودة في نفس المدينة، قد يتم التوصيل في نفس اليوم أو اليوم التالي.'
        },
        {
          id: 'sh2',
          question: 'كم تكلفة الشحن؟',
          answer: 'تختلف تكلفة الشحن حسب حجم ووزن المنتج والمسافة. ستظهر لك التكلفة الدقيقة قبل إتمام عملية الشراء. كما نوفر شحن مجاني للطلبات فوق مبلغ معين.'
        },
        {
          id: 'sh3',
          question: 'هل يمكنني تتبع طلبي؟',
          answer: 'نعم، بمجرد شحن طلبك، سنرسل لك رقم التتبع عبر رسالة نصية والبريد الإلكتروني. يمكنك استخدامه لتتبع طلبك في أي وقت.'
        },
        {
          id: 'sh4',
          question: 'ماذا لو لم أكن موجودًا عند التوصيل؟',
          answer: 'سيحاول مندوب التوصيل الاتصال بك. إذا لم تكن متاحًا، سيتم إعادة محاولة التوصيل في اليوم التالي أو يمكنك الترتيب لاستلام الطرد من أقرب نقطة تجميع.'
        }
      ]
    },
    returns: {
      title: 'الإرجاع والاستبدال',
      icon: <RotateCcw size={20} />,
      questions: [
        {
          id: 'r1',
          question: 'ما هي سياسة الإرجاع؟',
          answer: 'يمكنك إرجاع المنتج خلال 14 يومًا من تاريخ الاستلام بشرط أن يكون في حالته الأصلية مع جميع الملحقات والعبوة. بعض المنتجات مثل الألعاب الرقمية غير قابلة للإرجاع.'
        },
        {
          id: 'r2',
          question: 'كيف أطلب إرجاع منتج؟',
          answer: 'يمكنك طلب الإرجاع من خلال حسابك في قسم "طلباتي" أو التواصل مع خدمة العملاء. سنرسل لك تعليمات الإرجاع ورقم الشحنة المرتجعة.'
        },
        {
          id: 'r3',
          question: 'متى سأحصل على المبلغ المسترد؟',
          answer: 'بمجرد استلامنا للمنتج المرتجع والتحقق من حالته، سيتم رد المبلغ خلال 5-10 أيام عمل حسب طريقة الدفع الأصلية.'
        },
        {
          id: 'r4',
          question: 'هل يمكنني استبدال المنتج بدلاً من إرجاعه؟',
          answer: 'نعم، يمكنك طلب استبدال المنتج بآخر من نفس القيمة أو دفع الفرق. يخضع الاستبدال لتوفر المنتج البديل.'
        }
      ]
    },
    sellers: {
      title: 'البائعون',
      icon: <User size={20} />,
      questions: [
        {
          id: 'se1',
          question: 'كيف أصبح بائعًا على GamersStation؟',
          answer: 'يمكنك التسجيل كبائع بسهولة من خلال النقر على "كن بائعًا" وملء النموذج المطلوب. سنراجع طلبك خلال 24-48 ساعة وسنبلغك بالموافقة.'
        },
        {
          id: 'se2',
          question: 'ما هي العمولة المطلوبة؟',
          answer: 'نحتسب عمولة بسيطة تتراوح بين 5-10% حسب فئة المنتج وحجم المبيعات. ستحصل على تفاصيل كاملة عند التسجيل كبائع.'
        },
        {
          id: 'se3',
          question: 'كيف أحصل على أموالي من المبيعات؟',
          answer: 'يمكنك سحب أرباحك أسبوعيًا عبر التحويل البنكي أو المحافظ الإلكترونية. الحد الأدنى للسحب هو 500 جنيه.'
        },
        {
          id: 'se4',
          question: 'هل توفرون دعمًا للبائعين؟',
          answer: 'نعم، لدينا فريق دعم مخصص للبائعين لمساعدتك في إدارة متجرك، تحسين مبيعاتك، وحل أي مشاكل قد تواجهها.'
        }
      ]
    },
    support: {
      title: 'الدعم الفني',
      icon: <PhoneCall size={20} />,
      questions: [
        {
          id: 'su1',
          question: 'كيف يمكنني التواصل مع خدمة العملاء؟',
          answer: 'يمكنك التواصل معنا عبر الدردشة المباشرة على الموقع، البريد الإلكتروني support@gamersstation.com، أو الاتصال على 16789 من الأحد إلى الخميس من 9 صباحًا حتى 9 مساءً.'
        },
        {
          id: 'su2',
          question: 'لدي مشكلة في حسابي، ماذا أفعل؟',
          answer: 'يمكنك إعادة تعيين كلمة المرور من صفحة تسجيل الدخول، أو التواصل مع فريق الدعم مع ذكر رقم هاتفك المسجل وسنساعدك في استعادة حسابك.'
        },
        {
          id: 'su3',
          question: 'كيف أبلغ عن منتج مخالف أو بائع محتال؟',
          answer: 'يمكنك الإبلاغ مباشرة من صفحة المنتج أو البائع بالنقر على "إبلاغ". سنراجع البلاغ خلال 24 ساعة ونتخذ الإجراء المناسب.'
        },
        {
          id: 'su4',
          question: 'هل يمكنني تقديم اقتراح لتحسين الموقع؟',
          answer: 'بالتأكيد! نرحب بجميع الاقتراحات والآراء. يمكنك إرسالها عبر البريد الإلكتروني feedback@gamersstation.com أو من خلال نموذج "اتصل بنا".'
        }
      ]
    },
    warranty: {
      title: 'الضمان والحماية',
      icon: <Shield size={20} />,
      questions: [
        {
          id: 'w1',
          question: 'هل المنتجات مضمونة؟',
          answer: 'نعم، جميع المنتجات الجديدة تأتي مع ضمان المصنع. المنتجات المستعملة قد تأتي مع ضمان محدود من البائع. تأكد من قراءة تفاصيل الضمان قبل الشراء.'
        },
        {
          id: 'w2',
          question: 'ماذا يغطي الضمان؟',
          answer: 'الضمان يغطي عيوب الصناعة والأعطال غير الناتجة عن سوء الاستخدام. لا يغطي الضمان الأضرار الناتجة عن السقوط، السوائل، أو التعديلات غير المصرح بها.'
        },
        {
          id: 'w3',
          question: 'كيف أطالب بالضمان؟',
          answer: 'احتفظ بالفاتورة وتواصل مع خدمة العملاء أو البائع مباشرة. سنرشدك خلال عملية المطالبة بالضمان وإرسال المنتج للصيانة أو الاستبدال.'
        },
        {
          id: 'w4',
          question: 'هل يمكنني شراء ضمان إضافي؟',
          answer: 'نعم، نوفر خطط حماية إضافية لتمديد فترة الضمان وتغطية المزيد من الحوادث. يمكنك إضافتها عند الشراء.'
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
          <h1>الأسئلة الشائعة</h1>
          <p>إجابات على جميع استفساراتك حول GamersStation</p>
          <div className="search-box">
            <input 
              type="text" 
              placeholder="ابحث عن سؤالك هنا..."
              className="faq-search-input"
            />
            <button className="search-btn">بحث</button>
          </div>
        </div>
      </div>

      <div className="faq-container">
        <aside className="faq-sidebar">
          <h3>الأقسام</h3>
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
          <h2>لم تجد إجابة لسؤالك؟</h2>
          <p>فريق الدعم جاهز لمساعدتك في أي وقت</p>
          <div className="contact-options">
            <div className="contact-card">
              <PhoneCall size={32} />
              <h3>اتصل بنا</h3>
              <p>16789</p>
              <small>من 9 ص إلى 9 م</small>
            </div>
            <div className="contact-card">
              <Shield size={32} />
              <h3>البريد الإلكتروني</h3>
              <p>support@gamersstation.com</p>
              <small>رد خلال 24 ساعة</small>
            </div>
            <div className="contact-card">
              <HelpCircle size={32} />
              <h3>الدردشة المباشرة</h3>
              <p>دردشة فورية</p>
              <small>متاح 24/7</small>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default FAQPage;