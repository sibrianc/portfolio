import threading
import logging
from datetime import datetime, timedelta
from flask import render_template, request, abort, redirect, url_for, session, flash, current_app
from models import db, Project, ContactMessage
from forms import ContactForm
from flask_mail import Message
from urllib.parse import urlparse

# Configuración de Logger para ver errores en la terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- EMAIL ASÍNCRONO (HILO SECUNDARIO) ---
def send_async_email(app, msg):
    """
    Envía el correo en background. 
    Se ejecuta en un hilo separado para que el usuario no espere.
    """
    with app.app_context():
        try:
            mail = app.extensions.get("mail")
            if mail:
                mail.send(msg)
                logger.info(f"✅ [EMAIL] Enviado exitosamente a: {msg.recipients}")
            else:
                logger.warning("⚠️ [EMAIL] Extension Flask-Mail no encontrada.")
        except Exception as e:
            logger.error(f"❌ [EMAIL] Error crítico enviando correo: {e}")

def register(app, limiter=None):
    
    # --- HELPER DE TRADUCCIÓN ---
    @app.context_processor
    def utility_processor():
        def get_loc_attr(obj, attr_name):
            lang = session.get('lang', 'en')
            if lang == 'es':
                val = getattr(obj, f"{attr_name}_es", None)
                if val: return val
            return getattr(obj, attr_name)
        return dict(get_loc_attr=get_loc_attr)

    # --- RUTAS PÚBLICAS ---

    @app.get("/")
    def index():
        featured = Project.query.filter_by(is_featured=True).order_by(Project.created_at.desc()).limit(3).all()
        return render_template("public/home.html", featured=featured)

    @app.get("/about")
    def about():
        return render_template("public/about.html")

    @app.get("/projects")
    def projects_list():
        tech = request.args.get("tech", type=str)
        q = Project.query
        if tech:
            q = q.filter(Project.tech_stack.ilike(f"%{tech}%"))
        projects = q.order_by(Project.created_at.desc()).all()
        return render_template("public/projects/list.html", projects=projects, tech=tech)

    @app.get("/projects/<string:slug>")
    def project_detail(slug: str):
        project = Project.query.filter_by(slug=slug).first()
        if not project:
            abort(404)
        return render_template("public/projects/detail.html", project=project)

    # --- RUTA DE CONTACTO (LÓGICA PRINCIPAL) ---
    @app.route("/contact", methods=["GET", "POST"])
    def contact():
        # Aplicar Rate Limit manualmente si existe el objeto limiter
        if limiter:
            try:
                limiter.check()
            except Exception:
                pass # Si falla el check, dejamos pasar (o podrías manejar error 429)

        form = ContactForm()
        
        if form.validate_on_submit():
            # 1. TRAMPA ANTI-BOTS (Honeypot)
            if form.bot_catcher.data:
                logger.warning(f"🤖 [BOT] Detectado en honeypot IP: {request.remote_addr}")
                flash("Mensaje enviado correctamente.", "success") 
                return redirect(url_for('contact'))

            name = form.name.data.strip()
            email = form.email.data.strip()
            message = form.message.data.strip()

            # 2. ANTI-DUPLICADOS (Ventana de 2 minutos)
            duplicate_window = datetime.utcnow() - timedelta(minutes=2)
            existing = ContactMessage.query.filter(
                ContactMessage.email == email,
                ContactMessage.message == message,
                ContactMessage.created_at > duplicate_window
            ).first()

            if existing:
                logger.info(f"ℹ️ [DUPLICADO] Mensaje prevenido de {email}")
                flash("Mensaje enviado correctamente.", "success") 
                return redirect(url_for('contact'))

            # 3. PROCESAR MENSAJE REAL
            try:
                # A) Guardar en Base de Datos
                msg_row = ContactMessage(
                    name=name, 
                    email=email, 
                    message=message
                )
                db.session.add(msg_row)
                db.session.commit()
                logger.info(f"💾 [DB] Mensaje guardado ID: {msg_row.id}")

                # B) Enviar Correo (Hilo aparte)
                contact_recipient = current_app.config.get("CONTACT_RECIPIENT")
                
                if contact_recipient:
                    msg = Message(
                        subject=f"Portfolio: Mensaje de {name}",
                        recipients=[contact_recipient],
                        body=f"Nombre: {name}\nEmail: {email}\n\nMENSAJE:\n{message}",
                        reply_to=email
                    )
                    
                    # INICIAR HILO
                    # Pasamos `current_app._get_current_object()` para que el hilo tenga acceso a la config
                    threading.Thread(
                        target=send_async_email,
                        args=(current_app._get_current_object(), msg)
                    ).start()
                else:
                    logger.warning("⚠️ [CONFIG] CONTACT_RECIPIENT no definido en .env")
                
                # C) ÉXITO AL USUARIO
                flash("Mensaje enviado correctamente. Gracias por contactar.", "success")
                return redirect(url_for('contact'))

            except Exception as e:
                logger.error(f"❌ [CRITICAL] Error en ruta contact: {e}")
                db.session.rollback()
                flash("Error interno del servidor. Intenta mas tarde.", "error")
                return redirect(url_for('contact'))

        # Si hay errores de validación (WTForms)
        if form.errors:
            logger.info(f"⚠️ [VALIDACIÓN] Fallo en formulario: {form.errors}")
            flash("Por favor revisa los campos marcados.", "error")

        return render_template("public/contact.html", form=form)
    
    # --- CAMBIO DE IDIOMA ---
    @app.route("/switch_lang/<string:code>")
    def switch_lang(code):
        if code in ("en", "es"):
            session["lang"] = code
        
        # Redirección segura
        target = request.referrer
        if not target or urlparse(target).netloc != urlparse(request.host_url).netloc:
            target = url_for('index')
        return redirect(target)