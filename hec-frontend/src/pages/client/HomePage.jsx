import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBolt, FaLightbulb, FaTools, FaShieldAlt, FaStar, FaAward, FaClock } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useTranslation(['common', 'home']);
  
  // Animation controls for scroll-triggered animations
  const statsControls = useAnimation();
  const [statsRef, statsInView] = useInView({ threshold: 0.3, triggerOnce: true });
  
  useEffect(() => {
    if (statsInView) {
      statsControls.start('visible');
    }
  }, [statsControls, statsInView]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };
  
  const floatAnimation = {
    hidden: { y: 0, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        y: {
          yoyo: Infinity,
          duration: 2,
          ease: 'easeInOut'
        }
      }
    }
  };
  
  // Statistics animation
  const statsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };
  
  const statItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 100,
        duration: 0.8 
      }
    }
  };

  // Services data
  const services = [
    {
      icon: <FaBolt className="h-8 w-8 text-coquelicot" />,
      title: t('services.items.electrical.title', { ns: 'home' }),
      description: t('services.items.electrical.description', { ns: 'home' }),
    },
    {
      icon: <FaLightbulb className="h-8 w-8 text-coquelicot" />,
      title: t('services.items.energy.title', { ns: 'home' }),
      description: t('services.items.energy.description', { ns: 'home' }),
    },
    {
      icon: <FaTools className="h-8 w-8 text-coquelicot" />,
      title: t('services.items.maintenance.title', { ns: 'home' }),
      description: t('services.items.maintenance.description', { ns: 'home' }),
    },
    {
      icon: <FaShieldAlt className="h-8 w-8 text-coquelicot" />,
      title: t('services.items.security.title', { ns: 'home' }),
      description: t('services.items.security.description', { ns: 'home' }),
    },
  ];
  
  // Statistics data
  const stats = [
    {
      icon: <FaStar className="h-6 w-6 text-coquelicot" />,
      value: '500+',
      label: t('stats.projectsCompleted', { ns: 'home' }),
    },
    {
      icon: <FaAward className="h-6 w-6 text-coquelicot" />,
      value: '10+',
      label: t('stats.yearsExperience', { ns: 'home' }),
    },
    {
      icon: <FaTools className="h-6 w-6 text-coquelicot" />,
      value: '25+',
      label: t('stats.expertTechnicians', { ns: 'home' }),
    },
    {
      icon: <FaClock className="h-6 w-6 text-coquelicot" />,
      value: '24/7',
      label: t('stats.emergencySupport', { ns: 'home' }),
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      name: t('testimonials.items.client1.name', { ns: 'home' }),
      role: t('testimonials.items.client1.role', { ns: 'home' }),
      image: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=fe3201&color=fff',
      text: t('testimonials.items.client1.text', { ns: 'home' }),
    },
    {
      name: t('testimonials.items.client2.name', { ns: 'home' }),
      role: t('testimonials.items.client2.role', { ns: 'home' }),
      image: 'https://ui-avatars.com/api/?name=Michael+Brown&background=fe3201&color=fff',
      text: t('testimonials.items.client2.text', { ns: 'home' }),
    },
    {
      name: t('testimonials.items.client3.name', { ns: 'home' }),
      role: t('testimonials.items.client3.role', { ns: 'home' }),
      image: 'https://ui-avatars.com/api/?name=David+Wilson&background=fe3201&color=fff',
      text: t('testimonials.items.client3.text', { ns: 'home' }),
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-gray-100' : ''}`}>
      {/* Hero Section */}
      <section className={`relative py-16 md:py-24 ${isDark ? 'bg-gray-800' : 'bg-timberwolf-300'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center md:flex-row md:justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 50 }}
              className="mb-10 max-w-lg md:mb-0"
            >
              <motion.h1 
                className={`mb-6 text-4xl font-bold leading-tight md:text-5xl ${isDark ? 'text-white' : 'text-silver-100'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {t('hero.title', { ns: 'home' })}
              </motion.h1>
              <motion.p 
                className={`mb-8 text-lg ${isDark ? 'text-gray-300' : 'text-silver-200'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {t('hero.description', { ns: 'home' })}
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Link
                  to="/projects"
                  className="rounded-md bg-coquelicot px-6 py-3 font-medium text-white shadow-md transition-all duration-300 hover:bg-coquelicot-600 hover:scale-105 transform"
                >
                  {t('navigation.ourProjects', { ns: 'home' })}
                </Link>
                <Link
                  to="/contact"
                  className={`rounded-md border px-6 py-3 font-medium shadow-md transition-all duration-300 hover:scale-105 transform ${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-silver-300 bg-transparent text-silver-100 hover:bg-silver-200 hover:text-white'}`}
                >
                  {t('navigation.contactUs', { ns: 'home' })}
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 50 }}
              className="relative h-64 w-full max-w-md md:h-96"
            >
              <motion.div
                className="absolute -top-4 -left-4 h-full w-full rounded-lg bg-coquelicot/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              />
              <motion.div
                className="absolute -bottom-4 -right-4 h-full w-full rounded-lg bg-coquelicot/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              />
              <img
                src="EM-icon.png"
                alt="Electrician at work"
                className="relative h-full w-full rounded-lg object-cover shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={`py-16 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className={`mb-4 text-3xl font-bold ${isDark ? 'text-white' : 'text-silver-100'}`}>{t('services.title', { ns: 'home' })}</h2>
            <p className={`mx-auto max-w-2xl ${isDark ? 'text-gray-300' : 'text-silver-200'}`}>
              {t('services.description', { ns: 'home' })}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                className={`rounded-lg p-6 shadow-md transition-all ${isDark ? 'bg-gray-800 hover:shadow-coquelicot/20 hover:shadow-lg' : 'bg-white hover:-translate-y-2'}`}
              >
                <div className={`mb-4 rounded-full p-3 inline-block ${isDark ? 'bg-gray-700' : 'bg-isabelline'}`}>
                  {service.icon}
                </div>
                <h3 className={`mb-3 text-xl font-semibold ${isDark ? 'text-white' : 'text-silver-100'}`}>{service.title}</h3>
                <p className={isDark ? 'text-gray-300' : 'text-silver-200'}>{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 ${isDark ? 'bg-gray-800' : 'bg-timberwolf-400'}`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 50 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className={`h-20 w-20 mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-white'}`}
            >
              <FaBolt className="h-10 w-10 text-coquelicot" />
            </motion.div>
            <h2 className={`mb-6 text-3xl font-bold ${isDark ? 'text-white' : 'text-silver-100'}`}>{t('cta.title', { ns: 'home' })}</h2>
            <p className={`mb-8 max-w-2xl ${isDark ? 'text-gray-300' : 'text-silver-200'}`}>
              {t('cta.description', { ns: 'home' })}
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/contact"
                className="rounded-md bg-coquelicot px-8 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:bg-coquelicot-600 hover:shadow-xl"
              >
                {t('cta.button', { ns: 'home' })}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-16 ${isDark ? 'bg-gray-900' : ''}`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className={`mb-4 text-3xl font-bold ${isDark ? 'text-white' : 'text-silver-100'}`}>{t('testimonials.title', { ns: 'home' })}</h2>
            <p className={`mx-auto max-w-2xl ${isDark ? 'text-gray-300' : 'text-silver-200'}`}>
              {t('testimonials.description', { ns: 'home' })}
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className={`rounded-lg p-6 shadow-md ${isDark ? 'bg-gray-800 hover:shadow-coquelicot/20 hover:shadow-lg' : 'bg-white'}`}
              >
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.3, duration: 0.5, type: 'spring' }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-coquelicot text-white rounded-full flex items-center justify-center z-10"
                >
                  <FaStar size={12} />
                </motion.div>
                <div className="mb-4 flex items-center relative">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-14 w-14 rounded-full border-2 border-coquelicot"
                  />
                  <div className="ml-4">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-silver-100'}`}>{testimonial.name}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-silver-300'}`}>{testimonial.role}</p>
                  </div>
                </div>
                <p className={`${isDark ? 'text-gray-300' : 'text-silver-200'} italic`}>"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
