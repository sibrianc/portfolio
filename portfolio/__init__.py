import os
from datetime import timedelta
from flask import Flask, session, request, g, flash, redirect, url_for
from dotenv import load_dotenv

load_dotenv()

from flask_bootstrap import Bootstrap5
from flask_wtf.csrf import CSRFError
# from flask_mail import Mail # Removed
from .extensions import db, migrate, login_manager, csrf, mail, limiter
from .models import User
from .public import bp as public_bp
from .admin import bp as admin_bp

def create_app() -> Flask:
    # --- Base config ---
    app = Flask(__name__, instance_relative_config=True)
    os.makedirs(app.instance_path, exist_ok=True)

    app.config["SECRET_KEY"] = os.getenv("FLASK_KEY", "change-me")

    # DB Config
    db_path = os.path.join(app.instance_path, "portfolio.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DB_URI", f"sqlite:///{db_path}")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # --- CONFIGURACIÓN EMAIL (SOLUCIÓN APLICADA) ---
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    
    # FIX: Aceptar '1', 'true', 'True' como verdadero para activar TLS correctamente
    tls_val = os.getenv('MAIL_USE_TLS', 'True').lower()
    app.config['MAIL_USE_TLS'] = tls_val in ['true', '1', 'yes', 'on']
    
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', '').replace(' ', '')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', app.config['MAIL_USERNAME'])
    app.config['CONTACT_RECIPIENT'] = os.getenv('CONTACT_RECIPIENT', app.config['MAIL_USERNAME'])

    # --- SEGURIDAD DE SESIÓN ---
    app.config["SESSION_PERMANENT"] = False 
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=30)
    app.config["SESSION_COOKIE_SECURE"] = False 
    app.config["SESSION_COOKIE_HTTPONLY"] = True 

    print("DB URI ->", app.config["SQLALCHEMY_DATABASE_URI"])
    print(f"📧 Mail Config: TLS={app.config['MAIL_USE_TLS']}, User={app.config['MAIL_USERNAME']}") # Debug print

    # --- Extensions ---
    Bootstrap5(app)
    csrf.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db, directory=os.path.join(app.root_path, 'migrations'))
    mail.init_app(app)
    
    # Rate Limiter
    limiter.init_app(app)

    # --- Login manager ---
    login_manager.login_view = "admin.admin_login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    # --- MANEJO DE ERROR CSRF (NUEVO) ---
    # Si el token expira, redirige suavemente al contacto con un aviso
    @app.errorhandler(CSRFError)
    def handle_csrf_error(e):
        flash("La sesión del formulario ha expirado. Por favor intenta de nuevo.", "error")
        return redirect(url_for('public.contact'))

    # --- Register routes ---
    app.register_blueprint(public_bp)
    app.register_blueprint(admin_bp)
    
    # --- Internationalization ---
    from .translations import TRANSLATIONS
    
    @app.context_processor
    def inject_lang():
        def current_lang():
            return session.get('lang', 'en')
        def t(key):
            lang = session.get('lang', 'en')
            return TRANSLATIONS.get(lang, {}).get(key, key)
        return {'current_lang': current_lang, 't': t}

    # --- CLI: create admin ---
    @app.cli.command("create-admin")
    def create_admin():
        """Create or update an admin user from ENV variables."""
        email = os.getenv("ADMIN_EMAIL")
        password = os.getenv("ADMIN_PASSWORD")
        name = os.getenv("ADMIN_NAME", "Admin")
        if not email or not password:
            print("Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment.")
            return
        user = db.session.execute(db.select(User).where(User.email == email)).scalar()
        if not user:
            user = User(email=email, name=name, is_admin=True)
            user.set_password(password)
            db.session.add(user)
        else:
            user.is_admin = True
            user.set_password(password)
        db.session.commit()
        print(f"Admin ready: {email}")

    # --- ANTI-CACHÉ Y SEGURIDAD ---
    @app.after_request
    def add_security_headers(response):
        # 1. Protección Anti-Caché para Admin
        if request.path.startswith("/admin"):
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        
        # 2. Protección Global
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        
        return response

    return app