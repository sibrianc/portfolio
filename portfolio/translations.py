# translations.py - Centralized translation dictionary
"""
Bilingual translation system for the portfolio.
Add new keys here and they will automatically work with the t() function.
"""

TRANSLATIONS = {
    'en': {
        # Navigation
        'brand_left': 'CARLOS',
        'brand_right': '_SIBRIAN',
        'home': 'Home',
        'about': 'About',
        'projects': 'Projects',
        'contact': 'Contact',
        'cta': 'Contact Me',
        
        # Hero
        'hero_tagline': 'Developer building modern web experiences with Flask, Bootstrap and JS.',
        'featured_projects': 'Featured Projects',
        
        # Contact Form
        'form_name': 'Name',
        'form_email': 'Email',
        'form_message': 'Message',
        'form_send': 'Send',
        'contact_title': 'Contact',
        'contact_subtitle': "Let's talk about your next project",
        'contact_description': 'Have an innovative idea or need help with development? This is the fastest way to contact me directly.',
        
        # Projects
        'search_placeholder': 'Search protocol (e.g. Python, React)...',
        'no_projects': 'DATA NOT FOUND',
        'reset_filters': 'RESET FILTERS',
        'project_details': 'Project Details',
        'tech_stack': 'Tech Stack',
        'access': 'Access',
        'live_demo': 'Live Demo',
        'source_code': 'Source Code',
        'initialize': 'INITIALIZE >>',
        'explore': 'EXPLORE >>',
        
        # About
        'about_tagline': 'Architecting digital',
        'about_tagline_bold': 'experiences',
        'about_description_1': 'Hello, I\'m Carlos. From El Salvador, I build bridges between complex logic and visual design.',
        'about_description_2': 'My approach combines the robustness of software engineering with the fluidity of modern interfaces.',
        'tech_arsenal': 'Tech Arsenal',
        'full_stack_developer': 'Full Stack Developer',
        
        # Admin
        'admin_login': 'Admin Login',
        'admin_dashboard': 'Admin Dashboard',
        'view_messages': 'View Messages',
        'new_project': 'New Project',
        'logout': 'Logout',
        'edit': 'Edit',
        'delete': 'Delete',
        'view': 'View',
        'save': 'Save',
        'create': 'Create',
        'cancel': 'Cancel',
        
        # Messages
        'success': 'Success',
        'error': 'Error',
        'message_sent': 'Your message has been sent successfully!',
        'message_error': 'There was an error sending your message. Please try again.',
        'csrf_expired': 'Session expired. Please try again.',
        'required_fields': 'Please fill in all required fields.',
        
        # Footer
        'copyright': '© 2026 Carlos Sibrian',
    },
    'es': {
        # Navegación
        'brand_left': 'CARLOS',
        'brand_right': '_SIBRIAN',
        'home': 'Inicio',
        'about': 'Sobre mí',
        'projects': 'Proyectos',
        'contact': 'Contacto',
        'cta': 'Contáctame',
        
        # Hero
        'hero_tagline': 'Desarrollador creando experiencias web modernas con Flask, Bootstrap y JS.',
        'featured_projects': 'Proyectos Destacados',
        
        # Formulario de Contacto
        'form_name': 'Nombre',
        'form_email': 'Correo',
        'form_message': 'Mensaje',
        'form_send': 'Enviar',
        'contact_title': 'Contacto',
        'contact_subtitle': 'Hablemos de tu próximo proyecto',
        'contact_description': '¿Tienes una idea innovadora o necesitas ayuda con desarrollo? Este es el canal más rápido para contactarme directamente.',
        
        # Proyectos
        'search_placeholder': 'Buscar protocolo (ej. Python, React)...',
        'no_projects': 'NO SE ENCONTRARON DATOS',
        'reset_filters': 'RESTABLECER FILTROS',
        'project_details': 'Detalles del Proyecto',
        'tech_stack': 'Stack Tecnológico',
        'access': 'Acceso',
        'live_demo': 'Demo en Vivo',
        'source_code': 'Código Fuente',
        'initialize': 'INICIAR >>',
        'explore': 'EXPLORAR >>',
        
        # Sobre mí
        'about_tagline': 'Arquitectando',
        'about_tagline_bold': 'experiencias digitales',
        'about_description_1': 'Hola, soy Carlos. Desde El Salvador, construyo puentes entre la lógica compleja y el diseño visual.',
        'about_description_2': 'Mi enfoque combina la robustez de la ingeniería de software con la fluidez de las interfaces modernas.',
        'tech_arsenal': 'Arsenal Tecnológico',
        'full_stack_developer': 'Desarrollador Full Stack',
        
        # Admin
        'admin_login': 'Inicio de Sesión',
        'admin_dashboard': 'Panel de Administración',
        'view_messages': 'Ver Mensajes',
        'new_project': 'Nuevo Proyecto',
        'logout': 'Cerrar Sesión',
        'edit': 'Editar',
        'delete': 'Eliminar',
        'view': 'Ver',
        'save': 'Guardar',
        'create': 'Crear',
        'cancel': 'Cancelar',
        
        # Mensajes
        'success': 'Éxito',
        'error': 'Error',
        'message_sent': '¡Tu mensaje ha sido enviado exitosamente!',
        'message_error': 'Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.',
        'csrf_expired': 'Sesión expirada. Por favor intenta de nuevo.',
        'required_fields': 'Por favor completa todos los campos requeridos.',
        
        # Footer
        'copyright': '© 2026 Carlos Sibrian',
    }
}
