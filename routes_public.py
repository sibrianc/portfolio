# routes_public.py
# routes_public.py (adding language switch route)
from flask import render_template, request, abort, Blueprint, redirect, url_for, session, flash, current_app
from models import db, Project, ContactMessage
from forms import ContactForm
from flask_mail import Message


# NOTE: Lightweight module registration
def register(app):
    @app.get("/")
    def index():
        # NOTE: Show featured projects on homepage
        featured = Project.query.filter_by(is_featured=True).order_by(Project.created_at.desc()).limit(3).all()
        return render_template("main/index.html", featured=featured)

    @app.get("/about")
    def about():
        return render_template("main/about.html")

    @app.get("/projects")
    def projects_list():
        # NOTE: Simple filter by tech string
        tech = request.args.get("tech", type=str)
        q = Project.query
        if tech:
            q = q.filter(Project.tech_stack.ilike(f"%{tech}%"))
        projects = q.order_by(Project.created_at.desc()).all()
        return render_template("projects/list.html", projects=projects, tech=tech)

    @app.get("/projects/<string:slug>")
    def project_detail(slug: str):
        project = Project.query.filter_by(slug=slug).first()
        if not project:
            abort(404)
        return render_template("projects/detail.html", project=project)

    @app.route("/contact", methods=["GET", "POST"])
    def contact():
        form = ContactForm()
        if form.validate_on_submit():
            # 1) Guardar en BD
            msg_row = ContactMessage(
                name=form.name.data.strip(),
                email=form.email.data.strip(),
                message=form.message.data.strip(),
            )
            db.session.add(msg_row)
            db.session.commit()

            # 2) Enviar correo (si está configurado)
            try:
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
                flash("Tu mensaje fue recibido, pero hubo un problema al enviar el correo de notificación.", "warning")

            # 3) Volver a renderizar la página actual con mensaje de éxito
            return render_template("contact/contact.html", form=ContactForm(), success=True)

        # GET o validación fallida
        return render_template("contact/contact.html", form=form)
    
    @app.route("/switch_lang/<string:code>")
    def switch_lang(code):
        """Switch site language and redirect back."""
        if code in ("en", "es"):
            session["lang"] = code
        # Redirect to the page the user came from, or home if not available
        return redirect(request.referrer or url_for('index'))
    
    
