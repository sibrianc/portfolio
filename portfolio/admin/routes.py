# routes_admin.py
import os
from flask import render_template, redirect, url_for, request, abort, flash, current_app, make_response
from flask_login import login_user, current_user, login_required, logout_user
from functools import wraps
from portfolio.models import db, User, Project, ContactMessage
from portfolio.forms import AdminLoginForm, ProjectForm
# 1. IMPORTACIÓN NUEVA PARA MANEJAR EL ERROR
from sqlalchemy.exc import IntegrityError

def admin_only(f):
    # NOTE: Guard decorator to ensure admin-only access
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated or not getattr(current_user, "is_admin", False):
            return abort(403)
        return f(*args, **kwargs)
    return wrapper

def register(app):
    # Leemos la variable de entorno, con default seguro
    raw_login_path = os.getenv("ADMIN_LOGIN_PATH", "/admin/login") or "/admin/login"

    # Normalizamos: cambiamos backslashes por slashes y quitamos espacios
    login_path = raw_login_path.replace("\\", "/").strip()

    if ":" in login_path or not login_path.startswith("/"):
        login_path = "/admin/login"

    # --- CONFIGURACIÓN SEGURA DEL RATE LIMITER ---
    limiter = app.extensions.get("limiter")

    # Helper robusto: verifica que limiter exista Y que tenga el método .limit()
    def limit_rate(limit_string):
        if limiter and hasattr(limiter, "limit"):
            return limiter.limit(limit_string)
        # Si limiter es None o es un 'set' (error común), no aplicamos límite pero NO rompemos la app
        return lambda f: f

    # --- RUTAS ---

    @app.route(login_path, methods=["GET", "POST"])
    @limit_rate("5 per 10 minutes") 
    def admin_login():
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
        
        # Redirección normal
        response = make_response(redirect(url_for("index")))
        
        # HEADER NUCLEAR: Ordena al navegador borrar caché y cookies de sesión
        response.headers["Clear-Site-Data"] = '"cache", "cookies", "storage"'
        
        return response

    @app.get("/admin")
    @admin_only
    def admin_dashboard():
        projects = Project.query.order_by(Project.created_at.desc()).all()
        return render_template("admin/dashboard.html", projects=projects)

    @app.route("/admin/projects/new", methods=["GET", "POST"])
    @admin_only
    def admin_project_new():
        form = ProjectForm()
        if form.validate_on_submit():
            p = Project()
            form.populate_obj(p)
            db.session.add(p)
            
            # 2. BLOQUE DE SEGURIDAD (TRY/EXCEPT)
            try:
                db.session.commit()
                flash("Project created.", "success")
                return redirect(url_for("admin_dashboard"))
            except IntegrityError:
                db.session.rollback() # Revertir cambios si falla
                flash("Error: The slug is already in use. Please choose a different one.", "danger")
                
        return render_template("admin/project_form.html", form=form, project=None)

    @app.route("/admin/projects/<int:pid>/edit", methods=["GET", "POST"])
    @admin_only
    def admin_project_edit(pid: int):
        p = db.session.get(Project, pid) or abort(404)
        form = ProjectForm(obj=p)
        if form.validate_on_submit():
            form.populate_obj(p)
            
            # 3. BLOQUE DE SEGURIDAD TAMBIÉN AQUÍ
            try:
                db.session.commit()
                flash("Project updated.", "success")
                return redirect(url_for("admin_dashboard"))
            except IntegrityError:
                db.session.rollback()
                flash("Error: The slug is already in use by another project.", "danger")
                
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
        messages = ContactMessage.query.order_by(ContactMessage.processed.asc(),
                                                 ContactMessage.created_at.desc()).all()
        return render_template("admin/messages.html", messages=messages)

    @app.post("/admin/messages/<int:mid>/toggle")
    @admin_only
    def admin_message_toggle(mid: int):
        msg = db.session.get(ContactMessage, mid) or abort(404)
        msg.processed = not msg.processed
        db.session.commit()
        flash("Message processed updated.", "info")
        return redirect(url_for("admin_messages"))

    @app.post("/admin/messages/<int:mid>/delete")
    @admin_only
    def admin_message_delete(mid: int):
        msg = db.session.get(ContactMessage, mid) or abort(404)
        db.session.delete(msg)
        db.session.commit()
        flash("Message deleted.", "info")
        return redirect(url_for("admin_messages"))