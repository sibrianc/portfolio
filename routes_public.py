# routes_public.py
# routes_public.py (adding language switch route)
from flask import render_template, request, abort, Blueprint, redirect, url_for, session  # added redirect, url_for, session
from models import db, Project, ContactMessage
from forms import ContactForm

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
        # NOTE: Persist messages for later follow-up
        form = ContactForm()
        if form.validate_on_submit():
            msg = ContactMessage(
                name=form.name.data.strip(),
                email=form.email.data.strip(),
                message=form.message.data.strip(),
            )
            db.session.add(msg)
            db.session.commit()
            return render_template("contact/contact.html", form=form, success=True)
        return render_template("contact/contact.html", form=form)
    
    @app.route("/switch_lang/<string:code>")
    def switch_lang(code):
        """Switch site language and redirect back."""
        if code in ("en", "es"):
            session["lang"] = code
        # Redirect to the page the user came from, or home if not available
        return redirect(request.referrer or url_for('index'))
    
    
