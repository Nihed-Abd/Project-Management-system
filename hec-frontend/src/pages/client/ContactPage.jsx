import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiMessageCircle } from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useTranslation(['common', 'contact']);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const contactInfo = [
    {
      icon: <FiMapPin className="h-6 w-6 text-coquelicot" />,
      title: t('contact.address.label', { ns: 'contact' }),
      content: t('contact.address.value', { ns: 'contact' })
    },
    {
      icon: <FiPhone className="h-6 w-6 text-coquelicot" />,
      title: t('contact.phone.label', { ns: 'contact' }),
      content: t('contact.phone.value', { ns: 'contact' })
    },
    {
      icon: <FiMail className="h-6 w-6 text-coquelicot" />,
      title: t('contact.email.label', { ns: 'contact' }),
      content: t('contact.email.value', { ns: 'contact' })
    },
    {
      icon: <FiClock className="h-6 w-6 text-coquelicot" />,
      title: t('contact.hours.label', { ns: 'contact' }),
      content: t('contact.hours.value', { ns: 'contact' })
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Post to our new messages API endpoint
      await axios.post(`${process.env.REACT_APP_API_URL}/api/messages`, {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });
      
      // Show success message as requested
      Swal.fire({
        title: t('success.title', { ns: 'contact' }),
        text: t('success.message', { ns: 'contact' }),
        icon: 'success',
        confirmButtonColor: '#fe3201'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message
      Swal.fire({
        title: t('error.title', { ns: 'contact' }),
        text: t('error.message', { ns: 'contact' }),
        icon: 'error',
        confirmButtonColor: '#fe3201'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pt-24 pb-16 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Hero Section */}
      <section className="relative">
        <div className={`absolute inset-0 z-0 ${isDark ? 'bg-coquelicot opacity-10' : 'bg-coquelicot opacity-5'} pattern-diagonal-lines-sm`}></div>
        <div className="container mx-auto px-4 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              className={`inline-block p-3 rounded-full mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FiMessageCircle className="h-8 w-8 text-coquelicot" />
            </motion.div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('hero.title', { ns: 'contact' })}</h1>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('hero.description', { ns: 'contact' })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Contact Information */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="lg:w-2/5"
            >
              <div className={`p-8 rounded-xl h-full shadow-md ${isDark ? 'bg-gray-800 shadow-gray-700/10' : 'bg-gray-50'}`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('contact.title', { ns: 'contact' })}</h2>
                
                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <motion.div 
                      key={index} 
                      className="flex"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <div className={`flex-shrink-0 p-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {item.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.title}</h3>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className={`mt-8 pt-6 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('social.title', { ns: 'contact' })}</h3>
                  <div className="flex space-x-4">
                    <motion.a 
                      whileHover={{ y: -5, backgroundColor: '#fe3201', color: '#ffffff' }} 
                      transition={{ duration: 0.2 }}
                      href="#" 
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-coquelicot hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-coquelicot hover:text-white'}`} 
                      aria-label="Facebook"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
                    </motion.a>
                    <motion.a 
                      whileHover={{ y: -5, backgroundColor: '#fe3201', color: '#ffffff' }} 
                      transition={{ duration: 0.2 }}
                      href="#" 
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-coquelicot hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-coquelicot hover:text-white'}`} 
                      aria-label="Twitter"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                    </motion.a>
                    <motion.a 
                      whileHover={{ y: -5, backgroundColor: '#fe3201', color: '#ffffff' }} 
                      transition={{ duration: 0.2 }}
                      href="#" 
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-coquelicot hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-coquelicot hover:text-white'}`} 
                      aria-label="LinkedIn"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                    </motion.a>
                    <motion.a 
                      whileHover={{ y: -5, backgroundColor: '#fe3201', color: '#ffffff' }} 
                      transition={{ duration: 0.2 }}
                      href="#" 
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-coquelicot hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-coquelicot hover:text-white'}`} 
                      aria-label="Instagram"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="lg:w-3/5"
            >
              <div className={`p-8 rounded-xl shadow-md h-full ${isDark ? 'bg-gray-800 shadow-gray-700/10' : 'bg-white shadow-gray-200/50'}`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('form.title', { ns: 'contact' })}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('form.name', { ns: 'contact' })}</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border border-gray-300 text-gray-700 placeholder-gray-500'}`}
                        placeholder={t('form.name', { ns: 'contact' })}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('form.email', { ns: 'contact' })}</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border border-gray-300 text-gray-700 placeholder-gray-500'}`}
                        placeholder={t('form.email', { ns: 'contact' })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('form.subject', { ns: 'contact' })}</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border border-gray-300 text-gray-700 placeholder-gray-500'}`}
                      placeholder={t('form.subject', { ns: 'contact' })}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('form.message', { ns: 'contact' })}</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-transparent resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border border-gray-300 text-gray-700 placeholder-gray-500'}`}
                      placeholder={t('form.message', { ns: 'contact' })}
                    />
                  </div>
                  
                  <div>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full px-6 py-3 bg-coquelicot text-white rounded-md font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:ring-offset-2 transition-all duration-300 ${isDark ? 'hover:bg-coquelicot-600 disabled:bg-gray-700 focus:ring-offset-gray-800' : 'hover:bg-coquelicot-600 disabled:bg-coquelicot-300'}`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('form.sending', { ns: 'contact' })}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <FiSend className="mr-2" />
                          {t('form.send', { ns: 'contact' })}
                        </span>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            viewport={{ once: true }}
            className={`rounded-xl overflow-hidden shadow-lg h-96 ${isDark ? 'shadow-gray-800' : 'shadow-gray-200'}`}
          >
            <div className="relative w-full h-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102239.97813702574!2d10.117781566992186!3d36.794862538226204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd337f5e7ef543%3A0xd671924e714a0275!2sTunis!5e0!3m2!1sen!2stn!4v1621512316018!5m2!1sen!2stn"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="HEC Location"
                className={isDark ? 'grayscale brightness-75' : ''}
              ></iframe>
              {isDark && <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gray-900/20 to-transparent"></div>}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className={`py-12 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            viewport={{ once: true }}
          >
            <motion.div
              className={`inline-block p-3 rounded-full mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <FiPhone className="h-8 w-8 text-coquelicot" />
            </motion.div>
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Besoin d'une Solution Urgente?</h2>
            <p className={`mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Notre équipe de service d'urgence est disponible 24/7 pour répondre à vos besoins électriques urgents.
            </p>
            <motion.div 
              className={`inline-flex items-center justify-center text-white px-6 py-3 rounded-md font-medium shadow-md transition-all duration-300 ${isDark ? 'bg-coquelicot hover:bg-coquelicot-600 shadow-coquelicot/10' : 'bg-coquelicot hover:bg-coquelicot-600'}`}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(254, 50, 1, 0.3)' }}
              whileTap={{ y: 0 }}
            >
              <FiPhone className="mr-2" />
              +216 71 123 456
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
