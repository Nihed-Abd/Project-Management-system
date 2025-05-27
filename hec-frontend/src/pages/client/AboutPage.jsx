import React from 'react';
import { motion } from 'framer-motion';
import { FaBolt, FaBuilding, FaTools, FaHammer, FaLightbulb, FaUsers, FaStar } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const AboutPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 100
      }
    }
  };
  
  // Enhanced animation for floating elements
  const floatAnimation = {
    hidden: { y: 0, opacity: 0 },
    visible: { 
      y: [0, -10, 0], 
      opacity: 1,
      transition: {
        y: {
          repeat: Infinity,
          duration: 3,
          ease: 'easeInOut'
        }
      }
    }
  };

  const serviceItems = [
    {
      icon: <FaBolt className="h-10 w-10 text-coquelicot" />,
      title: "Électricité Industrielle",
      description: "Installations électriques sur mesure pour sites industriels avec solutions d'automatisation et de contrôle."
    },
    {
      icon: <FaBuilding className="h-10 w-10 text-coquelicot" />,
      title: "Centrales Électriques",
      description: "Construction et maintenance de centrales électriques, avec un accent sur l'efficacité et la fiabilité."
    },
    {
      icon: <FaTools className="h-10 w-10 text-coquelicot" />,
      title: "Maintenance Électrique",
      description: "Services complets de maintenance préventive et corrective pour tous systèmes électriques."
    },
    {
      icon: <FaLightbulb className="h-10 w-10 text-coquelicot" />,
      title: "Solutions Éclairage",
      description: "Conception et installation de systèmes d'éclairage économiques et écologiques pour tout espace."
    },
    {
      icon: <FaHammer className="h-10 w-10 text-coquelicot" />,
      title: "Construction Réseaux",
      description: "Mise en place de réseaux électriques complets pour projets résidentiels et commerciaux."
    }
  ];

  return (
    <div className={`min-h-screen pt-24 ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
            alt="Electricity background"
            className={`w-full h-full object-cover ${isDark ? 'opacity-5' : 'opacity-10'}`}
          />
        </div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 50 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              variants={floatAnimation}
              initial="hidden"
              animate="visible"
              className={`mb-6 inline-block p-3 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <FaBolt className="h-10 w-10 text-coquelicot" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              À Propos de HEC TUNISIA
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Nous sommes spécialisés dans les travaux d'électricité industrielle, la construction de centrales et réseaux électriques, et la maintenance électrique.
            </motion.p>
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(254, 50, 1, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-coquelicot text-white rounded-md font-medium shadow-lg hover:bg-coquelicot-600 transition-all duration-300"
              >
                Contactez-nous
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Company Overview */}
      <section className={`py-16 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, type: 'spring', stiffness: 50 }}
              viewport={{ once: true }}
              className="flex-1 relative"
            >
              <motion.div 
                className="absolute -top-4 -left-4 h-full w-full rounded-lg bg-coquelicot/10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
              <img 
                src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt="Electrical workers"
                className="rounded-lg shadow-xl w-full relative z-10"
              />
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-coquelicot/80 text-white p-4 rounded-full shadow-lg"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
              >
                <FaStar className="h-8 w-8" />
              </motion.div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, type: 'spring', stiffness: 50 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>Notre Histoire</h2>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Fondée en 2010, Hammemi Electricity Concept (HEC) est devenue une référence dans le domaine des installations électriques en Tunisie. Notre engagement envers l'excellence technique et le service client nous a permis de construire une réputation solide.
              </p>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Avec plus de 500 projets réalisés avec succès, notre équipe de 25 experts qualifiés apporte des solutions innovantes et efficaces pour tous types de projets électriques.
              </p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Notre expertise couvre tous les aspects des installations électriques, des petits travaux résidentiels aux grands projets industriels, en passant par la maintenance préventive et corrective.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={`py-16 ${isDark ? 'bg-gray-900' : ''}`}>
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Nos Services</h2>
            <p className={`max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Nous offrons une gamme complète de services électriques pour répondre à tous vos besoins, qu'ils soient résidentiels, commerciaux ou industriels.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {serviceItems.map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className={`p-6 rounded-lg shadow-md transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700 hover:shadow-coquelicot/20 hover:shadow-xl' : 'bg-white hover:shadow-lg border border-gray-100'}`}
              >
                <div className="mb-4">{service.icon}</div>
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{service.title}</h3>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className={`py-16 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.div
              className={`inline-block p-3 rounded-full mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <FaUsers className="h-8 w-8 text-coquelicot" />
            </motion.div>
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Notre Équipe</h2>
            <p className={`max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Notre force réside dans notre équipe d'experts passionnés, dédiés à offrir des solutions électriques exceptionnelles.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {Array(4).fill().map((_, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className={`rounded-lg overflow-hidden shadow-md transition-all duration-300 ${isDark ? 'bg-gray-800 border border-gray-700 hover:shadow-coquelicot/20 hover:shadow-xl' : 'bg-white hover:shadow-lg'}`}
              >
                <div className="relative">
                  <img 
                    src={`https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${index + 40}.jpg`}
                    alt="Team member" 
                    className="w-full h-64 object-cover"
                  />
                  <div className={`absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300 ${isDark ? 'bg-coquelicot' : 'bg-coquelicot'}`}></div>
                </div>
                <div className="p-4">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {index === 0 ? "Mohamed Hammemi" : 
                     index === 1 ? "Samira Taleb" : 
                     index === 2 ? "Karim Bouzid" : "Leila Mansour"}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {index === 0 ? "Directeur Général" : 
                     index === 1 ? "Responsable Technique" : 
                     index === 2 ? "Ingénieur Électrique" : "Chef de Projet"}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 relative overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-coquelicot/90 to-gray-900' : 'bg-coquelicot'}`}></div>
        
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10"
          initial={{ y: -100, x: 100, opacity: 0 }}
          whileInView={{ y: 0, x: 0, opacity: 0.1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          viewport={{ once: true }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white opacity-10"
          initial={{ y: 100, x: -100, opacity: 0 }}
          whileInView={{ y: 0, x: 0, opacity: 0.1 }}
          transition={{ duration: 0.8, type: 'spring', delay: 0.2 }}
          viewport={{ once: true }}
        />
        
        <div className="container mx-auto px-4 text-center relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 50 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-3xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              Prêt à Transformer Votre Projet Électrique?
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
            >
              Découvrez comment notre expertise peut vous aider à réaliser vos projets avec efficacité et professionnalisme.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(255, 255, 255, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-coquelicot rounded-md font-medium shadow-lg hover:bg-gray-100 transition-all duration-300"
              >
                Demander un Devis
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
