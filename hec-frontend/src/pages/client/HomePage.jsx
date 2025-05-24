import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBolt, FaLightbulb, FaTools, FaShieldAlt } from 'react-icons/fa';

const HomePage = () => {
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
      transition: { duration: 0.5 }
    }
  };

  // Services data
  const services = [
    {
      icon: <FaBolt className="h-8 w-8 text-coquelicot" />,
      title: 'Electrical Installations',
      description: 'Complete electrical installation services for residential, commercial, and industrial properties.',
    },
    {
      icon: <FaLightbulb className="h-8 w-8 text-coquelicot" />,
      title: 'Energy Solutions',
      description: 'Sustainable and efficient energy solutions including solar panels and smart energy systems.',
    },
    {
      icon: <FaTools className="h-8 w-8 text-coquelicot" />,
      title: 'Maintenance & Repair',
      description: 'Professional maintenance and repair services for all your electrical systems and equipment.',
    },
    {
      icon: <FaShieldAlt className="h-8 w-8 text-coquelicot" />,
      title: 'Security Systems',
      description: 'Advanced security systems including alarms, CCTV, and access control for your property.',
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Homeowner',
      image: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=fe3201&color=fff',
      text: 'HEC provided excellent service for our home electrical renovation. Professional, punctual, and high-quality work.',
    },
    {
      name: 'Michael Brown',
      role: 'Business Owner',
      image: 'https://ui-avatars.com/api/?name=Michael+Brown&background=fe3201&color=fff',
      text: 'We hired HEC for our office electrical maintenance and they exceeded our expectations. Highly recommended!',
    },
    {
      name: 'David Wilson',
      role: 'Project Manager',
      image: 'https://ui-avatars.com/api/?name=David+Wilson&background=fe3201&color=fff',
      text: 'Their team is professional and knowledgeable. They completed our large-scale project on time and within budget.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-timberwolf-300 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center md:flex-row md:justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-10 max-w-lg md:mb-0"
            >
              <h1 className="mb-6 text-4xl font-bold leading-tight text-silver-100 md:text-5xl">
                Reliable Electrical Services for Your Home & Business
              </h1>
              <p className="mb-8 text-lg text-silver-200">
                Hammemi Electricity Concept provides professional electrical services with quality workmanship and excellent customer service.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/projects"
                  className="rounded-md bg-coquelicot px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-coquelicot-600"
                >
                  Our Projects
                </Link>
                <Link
                  to="/contact"
                  className="rounded-md border border-silver-300 bg-transparent px-6 py-3 font-medium text-silver-100 shadow-md transition-colors hover:bg-silver-200 hover:text-white"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative h-64 w-full max-w-md md:h-96"
            >
              <div className="absolute inset-0 rounded-lg bg-coquelicot opacity-10"></div>
              <img
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80"
                alt="Electrical Services"
                className="h-full w-full rounded-lg object-cover shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/600x400?text=HEC+Electrical+Services';
                }}
              />
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
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-silver-100">Our Services</h2>
            <p className="mx-auto max-w-2xl text-silver-200">
              We offer a wide range of electrical services for residential, commercial, and industrial clients. Our experienced team ensures quality workmanship on every project.
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
                className="rounded-lg bg-white p-6 shadow-md transition-transform hover:-translate-y-2"
              >
                <div className="mb-4 rounded-full bg-isabelline p-3 inline-block">
                  {service.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-silver-100">{service.title}</h3>
                <p className="text-silver-200">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-timberwolf-400 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center"
          >
            <h2 className="mb-6 text-3xl font-bold text-silver-100">Ready to start your project?</h2>
            <p className="mb-8 max-w-2xl text-silver-200">
              Whether you need a small repair or a complete electrical installation, we're here to help. Contact us today for a free consultation and quote.
            </p>
            <Link
              to="/contact"
              className="rounded-md bg-coquelicot px-8 py-3 font-medium text-white shadow-lg transition-colors hover:bg-coquelicot-600"
            >
              Get a Free Quote
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-silver-100">What Our Clients Say</h2>
            <p className="mx-auto max-w-2xl text-silver-200">
              Don't just take our word for it. Here's what our satisfied clients have to say about our services.
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
                className="rounded-lg bg-white p-6 shadow-md"
              >
                <div className="mb-4 flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="ml-4">
                    <h4 className="font-semibold text-silver-100">{testimonial.name}</h4>
                    <p className="text-sm text-silver-300">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-silver-200">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
