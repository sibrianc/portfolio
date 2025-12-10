# routes_admin.py
import os
from flask import render_template, redirect, url_for, request, abort, flash, current_app
from flask_login import login_user, current_user, login_required, logout_user
from functools import wraps
from models import db, User, Project, ContactMessage
from forms import AdminLoginForm, ProjectForm

def admin_only(f):
    # NOTE: Guard decorator to ensure admin-only access
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated or not getattr(current_user, "is_admin", False):
            return abort(403)
        return f(*args, **kwargs)
    return wrapper

def register(app):
    # Por ahora, ruta fija para evitar problemas con Windows/Git
    login_path = "/admin/login"


    @app.route(login_path, methods=["GET", "POST"])
    def admin_login():
        # --- attach rate limit to admin_login dynamically (5 intentos / 10 minutos por IP) ---
        limiter = app.extensions.get('limiter')
        if limiter:
            app.view_functions['admin_login'] = limiter.limit("5 per 10 minutes")(app.view_functions['admin_login'])
        # NOTE: Minimal admin-only login
        form = AdminLoginForm()
        if form.validate_on_submit():
            user = db.session.execute(db.select(User).where(User.email == form.email.data)).scalar()
            if not user or not user.check_password(form.password.data) or not user.is_admin:
                flash("Invalid credentials.", "danger")
                return redirect(login_path)
            login_user(user)
            return redirect(url_for("admin_dashboard"))
        return render_template("admin/login.html", form=form)

    @app.get("/admin/logout")
    @login_required
    def admin_logout():
        logout_user()
        flash("Logged out.", "info")
        return redirect(url_for("index"))

    @app.get("/admin")
    @admin_only
    def admin_dashboard():
        # NOTE: Simple admin dashboard listing projects
        projects = Project.query.order_by(Project.created_at.desc()).all()
        return render_template("admin/dashboard.html", projects=projects)

    @app.route("/admin/projects/new", methods=["GET", "POST"])
    @admin_only
    def admin_project_new():
        form = ProjectForm()
        if form.validate_on_submit():
            p = Project()
            form.populate_obj(p)  # NOTE: Populate model directly from form fields
            db.session.add(p)
            db.session.commit()
            flash("Project created.", "success")
            return redirect(url_for("admin_dashboard"))
        return render_template("admin/project_form.html", form=form, project=None)

    @app.route("/admin/projects/<int:pid>/edit", methods=["GET", "POST"])
    @admin_only
    def admin_project_edit(pid: int):
        p = db.session.get(Project, pid) or abort(404)
        form = ProjectForm(obj=p)
        if form.validate_on_submit():
            form.populate_obj(p)
            db.session.commit()
            flash("Project updated.", "success")
            return redirect(url_for("admin_dashboard"))
        return render_template("admin/project_form.html", form=form, project=p)

    @app.post("/admin/projects/<int:pid>/delete")
    @admin_only
    def admin_project_delete(pid: int):
        p = db.session.get(Project, pid) or abort(404)
        db.session.delete(p)
        db.session.commit()
        flash("Project deleted.", "info")
        return redirect(url_for("admin_dashboard"))
    
    @app.get("/admin/messages")
    @admin_only
    def admin_messages():
        # List all contact form messages, unprocessed first
        messages = ContactMessage.query.order_by(ContactMessage.processed.asc(),
                                                 ContactMessage.created_at.desc()).all()
        return render_template("admin/messages.html", messages=messages)

    @app.post("/admin/messages/<int:mid>/toggle")
    @admin_only
    def admin_message_toggle(mid: int):
        # Toggle the processed status of a message
        msg = db.session.get(ContactMessage, mid) or abort(404)
        msg.processed = not msg.processed
        db.session.commit()
        flash("Message marked as processed." if msg.processed else "Message marked as not processed.", "info")
        return redirect(url_for("admin_messages"))

    @app.post("/admin/messages/<int:mid>/delete")
    @admin_only
    def admin_message_delete(mid: int):
        # Delete a contact message
        msg = db.session.get(ContactMessage, mid) or abort(404)
        db.session.delete(msg)
        db.session.commit()
        flash("Message deleted.", "info")
        return redirect(url_for("admin_messages"))
