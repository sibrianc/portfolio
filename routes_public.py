# routes_public.py
from flask import render_template, request, abort, redirect, url_for, session, flash, current_app
from models import db, Project, ContactMessage
from forms import ContactForm
from flask_mail import Message
from urllib.parse import urlparse # Import necesario para el parche de seguridad

# NOTE: Lightweight module registration
def register(app):
    
    # --- HELPER DE TRADUCCIÓN INYECTADO ---
    @app.context_processor
    def utility_processor():
        def get_loc_attr(obj, attr_name):
            """
            Si el idioma es español, intenta buscar el atributo con sufijo '_es'.
            Ej: get_loc_attr(project, 'title') -> busca project.title_es
            Si no existe o está vacío, devuelve el original (inglés).
            """
            lang = session.get('lang', 'en')
            if lang == 'es':
                # Buscamos si existe el campo traducido (ej: title_es)
                val = getattr(obj, f"{attr_name}_es", None)
                if val: return val
            # Si es inglés o no hay traducción, devolvemos el normal
            return getattr(obj, attr_name)

        return dict(get_loc_attr=get_loc_attr)
    # ---------------------------------------------

    @app.get("/")
    def index():
        # NOTE: Show featured projects on homepage
        featured = Project.query.filter_by(is_featured=True).order_by(Project.created_at.desc()).limit(3).all()
        return render_template("public/home.html", featured=featured)

    @app.get("/about")
    def about():
        return render_template("public/about.html")

    @app.get("/projects")
    def projects_list():
        # NOTE: Simple filter by tech string
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

    @app.route("/contact", methods=["GET", "POST"])
    def contact():
        form = ContactForm()
        
        if form.validate_on_submit():
            # --- 🛡️ TRAMPA ANTI-BOTS (Nivel Servidor) ---
            # El campo 'bot_catcher' es invisible para humanos.
            # Si tiene datos, es un bot tonto que llenó todo.
            if form.bot_catcher.data:
                print(f"🤖 BOT BLOQUEADO: IP {request.remote_addr}")
                # Le mentimos al bot diciendo que todo salió bien (Shadowban)
                # No guardamos nada en DB ni enviamos correo.
                return render_template("public/contact.html", form=ContactForm(), success=True)

            # --- PROCESO REAL PARA HUMANOS ---
            # 1) Guardar en BD
            try:
                msg_row = ContactMessage(
                    name=form.name.data.strip(),
                    email=form.email.data.strip(),
                    message=form.message.data.strip(),
                )
                db.session.add(msg_row)
                db.session.commit()

                # 2) Enviar correo (si está configurado)
                contact_recipient = current_app.config.get("CONTACT_RECIPIENT") or current_app.config.get("MAIL_USERNAME")
                mail_ext = current_app.extensions.get("mail")
                
                if contact_recipient and mail_ext:
                    m = Message(
                        subject="Nuevo mensaje desde tu portafolio",
                        recipients=[contact_recipient],
                        body=(
                            f"De: {form.name.data} <{form.email.data}>\n\n"
                            f"Mensaje:\n{form.message.data}\n\n"
                            f"(ID interno: {msg_row.id})"
                        )
                    )
                    mail_ext.send(m)
            
            except Exception as e:
                # Si falla el envío de correo, no le decimos al usuario para no asustarlo,
                # pero lo logueamos en el servidor. El mensaje ya está en la DB.
                print(f"⚠️ Error al enviar correo o guardar DB: {e}")

            # 3) Volver a renderizar la página limpia con mensaje de éxito
            return render_template("public/contact.html", form=ContactForm(), success=True)

        # GET o validación fallida (El JS debería haber atrapado esto antes, pero por si acaso)
        return render_template("public/contact.html", form=form)
    
    # --- RUTA SWITCH LANG ---
    @app.route("/switch_lang/<string:code>")
    def switch_lang(code):
        if code in ("en", "es"):
            session["lang"] = code
        
        # --- FIX DE SEGURIDAD: Evitar Open Redirect ---
        target = request.referrer
        if not target or urlparse(target).netloc != urlparse(request.host_url).netloc:
            target = url_for('index')
        # ----------------------------------------------
        
        return redirect(target)