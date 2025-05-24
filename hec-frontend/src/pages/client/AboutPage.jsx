import React from 'react';
import { motion } from 'framer-motion';
import { FaBolt, FaBuilding, FaTools, FaHammer, FaLightbulb } from 'react-icons/fa';

const AboutPage = () => {
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
        duration: 0.5
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
    <div className="bg-white min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
            alt="Electricity background"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">À Propos de HEC TUNISIA</h1>
            <p className="text-xl text-gray-700 mb-8">
              Nous sommes spécialisés dans les travaux d'électricité industrielle, la construction de centrales et réseaux électriques, et la maintenance électrique.
            </p>
            <div className="flex justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-coquelicot text-white rounded-md font-medium shadow-lg hover:bg-coquelicot-600 transition-colors"
              >
                Contactez-nous
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <img 
                src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt="Electrical workers"
                className="rounded-lg shadow-xl w-full"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Notre Histoire</h2>
              <p className="text-gray-600 mb-4">
                Depuis notre création, HEC TUNISIA s'est établi comme leader dans le secteur de l'électricité en Tunisie. Notre expertise technique et notre engagement envers l'excellence nous ont permis de réaliser avec succès de nombreux projets d'envergure.
              </p>
              <p className="text-gray-600 mb-4">
                Nous combinons des années d'expérience avec les technologies les plus récentes pour offrir des solutions électriques innovantes et durables. Notre équipe qualifiée assure un service de première qualité, respectant les normes internationales.
              </p>
              <p className="text-gray-600">
                HEC TUNISIA est fière de contribuer au développement de l'infrastructure électrique tunisienne, en participant activement à l'amélioration du réseau électrique national.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Nos Services</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
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
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Notre Équipe</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
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
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <img 
                  src={`https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${index + 40}.jpg`}
                  alt="Team member" 
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {index === 0 ? "Mohamed Hammemi" : 
                     index === 1 ? "Samira Taleb" : 
                     index === 2 ? "Karim Bouzid" : "Leila Mansour"}
                  </h3>
                  <p className="text-gray-600 text-sm">
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
      <section className="py-16 bg-coquelicot text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Prêt à Transformer Votre Projet Électrique?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Découvrez comment notre expertise peut vous aider à réaliser vos projets avec efficacité et professionnalisme.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-coquelicot rounded-md font-medium shadow-lg hover:bg-gray-100 transition-colors"
            >
              Demander un Devis
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
